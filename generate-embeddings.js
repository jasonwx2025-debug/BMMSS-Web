import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

// 初始化 SDK（确保运行脚本时环境变量中有 GEMINI_API_KEY）
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const rawFAQS = [
    {
      ID: 1,
      Question: "What is BMMSS?",
      Answer: "BMMSS stands for Buckeyes Mathematical Modeling and Simulation Society. We are an Ohio State student organization focused on mathematical modeling, simulation, computational mathematics, and their applications to real-world problems."
    },
    {
        ID: 2,
        Question: "Do I have to be a Math major to join?",
        Answer: "No! BMMSS welcomes students from all majors and backgrounds, including Mathematics, Statistics, Computer Science, Engineering, Physics, Economics, Data Science, and anyone interested in quantitative problem-solving."
    },
    {
        ID: 3,
        Question: "Do I need prior experience in mathematical modeling or programming?",
        Answer: "Not at all. Beginners are welcome. We plan activities for different experience levels, and many projects are designed to help members learn modeling, coding, and problem-solving skills along the way."
    },
    {
        ID: 4,
        Question: "What does BMMSS do?",
        Answer: "Our activities may include modeling projects, workshops, technical talks, coding and simulation sessions, problem-solving discussions, research-related activities, competitions, and social events."
    },
    {
        ID: 5,
        Question: "What kinds of problems does BMMSS work on?",
        Answer: "Projects can come from many areas, such as optimization, probability, differential equations, scientific computing, machine learning, transportation, economics, engineering, and other real-world systems."
    },
    {
        ID: 6,
        Question: "What programming languages or software do you use?",
        Answer: "Depending on the project, members may use tools such as Python, MATLAB, R, Mathematica, or other computational software. You do not need to know them before joining."
    },
    {
        ID: 7,
        Question: "Is there a membership fee?",
        Answer: "BMMSS aims to keep participation accessible to all Ohio State students. Any fees associated with special activities or competitions, if applicable, will be announced in advance."
    },
    {
        ID: 8,
        Question: "How much of a time commitment is BMMSS?",
        Answer: "You can participate at the level that works for you. Members may attend general meetings, workshops, or social events casually, while those interested in projects or competitions can become more involved."
    },
    {
        ID: 9,
        Question: "How can I join BMMSS?",
        Answer: "You can join by connecting with us through our official BMMSS communication channels, including our GroupMe, and attending one of our general body meetings or events."
    },
    {
        ID: 10,
        Question: "Why should I join BMMSS?",
        Answer: "BMMSS is a place to apply mathematics beyond the classroom, gain computational experience, work on interesting problems, meet students with similar interests, explore research and career opportunities, and build a community around mathematical modeling and simulation."
    },
    {
        ID: 11,
        Question: "Is BMMSS only for students who are already good at math?",
        Answer: "No. BMMSS is for students who are interested in learning and applying mathematics, not just students who already have advanced mathematical backgrounds. Curiosity and willingness to participate matter more than prior experience."
    },
    {
        ID: 12,
        Question: "Can first-year students join BMMSS?",
        Answer: "Absolutely. First-year students are especially welcome. Joining early can help you meet students with similar interests, explore different areas of mathematics, and learn about research, internships, and future coursework."
    },
    {
        ID: 13,
        Question: "Can graduate students join or participate?",
        Answer: "Yes. Graduate students who are interested in mathematical modeling, computation, or mentoring undergraduate students are welcome to participate in appropriate BMMSS activities."
    },
    {
        ID: 14,
        Question: "Does BMMSS participate in mathematical modeling competitions?",
        Answer: "BMMSS plans to encourage and support participation in mathematical modeling and problem-solving competitions. Members may form teams, practice modeling problems, and share strategies and computational methods."
    },
    {
        ID: 15,
        Question: "Can I propose my own project or problem?",
        Answer: "Yes! Members are encouraged to bring their own ideas. If you have an interesting mathematical, scientific, engineering, economic, or computational problem, BMMSS can be a place to find teammates and develop the idea into a modeling project."
    },
    {
        ID: 16,
        Question: "Does BMMSS offer research opportunities?",
        Answer: "BMMSS itself is a student organization rather than a research lab, but we hope to help members learn about undergraduate research, connect with faculty and researchers, develop technical skills, and prepare for future research opportunities."
    },
    {
        ID: 17,
        Question: "Will BMMSS help me prepare for internships or graduate school?",
        Answer: "It can. BMMSS activities can help members build experience in problem solving, programming, teamwork, technical communication, research, and project development, all of which can be useful for internships and graduate study."
    },
    {
        ID: 18,
        Question: "How can I become more involved in BMMSS?",
        Answer: "Start by attending meetings and joining our community. Members who want to become more involved can work on projects, help organize events, lead workshops, participate in competitions, contribute ideas, or apply for future leadership opportunities."
    }
];

async function generateEmbeddings() {
    console.log("开始生成向量...");
    const faqDatabase = [];

    for (const item of rawFAQS) {
        const chunkText = `Q: ${item.Question}\nA: ${item.Answer}`;

        const embedResult = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: chunkText,
        });

        // 💡 适配最新 SDK 的安全解析方式
        const vector = embedResult.embeddings?.[0]?.values || embedResult.embedding?.values;

        if (!vector || vector.length === 0) {
            console.error(`错误: ID ${item.ID} 生成向量失败！`);
            continue;
        }

        faqDatabase.push({
            id: item.ID,
            chunk: chunkText,
            metadata: { question: item.Question },
            vector: vector
        });

        console.log(`已成功生成 ID: ${item.ID} 的向量 (维度: ${vector.length})`);
    }

    fs.writeFileSync('faq-database.json', JSON.stringify(faqDatabase, null, 2));
    console.log("向量化完成！faq-database.json 已成功更新。");
}

generateEmbeddings();