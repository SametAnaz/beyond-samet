import { readFileSync } from 'node:fs';

export function getDatabaseConfig() {
  const databaseUrl = process.env.AIVEN_DATABASE_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('AIVEN_DATABASE_URL or DATABASE_URL environment variable is required');
  }

  const url = new URL(databaseUrl);
  const sslCaPath = process.env.MYSQL_SSL_CA_PATH
    || (process.env.AIVEN_DATABASE_URL && process.env.AIVEN_CA_PATH);
  const sslCa = process.env.MYSQL_SSL_CA
    ? process.env.MYSQL_SSL_CA.replace(/\\n/g, '\n')
    : sslCaPath
      ? readFileSync(sslCaPath, 'utf8')
      : undefined;

  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, '')),
    waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
    queueLimit: 0,
    charset: 'utf8mb4',
    ...(sslCa && {
      ssl: { ca: sslCa, rejectUnauthorized: true, verifyIdentity: true },
    }),
  };
}
