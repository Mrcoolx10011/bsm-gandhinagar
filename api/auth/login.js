const handler = require('../consolidated.js');

module.exports = async function(req, res) {
  req.query.endpoint = 'auth';
  return handler(req, res);
};
