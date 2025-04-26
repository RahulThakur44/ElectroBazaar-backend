const Product = require('../models/productModel');
const path = require('path');

// Get all products
const getProducts = (req, res, next) => {
  Product.getAll((err, products) => {
    if (err) return next(err);
    const imageBaseUrl = 'http://localhost:5000/uploads/';
    products.forEach(p => p.image = imageBaseUrl + p.image);
    res.status(200).json({ products });
  });
};

// Get product by ID
const getProductById = (req, res, next) => {
  const { id } = req.params;
  Product.getById(id, (err, result) => {
    if (err) return next(err);
    if (result.length === 0) return res.status(404).json({ message: 'Product not found' });

    const product = result[0];
    product.image = 'http://localhost:5000/uploads/' + product.image;
    res.status(200).json({ product });
  });
};

// Add product
const addProduct = (req, res, next) => {
  const { name, description, price, category, stock, status } = req.body;
  const image = req.file ? req.file.filename : '';

  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  const newProduct = { name, description, price, category, image, stock, status };
  Product.create(newProduct, (err) => {
    if (err) return next(err);
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  });
};

// Update product
const updateProduct = (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, category, stock, status, oldImage } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  Product.getById(id, (err, result) => {
    if (err) return next(err);
    if (result.length === 0) return res.status(404).json({ message: 'Product not found' });

    let image = result[0].image; // purani image by default

    if (req.file) {
      image = req.file.filename; // naya image mila toh
    }

    const updatedProduct = { name, description, price, category, image, stock, status };

    Product.update(id, updatedProduct, (err, result) => {
      if (err) return next(err);
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });

      res.status(200).json({ message: 'Product updated successfully' });
    });
  });
};

// Delete product
const deleteProduct = (req, res, next) => {
  const { id } = req.params;
  Product.deleteProduct(id, (err, result) => {
    if (err) return next(err);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ message: 'Product deleted successfully' });
  });
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
