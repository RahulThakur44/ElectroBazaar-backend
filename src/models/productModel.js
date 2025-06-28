const db = require('../config/db');

// Get all products
const getAll = async () => {
  const [rows] = await db.query('SELECT * FROM products');
  return rows;
};

// Get product by ID
const getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0];
};

// Create product
const create = async (newProduct) => {
  const query = `
    INSERT INTO products (name, description, price, category, image, stock, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await db.query(query, [
    newProduct.name,
    newProduct.description,
    newProduct.price,
    newProduct.category,
    newProduct.image,
    newProduct.stock,
    newProduct.status,
  ]);
  return result.insertId;
};

// Update product
const update = async (id, updatedProduct) => {
  const query = `
    UPDATE products SET name = ?, description = ?, price = ?, category = ?, image = ?, stock = ?, status = ?
    WHERE id = ?
  `;
  const [result] = await db.query(query, [
    updatedProduct.name,
    updatedProduct.description,
    updatedProduct.price,
    updatedProduct.category,
    updatedProduct.image,
    updatedProduct.stock,
    updatedProduct.status,
    id,
  ]);
  return result.affectedRows > 0;
};

// Delete product
const deleteProduct = async (id) => {
  const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = { getAll, getById, create, update, deleteProduct };
