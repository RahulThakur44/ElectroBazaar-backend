// categoryController.js
exports.getCategories = (req, res) => {
    const categories = ['Electronics', 'Fashion', 'Home Appliances']; // Example categories
    res.json(categories);  // Categories ko response mein bhej do
  };
  