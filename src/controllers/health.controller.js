export const healthCheck = (req, res) => {
  const healthData = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    pid: process.pid
  };
  
  res.json(healthData);
};