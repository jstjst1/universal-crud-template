const mysql = require('mysql2/promise');
const { Pool } = require('pg');

class Database {
  constructor() {
    this.pool = null;
    this.dbType = process.env.DB_TYPE || 'mysql';
    this.init();
  }

  async init() {
    try {
      if (this.dbType === 'mysql') {
        this.pool = mysql.createPool({
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 3306,
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'universal_crud',
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          acquireTimeout: 60000,
          timeout: 60000,
          reconnect: true
        });
      } else if (this.dbType === 'postgresql') {
        this.pool = new Pool({
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 5432,
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'universal_crud',
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        });
      }

      await this.testConnection();
      console.log(`✅ Database connected (${this.dbType})`);
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
    }
  }

  async testConnection() {
    if (this.dbType === 'mysql') {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
    } else if (this.dbType === 'postgresql') {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
    }
  }

  async query(sql, params = []) {
    try {
      if (this.dbType === 'mysql') {
        const [rows] = await this.pool.execute(sql, params);
        return rows;
      } else if (this.dbType === 'postgresql') {
        const result = await this.pool.query(sql, params);
        return result.rows;
      }
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async getConnection() {
    if (this.dbType === 'mysql') {
      return await this.pool.getConnection();
    } else if (this.dbType === 'postgresql') {
      return await this.pool.connect();
    }
  }

  // Convert MySQL syntax to PostgreSQL where needed
  adaptQuery(sql, dbType = this.dbType) {
    if (dbType === 'postgresql') {
      // Convert MySQL LIMIT with OFFSET
      sql = sql.replace(/LIMIT (\d+) OFFSET (\d+)/, 'LIMIT $1 OFFSET $2');
      // Convert MySQL backticks to PostgreSQL double quotes
      sql = sql.replace(/`([^`]+)`/g, '"$1"');
      // Convert MySQL AUTO_INCREMENT
      sql = sql.replace(/AUTO_INCREMENT/g, 'SERIAL');
    }
    return sql;
  }

  // Get parameterized query placeholder for the database type
  getPlaceholder(index) {
    if (this.dbType === 'mysql') {
      return '?';
    } else if (this.dbType === 'postgresql') {
      return `$${index + 1}`;
    }
  }

  // Build parameterized query with correct placeholders
  buildQuery(sql, params = []) {
    if (this.dbType === 'postgresql') {
      let paramIndex = 0;
      sql = sql.replace(/\?/g, () => `$${++paramIndex}`);
    }
    return { sql: this.adaptQuery(sql), params };
  }

  async close() {
    if (this.pool) {
      if (this.dbType === 'mysql') {
        await this.pool.end();
      } else if (this.dbType === 'postgresql') {
        await this.pool.end();
      }
    }
  }
}

module.exports = new Database();
