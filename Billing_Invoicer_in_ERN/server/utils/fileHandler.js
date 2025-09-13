const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
};

// Read data from JSON file
const readDataFromFile = async (filename) => {
  try {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    
    try {
      await fs.access(filePath);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // File doesn't exist, return empty array
      return [];
    }
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    throw new Error(`Failed to read data from ${filename}`);
  }
};

// Write data to JSON file
const writeDataToFile = async (filename, data) => {
  try {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw new Error(`Failed to write data to ${filename}`);
  }
};

// Add item to file
const addItemToFile = async (filename, item) => {
  try {
    const data = await readDataFromFile(filename);
    data.push(item);
    await writeDataToFile(filename, data);
    return item;
  } catch (error) {
    console.error(`Error adding item to ${filename}:`, error);
    throw error;
  }
};

// Update item in file
const updateItemInFile = async (filename, id, updatedItem) => {
  try {
    const data = await readDataFromFile(filename);
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error('Item not found');
    }
    
    data[index] = { ...data[index], ...updatedItem, id };
    await writeDataToFile(filename, data);
    return data[index];
  } catch (error) {
    console.error(`Error updating item in ${filename}:`, error);
    throw error;
  }
};

// Delete item from file
const deleteItemFromFile = async (filename, id) => {
  try {
    const data = await readDataFromFile(filename);
    const filteredData = data.filter(item => item.id !== id);
    
    if (data.length === filteredData.length) {
      throw new Error('Item not found');
    }
    
    await writeDataToFile(filename, filteredData);
    return true;
  } catch (error) {
    console.error(`Error deleting item from ${filename}:`, error);
    throw error;
  }
};

// Find item by id
const findItemById = async (filename, id) => {
  try {
    const data = await readDataFromFile(filename);
    return data.find(item => item.id === id);
  } catch (error) {
    console.error(`Error finding item in ${filename}:`, error);
    throw error;
  }
};

// Find items by user id
const findItemsByUserId = async (filename, userId) => {
  try {
    const data = await readDataFromFile(filename);
    return data.filter(item => item.userId === userId);
  } catch (error) {
    console.error(`Error finding items by user id in ${filename}:`, error);
    throw error;
  }
};

module.exports = {
  readDataFromFile,
  writeDataToFile,
  addItemToFile,
  updateItemInFile,
  deleteItemFromFile,
  findItemById,
  findItemsByUserId
};
