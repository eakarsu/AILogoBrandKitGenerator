'use strict';

function validateRuntime(env = process.env) {
  const secret = String(env.JWT_SECRET || '');
  if (secret.length < 32 || /replace|change|example|default/i.test(secret)) {
    throw new Error('JWT_SECRET must be a non-placeholder value of at least 32 characters');
  }
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  if (env.NODE_ENV === 'production') {
    const origins = String(env.CLIENT_URL || '').split(',').map((value) => value.trim()).filter(Boolean);
    if (!origins.length || origins.includes('*')) throw new Error('Production CLIENT_URL must be explicit');
    if (env.ALLOW_DEMO_SEED === 'true') throw new Error('Demo seed is prohibited in production');
  }
  return true;
}

module.exports = { validateRuntime };
