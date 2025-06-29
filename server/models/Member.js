import db from '../../lib/database.js';

export class Member {
  static create(memberData) {
    return new Promise((resolve, reject) => {
      const { name, email, phone, address, membership_type, status = 'active' } = memberData;
      db.run(
        'INSERT INTO members (name, email, phone, address, membership_type, status) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, phone, address, membership_type, status],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...memberData });
          }
        }
      );
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM members ORDER BY created_at DESC', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM members WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static update(id, memberData) {
    return new Promise((resolve, reject) => {
      const { name, email, phone, address, membership_type, status } = memberData;
      db.run(
        'UPDATE members SET name = ?, email = ?, phone = ?, address = ?, membership_type = ?, status = ? WHERE id = ?',
        [name, email, phone, address, membership_type, status, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, ...memberData });
          }
        }
      );
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM members WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deleted: this.changes > 0 });
        }
      });
    });
  }

  static getStats() {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN membership_type = 'premium' THEN 1 END) as premium
        FROM members`,
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }
}