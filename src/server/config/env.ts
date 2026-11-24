import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5050),
  CLIENT_URL: z.string().url().default('http://localhost:3070'),
  API_PREFIX: z.string().startsWith('/').default('/api/v1'),

  // Database
  MONGODB_URI: z.string().min(1).default('mongodb://localhost:27017/workzen_dev'),
  MONGODB_TEST_URI: z.string().optional().default('mongodb://localhost:27017/workzen_test'),

  // Authentication & Secrets
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters').default('workzen_dev_access_secret_key_32_characters_long_min'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters').default('workzen_dev_refresh_secret_key_32_characters_long_min'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(16).default(10),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000), // 15 mins
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  AUTH_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(10),

  // Optional Third-Party Services
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYSTACK_PUBLIC_KEY: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional()
});

const validateEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    console.error(`\n[WORKZEN Configuration Error] Invalid environment variables detected:\n${errorDetails}\n`);
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Fatal configuration error: Process cannot start with invalid environment.');
    }
  }

  return result.success ? result.data : envSchema.parse({});
};

export const ENV = validateEnv();
export type Environment = z.infer<typeof envSchema>;
