import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

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
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "mtapplicationdeveloper@gmail.com",
    pass: process.env.SMTP_PASS || "fmra vryy qoxr kdps",
    fromEmail: process.env.SMTP_FROM_EMAIL || "mtapplicationdeveloper@gmail.com",
    fromName: process.env.SMTP_FROM_NAME || "Stock Inventra",
  }
};
