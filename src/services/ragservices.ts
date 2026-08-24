import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { cosineSimilarity } from '../utils/vector';

let cachedFaqDatabase: any = null;

function getFaqDatabase() {
    if (!cachedFaqDatabase) {
        const filePath = path.join(process.cwd(), 'faq-database.json');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        cachedFaqDatabase = JSON.parse(fileContent);
    }
    return cachedFaqDatabase;
}

export async function processRAGQuery(message: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey });
    const faqDatabase = getFaqDatabase();

    const embedResult = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: message,
    });
    const userVector = embedResult.embeddings?.[0]?.values;

    if (!userVector) {
        throw new Error("Failed to generate embedding vector.");
    }

    const scoredChunks = faqDatabase.map((item: any) => {
        const score = cosineSimilarity(userVector, item.vector);
        return { ...item, score };
    });

    scoredChunks.sort((a: any, b: any) => b.score - a.score);
    const relevantChunks = scoredChunks.slice(0, 2);
    const topScore = relevantChunks[0]?.score || 0;

    console.log(`用户提问: "${message}", 最高匹配得分: ${topScore}`);

    let systemInstruction = "";
    const SIMILARITY_THRESHOLD = 0.70;

    if (topScore >= SIMILARITY_THRESHOLD) {
        const contextText = relevantChunks.map((c: any) => c.chunk).join("\n\n");
        systemInstruction = `You are the BMMSS assistance right now, please strictly follows the club official faqDatabase to answer the question:\n${contextText}`;
    } else {
        systemInstruction = `You are now the official AI assistant of BMMSS. The user's question is not directly recorded in the official club FAQ. Please provide a friendly and professional response using general knowledge, and suggest that they confirm further by reaching out via GroupMe or attending official club meetings.`;
    }

    const chatResponse = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: message,
        config: {
            systemInstruction: systemInstruction,
        }
    });

    if (!chatResponse.text) {
        throw new Error("Failed to generate content from Gemini.");
    }

    return chatResponse.text;
}