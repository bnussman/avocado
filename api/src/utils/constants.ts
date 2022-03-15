export const DB_USER = process.env.DB_USER || 'root';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'avocado';
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_DATABASE = process.env.DB_HOST || 'avocado';
export const DB_URL = `mysql://${DB_USER}@${DB_HOST}:3306/${DB_DATABASE}`;
export const DB_CA = process.env.DB_CA;

export const REDIS_HOST = process.env.REDIS_HOST || `localhost`;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

export const isProduction = process.env.NODE_ENV === "production";