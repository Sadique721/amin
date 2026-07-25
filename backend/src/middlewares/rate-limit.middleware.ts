import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

export const rateLimitMiddleware = (limit = 100, windowMs = 15 * 60 * 1000) => {
  return rateLimit({
    windowMs,
    max: limit,
    message: {
      status: 429,
      message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
    // Skip rate limiting in development/test to allow automated E2E testing
    skip: () => isDev,
  });
};

