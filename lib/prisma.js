// Prisma-like adapter for SQLite database (Serverless compatible)
import { initDatabase } from './serverless-db.js';

// Promisify database methods
const dbGet = async (sql, params = []) => {
  const db = await initDatabase();
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = async (sql, params = []) => {
  const db = await initDatabase();
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = async (sql, params = []) => {
  const db = await initDatabase();
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Prisma-like API
const prisma = {
  user: {
    findUnique: async ({ where }) => {
      if (where.id) {
        return await dbGet('SELECT * FROM users WHERE id = ?', [where.id]);
      }
      if (where.username) {
        return await dbGet('SELECT * FROM users WHERE username = ?', [where.username]);
      }
      if (where.email) {
        return await dbGet('SELECT * FROM users WHERE email = ?', [where.email]);
      }
    },
    create: async ({ data }) => {
      const result = await dbRun(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [data.username, data.email, data.password, data.role || 'admin']
      );
      return await dbGet('SELECT * FROM users WHERE id = ?', [result.id]);
    }
  },
  
  member: {
    findMany: async ({ where = {}, orderBy = {} } = {}) => {
      let sql = 'SELECT * FROM members WHERE 1=1';
      const params = [];
      
      if (where.status) {
        sql += ' AND status = ?';
        params.push(where.status);
      }
      
      if (orderBy.created_at) {
        sql += ' ORDER BY created_at ' + (orderBy.created_at === 'desc' ? 'DESC' : 'ASC');
      }
      
      return await dbAll(sql, params);
    },
    
    findUnique: async ({ where }) => {
      return await dbGet('SELECT * FROM members WHERE id = ?', [where.id]);
    },
    
    create: async ({ data }) => {
      const result = await dbRun(
        'INSERT INTO members (name, email, phone, address, membership_type, status) VALUES (?, ?, ?, ?, ?, ?)',
        [data.name, data.email, data.phone, data.address, data.membership_type, data.status || 'active']
      );
      return await dbGet('SELECT * FROM members WHERE id = ?', [result.id]);
    },
    
    update: async ({ where, data }) => {
      const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = Object.values(data);
      await dbRun(`UPDATE members SET ${setClause} WHERE id = ?`, [...values, where.id]);
      return await dbGet('SELECT * FROM members WHERE id = ?', [where.id]);
    },
    
    delete: async ({ where }) => {
      await dbRun('DELETE FROM members WHERE id = ?', [where.id]);
      return { id: where.id };
    },
    
    count: async ({ where = {} } = {}) => {
      let sql = 'SELECT COUNT(*) as count FROM members WHERE 1=1';
      const params = [];
      
      if (where.status) {
        sql += ' AND status = ?';
        params.push(where.status);
      }
      
      const result = await dbGet(sql, params);
      return result.count;
    }
  },
  
  event: {
    findMany: async ({ where = {}, orderBy = {} } = {}) => {
      let sql = 'SELECT * FROM events WHERE 1=1';
      const params = [];
      
      if (where.status) {
        sql += ' AND status = ?';
        params.push(where.status);
      }
      
      if (orderBy.date) {
        sql += ' ORDER BY date ' + (orderBy.date === 'desc' ? 'DESC' : 'ASC');
      }
      
      return await dbAll(sql, params);
    },
    
    findUnique: async ({ where }) => {
      return await dbGet('SELECT * FROM events WHERE id = ?', [where.id]);
    },
    
    create: async ({ data }) => {
      const result = await dbRun(
        'INSERT INTO events (title, description, date, location, capacity, status) VALUES (?, ?, ?, ?, ?, ?)',
        [data.title, data.description, data.date, data.location, data.capacity, data.status || 'upcoming']
      );
      return await dbGet('SELECT * FROM events WHERE id = ?', [result.id]);
    },
    
    update: async ({ where, data }) => {
      const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = Object.values(data);
      await dbRun(`UPDATE events SET ${setClause} WHERE id = ?`, [...values, where.id]);
      return await dbGet('SELECT * FROM events WHERE id = ?', [where.id]);
    },
    
    delete: async ({ where }) => {
      await dbRun('DELETE FROM events WHERE id = ?', [where.id]);
      return { id: where.id };
    },
    
    count: async ({ where = {} } = {}) => {
      let sql = 'SELECT COUNT(*) as count FROM events WHERE 1=1';
      const params = [];
      
      if (where.status) {
        sql += ' AND status = ?';
        params.push(where.status);
      }
      
      const result = await dbGet(sql, params);
      return result.count;
    }
  },
  
  donation: {
    findMany: async ({ where = {}, orderBy = {} } = {}) => {
      let sql = 'SELECT * FROM donations WHERE 1=1';
      const params = [];
      
      if (where.status) {
        sql += ' AND status = ?';
        params.push(where.status);
      }
      
      if (orderBy.created_at) {
        sql += ' ORDER BY created_at ' + (orderBy.created_at === 'desc' ? 'DESC' : 'ASC');
      }
      
      return await dbAll(sql, params);
    },
    
    create: async ({ data }) => {
      const result = await dbRun(
        'INSERT INTO donations (donor_name, email, phone, amount, campaign, method, transaction_id, status, is_anonymous, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [data.donor_name, data.email, data.phone, data.amount, data.campaign, data.method, data.transaction_id, data.status || 'pending', data.is_anonymous || false, data.message]
      );
      return await dbGet('SELECT * FROM donations WHERE id = ?', [result.id]);
    },
    
    update: async ({ where, data }) => {
      const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = Object.values(data);
      await dbRun(`UPDATE donations SET ${setClause} WHERE id = ?`, [...values, where.id]);
      return await dbGet('SELECT * FROM donations WHERE id = ?', [where.id]);
    },
    
    count: async ({ where = {} } = {}) => {
      let sql = 'SELECT COUNT(*) as count FROM donations WHERE 1=1';
      const params = [];
      
      if (where.status) {
        sql += ' AND status = ?';
        params.push(where.status);
      }
      
      const result = await dbGet(sql, params);
      return result.count;
    },
    
    aggregate: async ({ _sum }) => {
      if (_sum && _sum.amount) {
        const result = await dbGet('SELECT SUM(amount) as sum FROM donations WHERE status = "completed"');
        return { _sum: { amount: result.sum || 0 } };
      }
    }
  },
  
  inquiry: {
    findMany: async ({ where = {}, orderBy = {} } = {}) => {
      let sql = 'SELECT * FROM inquiries WHERE 1=1';
      const params = [];
      
      if (where.status) {
        sql += ' AND status = ?';
        params.push(where.status);
      }
      
      if (orderBy.created_at) {
        sql += ' ORDER BY created_at ' + (orderBy.created_at === 'desc' ? 'DESC' : 'ASC');
      }
      
      return await dbAll(sql, params);
    },
    
    create: async ({ data }) => {
      const result = await dbRun(
        'INSERT INTO inquiries (name, email, phone, subject, message, status, priority) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [data.name, data.email, data.phone, data.subject, data.message, data.status || 'new', data.priority || 'medium']
      );
      return await dbGet('SELECT * FROM inquiries WHERE id = ?', [result.id]);
    },
    
    update: async ({ where, data }) => {
      const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = Object.values(data);
      await dbRun(`UPDATE inquiries SET ${setClause} WHERE id = ?`, [...values, where.id]);
      return await dbGet('SELECT * FROM inquiries WHERE id = ?', [where.id]);
    },
    
    delete: async ({ where }) => {
      await dbRun('DELETE FROM inquiries WHERE id = ?', [where.id]);
      return { id: where.id };
    },
    
    count: async ({ where = {} } = {}) => {
      let sql = 'SELECT COUNT(*) as count FROM inquiries WHERE 1=1';
      const params = [];
      
      if (where.status) {
        sql += ' AND status = ?';
        params.push(where.status);
      }
      
      const result = await dbGet(sql, params);
      return result.count;
    }
  }
};

export default prisma;
