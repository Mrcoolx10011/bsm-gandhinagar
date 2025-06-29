import db from '../../lib/database.js';

export class Event {
  static create(eventData) {
    return new Promise((resolve, reject) => {
      const { title, description, date, location, capacity, status = 'upcoming' } = eventData;
      db.run(
        'INSERT INTO events (title, description, date, location, capacity, status) VALUES (?, ?, ?, ?, ?, ?)',
        [title, description, date, location, capacity, status],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...eventData });
          }
        }
      );
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM events ORDER BY date DESC', (err, rows) => {
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
      db.get('SELECT * FROM events WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static update(id, eventData) {
    return new Promise((resolve, reject) => {
      const { title, description, date, location, capacity, status } = eventData;
      db.run(
        'UPDATE events SET title = ?, description = ?, date = ?, location = ?, capacity = ?, status = ? WHERE id = ?',
        [title, description, date, location, capacity, status, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, ...eventData });
          }
        }
      );
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM events WHERE id = ?', [id], function(err) {
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
          COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
        FROM events`,
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