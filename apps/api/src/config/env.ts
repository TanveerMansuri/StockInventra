import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Try multiple potential paths to locate the root .env file reliably in dev, ts-node, and compiled dist
const potentialEnvPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(__dirname, "../../../../.env"),
  path.resolve(__dirname, "../../../.env"),
  path.resolve(__dirname, "../../.env"),
];

for (const envPath of potentialEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const requiredEnvVars = ["DATABASE_URL"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`CRITICAL ERROR: Missing required environment variable: ${envVar}. Please check your .env file.`);
  }
}

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  cookieSecret: process.env.COOKIE_SECRET || "super-secret-cookie-key",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};
