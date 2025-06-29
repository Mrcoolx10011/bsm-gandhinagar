import express from 'express';

const router = express.Router();

// Basic route stub - TODO: Implement inquiries functionality
router.get('/', (req, res) => {
  res.json({ message: 'Inquiries endpoint - Coming soon' });
});

export default router;
