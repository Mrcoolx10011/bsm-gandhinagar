import db from '../../lib/database.js';

export class Donation {
  static create(donationData) {
    return new Promise((resolve, reject) => {
      const { donor_name, donor_email, amount, message, status = 'completed' } = donationData;
      db.run(
        'INSERT INTO donations (donor_name, donor_email, amount, message, status) VALUES (?, ?, ?, ?, ?)',
        [donor_name, donor_email, amount, message, status],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...donationData });
          }
        }
      );
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM donations ORDER BY created_at DESC', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getStats() {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          COUNT(*) as total,
          COALESCE(SUM(amount), 0) as total_amount,
          COALESCE(AVG(amount), 0) as average_amount
        FROM donations WHERE status = 'completed'`,
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