// import * as yup from "yup";

// const envSchema = yup.object({
//   PORT: yup.number().default(3000),
//   DATABASE_URL: yup.string().required(),
//   JWT_SECRET: yup.string().required(),
// });

// const env = envSchema.validateSync(process.env, { stripUnknown: true });

// export default () => ({
//   port: env.PORT,
//   databaseUrl: env.DATABASE_URL,
//   jwtSecret: env.JWT_SECRET,
// });