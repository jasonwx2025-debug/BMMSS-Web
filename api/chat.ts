import { processRAGQuery } from '../src/services/ragservices.ts';
import { Faqitem, ScoredFaqIten } from '../src/types/index.ts';


interface ChatRequestBody {
  message: string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {


    const body = req.body as ChatRequestBody;
    const { message } = body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. 将用户的输入转化为向量
    const reply = await processRAGQuery(message);

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}