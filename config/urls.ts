import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "dev"}`, quiet: true });

function requiredEnv(varName: string): string {
    const value = process.env[varName];
    if (!value) {
        throw new Error(`Missing required environment variable: ${varName}`);
    }
    return value;
}

export const CONFIG = {
    GUI: {
        google: requiredEnv("GOOGLE_URL"),
        morosystems: requiredEnv("MOROSYSTEMS_URL"),
        moroCareer: requiredEnv("MORO_CAREER_URL"),
    },
    API: {
        toDoTasks: requiredEnv("TODO_TASKS_API_URL"),
    },
} as const;

export type Config = typeof CONFIG;