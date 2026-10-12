import mysql from 'mysql2/promise';
import { getDatabaseConfig } from './mysql-config.js';

// HMR sırasında ve bütün veri modüllerinde aynı havuzu kullan.
const config = getDatabaseConfig();
const key = JSON.stringify([config.host, config.port, config.user, config.database, config.password, config.ssl?.ca]);
if (!globalThis.__beyondMysql || globalThis.__beyondMysql.key !== key) {
  if (globalThis.__beyondMysql) void globalThis.__beyondMysql.pool.end();
  globalThis.__beyondMysql = { key, pool: mysql.createPool({ ...config, connectionLimit: config.connectionLimit || 5, maxIdle: 2, idleTimeout: 60_000, enableKeepAlive: true }) };
}
export const pool = globalThis.__beyondMysql.pool;
