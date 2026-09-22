const EmbeddedPostgres = require('embedded-postgres').default;
const path = require('path');
const fs = require('fs');

const port = process.env.DB_PORT || 5439;
const dbName = process.env.DB_NAME || 'capability_os';
const dataDir = path.join(__dirname, '../.pgdata');

const net = require('net');

function isPortInUse(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(500);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

async function main() {
  const inUse = await isPortInUse(Number(port));
  if (inUse) {
    console.log(`PostgreSQL is already running on port ${port}. Skipping re-initialization.`);
    setInterval(() => {}, 1000);
    return;
  }

  if (fs.existsSync(dataDir)) {
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
  fs.mkdirSync(dataDir, { recursive: true });

  const pg = new EmbeddedPostgres({
    port: Number(port),
    dataDir: dataDir,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
  });

  try {
    console.log(`Initialising PostgreSQL on port ${port}...`);
    await pg.initialise();
  } catch (err) {
    console.error('Init error:', err);
  }

  try {
    await pg.start();
    console.log(`PostgreSQL started on port ${port}`);
    await pg.createDatabase(dbName);
    console.log(`Database '${dbName}' created and ready.`);
  } catch (err) {
    console.error('Error starting Postgres:', err);
  }

  // Keep process alive
  setInterval(() => {}, 1000);

  process.on('SIGINT', async () => {
    console.log('Stopping PostgreSQL...');
    await pg.stop();
    process.exit(0);
  });
}

main();
