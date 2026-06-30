export const logger = {
  info: (message: string, meta: any = {}) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...meta
    }));
  },
  warn: (message: string, meta: any = {}) => {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...meta
    }));
  },
  error: (message: string, error: Error | any = {}, meta: any = {}) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error.message || error,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
      ...meta
    }));
  }
};
