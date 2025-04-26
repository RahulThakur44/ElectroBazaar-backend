const db = require('../config/db');

// Get all products
const getAll = (callback) => {
  db.query('SELECT * FROM products', callback);
};

// Get product by ID
const getById = (id, callback) => {
  db.query('SELECT * FROM products WHERE id = ?', [id], callback);
};

// Create product
const create = (newProduct, callback) => {
  const query = 'INSERT INTO products (name, description, price, category, image, stock, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [newProduct.name, newProduct.description, newProduct.price, newProduct.category, newProduct.image, newProduct.stock, newProduct.status], callback);
};

// Update product
const update = (id, updatedProduct, callback) => {
  const query = 'UPDATE products SET name = ?, description = ?, price = ?, category = ?, image = ?, stock = ?, status = ? WHERE id = ?';
  db.query(query, [updatedProduct.name, updatedProduct.description, updatedProduct.price, updatedProduct.category, updatedProduct.image, updatedProduct.stock, updatedProduct.status, id], callback);
};

// Delete product
const deleteProduct = (id, callback) => {
  db.query('DELETE FROM products WHERE id = ?', [id], callback);
};

module.exports = { getAll, getById, create, update, deleteProduct };
