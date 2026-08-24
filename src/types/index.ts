

export interface Faqitem {
    id?: string | number;
    chunk: string;
    vector: number[];
    }

export interface ScoredFaqIten extend Faqitem {
    score: number;
    }