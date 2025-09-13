const { v4: uuidv4 } = require('uuid');
const { 
  findItemsByUserId,
  addItemToFile,
  updateItemInFile,
  deleteItemFromFile,
  findItemById
} = require('../utils/fileHandler');
const { validateProduct } = require('../utils/validation');

// Get all products for user
const getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    
    let products = await findItemsByUserId('products.json', req.userId);
    
    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.sku?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }
    
    if (category) {
      products = products.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Sort by name
    products.sort((a, b) => a.name.localeCompare(b.name));
    
    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = products.slice(startIndex, endIndex);
    
    res.json({
      products: paginatedProducts,
      pagination: {
        total: products.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(products.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch products'
    });
  }
};

// Get single product
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await findItemById('products.json', id);

    if (!product || product.userId !== req.userId) {
      return res.status(404).json({ 
        error: 'Product not found',
        message: 'Product not found or access denied'
      });
    }

    res.json({ product });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch product'
    });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const { error } = validateProduct(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: error.details[0].message 
      });
    }

    const newProduct = {
      id: uuidv4(),
      userId: req.userId,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await addItemToFile('products.json', newProduct);

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create product'
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists and belongs to user
    const product = await findItemById('products.json', id);
    if (!product || product.userId !== req.userId) {
      return res.status(404).json({ 
        error: 'Product not found',
        message: 'Product not found or access denied'
      });
    }

    const { error } = validateProduct(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: error.details[0].message 
      });
    }

    const updatedData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    const updatedProduct = await updateItemInFile('products.json', id, updatedData);

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);
    if (error.message === 'Item not found') {
      return res.status(404).json({ 
        error: 'Product not found',
        message: 'Product not found'
      });
    }
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update product'
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists and belongs to user
    const product = await findItemById('products.json', id);
    if (!product || product.userId !== req.userId) {
      return res.status(404).json({ 
        error: 'Product not found',
        message: 'Product not found or access denied'
      });
    }

    await deleteItemFromFile('products.json', id);

    res.json({
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    if (error.message === 'Item not found') {
      return res.status(404).json({ 
        error: 'Product not found',
        message: 'Product not found'
      });
    }
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to delete product'
    });
  }
};

// Get product categories
const getCategories = async (req, res) => {
  try {
    const products = await findItemsByUserId('products.json', req.userId);
    const categories = [...new Set(products.map(product => product.category))].sort();
    
    res.json({ categories });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch categories'
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
};
