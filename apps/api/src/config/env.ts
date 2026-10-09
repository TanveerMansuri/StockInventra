import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  cookieSecret: process.env.COOKIE_SECRET || "super-secret-cookie-key",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};
