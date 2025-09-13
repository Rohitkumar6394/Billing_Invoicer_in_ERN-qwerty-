const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { 
  readDataFromFile, 
  addItemToFile, 
  updateItemInFile 
} = require('../utils/fileHandler');
const { 
  validateUserRegistration, 
  validateUserLogin 
} = require('../utils/validation');

// Register new user
const register = async (req, res) => {
  try {
    const { error } = validateUserRegistration(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: error.details[0].message 
      });
    }

    const { username, email, password, shop } = req.body;

    // Check if user already exists
    const users = await readDataFromFile('users.json');
    const existingUser = users.find(user => 
      user.email === email || user.username === username
    );

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User exists', 
        message: 'User with this email or username already exists' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user object
    const newUser = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      shop: {
        ...shop,
        id: uuidv4()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save user
    await addItemToFile('users.json', newUser);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to register user'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { error } = validateUserLogin(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: error.details[0].message 
      });
    }

    const { email, password } = req.body;

    // Find user
    const users = await readDataFromFile('users.json');
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication failed', 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Authentication failed', 
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password: _, ...userResponse } = user;

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to login'
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const users = await readDataFromFile('users.json');
    const user = users.find(u => u.id === req.userId);

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    // Return user without password
    const { password: _, ...userResponse } = user;

    res.json({
      user: userResponse
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to get user profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { username, email, shop } = req.body;
    
    // Check if email/username is taken by another user
    if (email || username) {
      const users = await readDataFromFile('users.json');
      const existingUser = users.find(user => 
        user.id !== req.userId && (
          (email && user.email === email) || 
          (username && user.username === username)
        )
      );

      if (existingUser) {
        return res.status(400).json({ 
          error: 'User exists', 
          message: 'Email or username already taken' 
        });
      }
    }

    const updatedData = {
      ...(username && { username }),
      ...(email && { email }),
      ...(shop && { shop }),
      updatedAt: new Date().toISOString()
    };

    const updatedUser = await updateItemInFile('users.json', req.userId, updatedData);
    
    // Return user without password
    const { password: _, ...userResponse } = updatedUser;

    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Update profile error:', error);
    if (error.message === 'Item not found') {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User not found'
      });
    }
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update profile'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
