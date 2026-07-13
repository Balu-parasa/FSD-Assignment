import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  MONGO_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
  API_PORT: z.coerce.number().default(4000),
});
console.log('Current working directory:', process.cwd());
console.log('MONGO_URI:', process.env.MONGO_URI);
export const env = schema.parse(process.env);
