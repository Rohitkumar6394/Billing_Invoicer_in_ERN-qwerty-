const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  updateShop,
  getShop
} = require('../controllers/shopController');

// All routes are protected
router.use(auth);

// Shop routes
router.get('/', getShop);
router.put('/', updateShop);

module.exports = router;
