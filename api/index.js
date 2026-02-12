// Simple Node serverless API replacing the previous PHP endpoint.
// Reads DB credentials from environment variables: DB_HOST, DB_USER, DB_PASS, DB_NAME
// Usage: POST JSON { table, action, ... } where action is 'select'|'insert'|'update'|'delete'

import mysql from 'mysql2/promise';

const ALLOWED_TABLES = ['quotations', 'business_info', 'quotation_items', 'terms_conditions', 'company_settings'];

let pool;
async function getPool() {
  if (pool) return pool;
  const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    throw new Error('Missing database environment variables (DB_HOST/DB_USER/DB_NAME)');
  }
  pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS || '',
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    charset: 'utf8mb4'
  });
  return pool;
}

function sendJSON(res, obj, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(obj));
}

export default async (req, res) => {
  // CORS for Vercel / local
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return sendJSON(res, { ok: true });

  let body = {};
  try {
    if (req.method === 'GET') {
      body = req.query || {};
    } else {
      body = req.body || await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => {
          try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); }
        });
        req.on('error', reject);
      });
    }
  } catch (e) {
    return sendJSON(res, { data: null, error: 'Invalid JSON' }, 400);
  }

  const table = body.table;
  const action = body.action;
  if (!table || !action) return sendJSON(res, { data: null, error: 'Missing table or action' }, 400);
  if (!ALLOWED_TABLES.includes(table)) return sendJSON(res, { data: null, error: 'Invalid table' }, 400);

  try {
    const pool = await getPool();
    const conn = await pool.getConnection();
    try {
      switch (action) {
        case 'select': {
          let where = '1=1';
          const params = [];
          if (body.match && typeof body.match === 'object') {
            for (const [k, v] of Object.entries(body.match)) {
              where += ` AND \`${k}\` = ?`;
              params.push(v);
            }
          }
          let sql = `SELECT * FROM \`${table}\` WHERE ${where}`;
          if (body.order) {
            const col = body.order.column;
            const dir = body.order.ascending ? 'ASC' : 'DESC';
            sql += ` ORDER BY \`${col}\` ${dir}`;
          }
          if (body.limit) sql += ' LIMIT ?';
          if (body.limit) params.push(parseInt(body.limit, 10));
          const [rows] = await conn.query(sql, params);
          const data = (body.single) ? (rows[0] || null) : rows;
          return sendJSON(res, { data, error: null });
        }

        case 'insert': {
          const data = body.data;
          if (!data) return sendJSON(res, { data: null, error: 'Missing data' }, 400);
          const rows = Array.isArray(data) ? data : [data];
          let lastId = null;
          for (const row of rows) {
            const cols = Object.keys(row).map(k => `\`${k}\``).join(',');
            const placeholders = Object.keys(row).map(() => '?').join(',');
            const vals = Object.values(row).map(v => Array.isArray(v) || typeof v === 'object' ? JSON.stringify(v) : v);
            const sql = `INSERT INTO \`${table}\` (${cols}) VALUES (${placeholders})`;
            const [resu] = await conn.query(sql, vals);
            lastId = resu.insertId || lastId;
          }
          return sendJSON(res, { data: { id: lastId }, error: null });
        }

        case 'update': {
          const data = body.data;
          const match = body.match;
          if (!data || !match) return sendJSON(res, { data: null, error: 'Missing data or match' }, 400);
          const sets = [];
          const params = [];
          for (const [k, v] of Object.entries(data)) {
            sets.push(`\`${k}\` = ?`);
            params.push(Array.isArray(v) || typeof v === 'object' ? JSON.stringify(v) : v);
          }
          const where = [];
          for (const [k, v] of Object.entries(match)) {
            where.push(`\`${k}\` = ?`);
            params.push(v);
          }
          const sql = `UPDATE \`${table}\` SET ${sets.join(', ')} WHERE ${where.join(' AND ')}`;
          await conn.query(sql, params);
          return sendJSON(res, { data: null, error: null });
        }

        case 'delete': {
          const match = body.match;
          if (!match) return sendJSON(res, { data: null, error: 'Missing match' }, 400);
          const where = [];
          const params = [];
          for (const [k, v] of Object.entries(match)) {
            where.push(`\`${k}\` = ?`);
            params.push(v);
          }
          const sql = `DELETE FROM \`${table}\` WHERE ${where.join(' AND ')}`;
          await conn.query(sql, params);
          return sendJSON(res, { data: null, error: null });
        }

        default:
          return sendJSON(res, { data: null, error: 'Unknown action' }, 400);
      }
    } finally {
      conn.release();
    }
  } catch (err) {
    return sendJSON(res, { data: null, error: String(err.message || err) });
  }
};
