const Product = require('../models/productModel');

// ✅ GET All Products
const getProducts = (req, res, next) => {
  Product.getAll((err, products) => {
    if (err) return next(err);
    res.status(200).json({ products });
  });
};

// ✅ GET Product by ID
const getProductById = (req, res, next) => {
  const { id } = req.params;
  Product.getById(id, (err, result) => {
    if (err) return next(err);
    if (result.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ product: result[0] });
  });
};

// ✅ ADD Product (with Cloudinary Image Upload)
const addProduct = (req, res, next) => {
  const { name, description, price, category, stock, status } = req.body;
  const image = req.file?.path || ''; // Cloudinary URL will be in req.file.path

  // Debug log (optional)
  console.log('📦 Add Product:', { ...req.body, image });

  // Validation
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

  Product.create(newProduct, (err, result) => {
    if (err) return next(err);
    res.status(201).json({
      message: 'Product added successfully',
      product: newProduct,
    });
  });
};

// ✅ UPDATE Product (with optional new image upload)
const updateProduct = (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, category, stock, status } = req.body;

  Product.getById(id, (err, result) => {
    if (err) return next(err);
    if (result.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existing = result[0];
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

    Product.update(id, updatedProduct, (err, result) => {
      if (err) return next(err);
      res.status(200).json({ message: 'Product updated successfully' });
    });
  });
};

// ✅ DELETE Product
const deleteProduct = (req, res, next) => {
  const { id } = req.params;
  Product.deleteProduct(id, (err, result) => {
    if (err) return next(err);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  });
};

// ✅ EXPORT all handlers
module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
