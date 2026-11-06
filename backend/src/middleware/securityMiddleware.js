// FarmConnect Security Hardening & Rate Limiting Middleware (Phase 25)

// In-Memory Token Bucket / Window Rate Limiter
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = process.env.NODE_ENV === 'test' ? 10000 : 1000;

/**
 * Rate Limiter Middleware
 */
function rateLimiter(req, res, next) {
  // Identify client by IP or auth token
  const clientId = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.user?.id || 'standard_client';
  const now = Date.now();

  let clientRecord = rateLimitMap.get(clientId);

  if (!clientRecord || now - clientRecord.startTime > RATE_LIMIT_WINDOW_MS) {
    clientRecord = {
      startTime: now,
      count: 1,
    };
    rateLimitMap.set(clientId, clientRecord);
  } else {
    clientRecord.count += 1;
  }

  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - clientRecord.count);
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
  res.setHeader('X-RateLimit-Remaining', remaining);

  if (clientRecord.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded. Please wait before making more requests to FarmConnect API.',
      retry_after_seconds: Math.ceil((RATE_LIMIT_WINDOW_MS - (now - clientRecord.startTime)) / 1000),
    });
  }

  next();
}

/**
 * Clean up stale rate limiter cache periodically
 */
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.startTime > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

/**
 * Standard Security Headers
 */
function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}

/**
 * Input sanitization to prevent XSS injection in string fields
 */
function sanitizeInput(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      // Strip script tags and dangerous HTML constructs
      obj[key] = obj[key]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '');
    } else if (typeof obj[key] === 'object') {
      sanitizeInput(obj[key]);
    }
  }
  return obj;
}

function inputSanitizer(req, res, next) {
  if (req.body) sanitizeInput(req.body);
  if (req.query) sanitizeInput(req.query);
  if (req.params) sanitizeInput(req.params);
  next();
}

module.exports = {
  rateLimiter,
  securityHeaders,
  inputSanitizer,
};
