const productService = require('../services/product.service');

exports.getProducts = async (req, res) => {
    try {
        const products = await productService.getProducts();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid data format' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.seedProducts = async (req, res) => {
    try {
        await productService.seedProducts();
        res.json({ message: 'Products seeded successfully' });
    } catch (error) {
        console.error('Error seeding products:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Duplicate products found' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        const product = await productService.getProductById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid product ID format' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const productData = req.body;

        if (!productData || Object.keys(productData).length === 0) {
            return res.status(400).json({ error: 'Product data is required' });
        }

        console.log("Creating product with data:", productData);
        const product = await productService.createProduct(productData);
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Product already exists' });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid data format' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'Update data is required' });
        }

        const product = await productService.updateProduct(id, updateData);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid product ID format' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Product with this data already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        const product = await productService.deleteProduct(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid product ID format' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};