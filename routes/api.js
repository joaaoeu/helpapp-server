const express = require('express');
const router = express.Router();

// SAMPLE ENDPOINT: [GET] /api/
router.get('/', (req, res) => {
  res.send('Hello from API!');
});

module.exports = router;
