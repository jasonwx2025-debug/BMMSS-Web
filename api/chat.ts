import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 💡 1. 在函数内部初始化，确保 Vercel 的环境变量 100% 已经加载
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey });

    // 💡 2. 动态读取并解析 JSON（请确认你的 faq-database.json 是否在 api/ 目录下）
    // 如果你在根目录，请改成 path.join(process.cwd(), 'faq-database.json')
    const filePath = path.join(process.cwd(), 'api', 'faq-database.json');
    const faqDatabase = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 3. 将用户的输入转化为向量
    const embedResult = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: message,
    });
    const userVector = embedResult.embeddings?.[0]?.values;

    if (!userVector) {
      throw new Error("Failed to generate embedding vector.");
    }

    // 4. 计算余弦相似度并检索最相关的前 2 个片段 (Top-2)
    function cosineSimilarity(vecA, vecB) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    const scoredChunks = faqDatabase.map(item => {
        const score = cosineSimilarity(userVector, item.vector);
        return { ...item, score };
    });
    scoredChunks.sort((a, b) => b.score - a.score);
    const relevantChunks = scoredChunks.slice(0, 2);
    const topScore = relevantChunks[0]?.score || 0;

    console.log(`用户提问: "${message}", 最高匹配得分: ${topScore}`);

    let systemInstruction = "";
    const SIMILARITY_THRESHOLD = 0.50;

    if (topScore >= SIMILARITY_THRESHOLD) {
      const contextText = relevantChunks.map(c => c.chunk).join("\n\n");
      systemInstruction = `You are the BMMSS assistance right now, please strictly follows the club offical faqDatabase to answer the question：\n${contextText}`;
    } else {
      systemInstruction = `You are now the official AI assistant of BMMSS. The user's question is not directly recorded in the official club FAQ. Please provide a friendly and professional response using general knowledge, and suggest that they confirm further by reaching out via GroupMe or attending official club meetings.`;
    }

    // 5. 调用大模型生成回答
    const chatResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return res.status(200).json({ reply: chatResponse.text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}