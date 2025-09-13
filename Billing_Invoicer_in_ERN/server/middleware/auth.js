const jwt = require('jsonwebtoken');
const { readDataFromFile } = require('../utils/fileHandler');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'No valid token provided' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verify user still exists
      const users = await readDataFromFile('users.json');
      const user = users.find(u => u.id === decoded.userId);
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Access denied', 
          message: 'User not found' 
        });
      }

      req.userId = decoded.userId;
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        shop: user.shop
      };
      
      next();
    } catch (tokenError) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Invalid token' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Authentication failed'
    });
  }
};

module.exports = auth;
