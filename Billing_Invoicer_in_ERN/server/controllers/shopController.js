const { updateItemInFile, findItemById } = require('../utils/fileHandler');
const { validateShopUpdate } = require('../utils/validation');

// Update shop details
const updateShop = async (req, res) => {
  try {
    const { error } = validateShopUpdate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: error.details[0].message 
      });
    }

    const updatedData = {
      shop: req.body,
      updatedAt: new Date().toISOString()
    };

    const updatedUser = await updateItemInFile('users.json', req.userId, updatedData);

    res.json({
      message: 'Shop details updated successfully',
      shop: updatedUser.shop
    });

  } catch (error) {
    console.error('Update shop error:', error);
    if (error.message === 'Item not found') {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User not found'
      });
    }
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update shop details'
    });
  }
};

// Get shop details
const getShop = async (req, res) => {
  try {
    const user = await findItemById('users.json', req.userId);

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User not found'
      });
    }

    res.json({ shop: user.shop });

  } catch (error) {
    console.error('Get shop error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch shop details'
    });
  }
};

module.exports = {
  updateShop,
  getShop
};
