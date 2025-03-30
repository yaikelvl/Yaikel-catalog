import 'dotenv/config';
import * as yup from 'yup';

interface EnvVars {
  PORT: number;
  DB_PASSWORD: string;
  DB_USER: string;
  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: number;
  JWT_SECRET: string;
}

const envSchema = yup
  .object({
    PORT: yup.number().required(),
    DB_PASSWORD: yup.string().required(),
    DB_USER: yup.string().required(),
    DB_NAME: yup.string().required(),
    DB_HOST: yup.string().required(),
    DB_PORT: yup.number().required(),
    JWT_SECRET: yup.string().required()
  })
  .unknown(true);

  const env = envSchema.validateSync(process.env, { stripUnknown: true });

// if (error) {
//   throw new Error(`Config validation error: ${error.message}`);
// }

//const envVars: EnvVars = value;

export const envs = {
  port: env.PORT,
  dbPassword: env.DB_PASSWORD,
  dbUser: env.DB_USER,
  dbName: env.DB_NAME,
  dbHost: env.DB_HOST,
  dbPort: env.DB_PORT,
  jwtSecret: env.JWT_SECRET
};
