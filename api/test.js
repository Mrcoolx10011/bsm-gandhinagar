module.exports = function handler(req, res) {
  res.status(200).json({ 
    test: "working",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
};
