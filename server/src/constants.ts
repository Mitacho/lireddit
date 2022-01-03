export const {
  DATABASE_USER_PASSWORD,
  DATABASE_USER,
  SESSION_SECRET,
  EMAIL_ACCOUNT,
  EMAIL_ACCOUNT_PASSWORD,
} = process.env;
export const PROD = process.env.NODE_ENV === "production";
export const SESSION_TTL = 315360e6; // 10 years
export const SESSION_KEY = "data";
export const COOKIE_NAME = "qid";
export const REDIS_FORGET_PASSWORD_PREFIX = "forget-password:";
export const FORGET_PASSWORD_EXPIRATION = 2592e5; // 3 days
