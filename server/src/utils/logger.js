const timestamp = () => new Date().toISOString();

export const logger = {
  info: (msg, data) => console.log(`[${timestamp()}] INFO: ${msg}`, data || ''),
  error: (msg, data) => console.error(`[${timestamp()}] ERROR: ${msg}`, data || ''),
  warn: (msg, data) => console.warn(`[${timestamp()}] WARN: ${msg}`, data || ''),
  debug: (msg, data) => process.env.DEBUG && console.log(`[${timestamp()}] DEBUG: ${msg}`, data || '')
};
