import handler from '../consolidated.js';

export default async function(req, res) {
  req.query.endpoint = 'admin';
  req.query.action = 'login';
  return handler(req, res);
}
