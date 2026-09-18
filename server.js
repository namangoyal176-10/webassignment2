const app = require('./app');

let port = Number(process.env.PORT) || 3001;

function startServer(portToTry) {
  const server = app.listen(portToTry, () => {
    console.log(`====================================================`);
    console.log(`🚀 Hostel Management System running!`);
    console.log(`🌐 URL: http://localhost:${portToTry}`);
    console.log(`🔒 Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Port ${portToTry} in use, trying port ${portToTry + 1}...]`);
      startServer(portToTry + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(port);
