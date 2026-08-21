import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 1. 假设这是你的 FAQ 向量化后的本地数据（实际项目可以存放在 JSON 或向量库中）
const faqDatabase = [
  { chunk: "Q1: What is BMMSS? A: BMMSS stands for Buckeyes Mathematical Modeling and Simulation Society...", vector: [...] },
  // ... 其他 19 个问题
];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message } = req.body;

    // 2. 将用户的输入转化为向量
    const embeddingResponse = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: message,
    });
    const userVector = embeddingResponse.embedding.values;

    // 3. 计算余弦相似度并检索最相关的前 2 个片段 (Top-2)
    // 实际开发中可用余弦相似度函数计算，这里简化逻辑
    const relevantChunks = findTopSimilarChunks(userVector, faqDatabase, 2);
    const topScore = relevantChunks[0]?.score || 0;

    let systemInstruction = "";
    const SIMILARITY_THRESHOLD = 0.70; // 设定阈值

    if (topScore >= SIMILARITY_THRESHOLD) {
      // 命中知识库
      const contextText = relevantChunks.map(c => c.chunk).join("\n\n");
      systemInstruction = `你现在是 BMMSS 的官方 AI 助手。请严格根据以下社团官方 FAQ 回答用户问题：\n${contextText}`;
    } else {
      // 未命中知识库，触发兜底策略
      systemInstruction = `你现在是 BMMSS 的官方 AI 助手。用户的提问在社团官方 FAQ 中没有直接记录。请用友好、专业的语气结合通用常识进行解答，并建议他们通过 GroupMe 或参加官方会议向社团进一步确认。`;
    }

    // 4. 调用大模型生成回答
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite', // 使用稳定轻量的模型
      contents: message,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return res.status(200).json({ reply: response.text });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}