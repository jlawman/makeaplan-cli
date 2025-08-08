export interface Question {
  question: string;
  choices: string[];
}

export interface FileStructureItem {
  type: 'file' | 'directory';
  name: string;
  description?: string;
  children?: FileStructureItem[];
}

export interface QuestionRound {
  roundNumber: number;
  questions: Question[];
  answers: string[];
  timestamp: Date;
}

export interface Session {
  id: string;
  idea: string;
  currentStep: SessionStep;
  questionRounds: QuestionRound[];
  writeup?: string;
  fileStructure?: string;
  fileStructureJson?: FileStructureItem;
  createdAt: Date;
  updatedAt: Date;
  config: SessionConfig;
}

export interface SessionConfig {
  firstRoundQuestions: number;
  subsequentRoundQuestions: number;
  answersPerQuestion: number;
  provider: 'anthropic' | 'gemini';
  model?: string;
}

export enum SessionStep {
  INITIAL_IDEA = 'INITIAL_IDEA',
  QUESTIONS_ROUND_1 = 'QUESTIONS_ROUND_1',
  QUESTIONS_ROUND_2 = 'QUESTIONS_ROUND_2',
  QUESTIONS_ROUND_3 = 'QUESTIONS_ROUND_3',
  FINAL_WRITEUP = 'FINAL_WRITEUP',
  GENERATE_FILE_STRUCTURE = 'GENERATE_FILE_STRUCTURE',
  CONVERT_TO_JSON = 'CONVERT_TO_JSON',
}

export interface Config {
  anthropicApiKey?: string;
  geminiApiKey?: string;
  defaultProvider: 'anthropic' | 'gemini';
  defaultModel?: string;
  sessionsDir: string;
}
