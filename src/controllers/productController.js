const Product = require('../models/productModel');

// ✅ GET All Products
const getProducts = async (req, res, next) => {
  try {
    const products = await Product.getAll();
    res.status(200).json({ products });
  } catch (err) {
    next(err);
  }
};

// ✅ GET Product by ID
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.getById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ product });
  } catch (err) {
    next(err);
  }
};

// ✅ ADD Product
const addProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock, status } = req.body;
    const image = req.file?.path || '';

    if (!name || !price || !category || !image) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const newProduct = {
      name,
      description: description || '',
      price,
      category,
      image,
      stock: stock || 0,
      status: status || 'active',
    };

    const productId = await Product.create(newProduct);

    res.status(201).json({
      message: 'Product added successfully',
      product: { id: productId, ...newProduct },
    });
  } catch (err) {
    next(err);
  }
};

// ✅ UPDATE Product
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock, status } = req.body;

    const existing = await Product.getById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const image = req.file?.path || existing.image;

    const updatedProduct = {
      name: name || existing.name,
      description: description || existing.description,
      price: price || existing.price,
      category: category || existing.category,
      image,
      stock: stock !== undefined ? stock : existing.stock,
      status: status || existing.status,
    };

    const success = await Product.update(id, updatedProduct);

    if (success) {
      res.status(200).json({ message: 'Product updated successfully' });
    } else {
      res.status(500).json({ message: 'Failed to update product' });
    }
  } catch (err) {
    next(err);
  }
};

// ✅ DELETE Product
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const success = await Product.deleteProduct(id);
    if (!success) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
