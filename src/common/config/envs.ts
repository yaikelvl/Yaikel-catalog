import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  DB_PASSWORD: string;
  DB_USER: string;
  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: number;
  JWT_SECRET: string;
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    DB_PASSWORD: joi.string().required(),
    DB_USER: joi.string().required(),
    DB_NAME: joi.string().required(),
    DB_HOST: joi.string().required(),
    DB_PORT: joi.number().required(),
    JWT_SECRET: joi.string().required()
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  dbPassword: envVars.DB_PASSWORD,
  dbUser: envVars.DB_USER,
  dbName: envVars.DB_NAME,
  dbHost: envVars.DB_HOST,
  dbPort: envVars.DB_PORT,
  jwtSecret: envVars.JWT_SECRET
};
