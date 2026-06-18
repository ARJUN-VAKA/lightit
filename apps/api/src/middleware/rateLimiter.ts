import rateLimit from 'express-rate-limit';

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
}

export const rateLimiter = ({ windowMs, max, message }: RateLimiterOptions) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};
