// import 'dotenv/config';
import * as z from 'zod';

// interface EnvVars {
//   PORT: number;
//   DB_PASSWORD: string;
//   DB_USER: string;
//   DB_NAME: string;
//   DB_HOST: string;
//   DB_PORT: number;
//   JWT_SECRET: string;
// }

const envSchema = z
  .object({
    PORT: z.coerce.number().default(3000),
    DB_PASSWORD: z.string(),
    DB_USER: z.string().max(50),
    DB_NAME: z.string(),
    DB_HOST: z.string().default('localhost'),
    DB_PORT: z.coerce.number(),
    JWT_SECRET: z.string().min(15),
  });

  export type Env = z.infer<typeof envSchema>

// if (error) {
//   throw new Error(`Config validation error: ${error.message}`);
// }

//const envVars: EnvVars = value;

// export const envs = {
//   port: envSchema.PORT,
//   dbPassword: env.DB_PASSWORD,
//   dbUser: env.DB_USER,
//   dbName: env.DB_NAME,
//   dbHost: env.DB_HOST,
//   dbPort: env.DB_PORT,
//   jwtSecret: env.JWT_SECRET
// };
