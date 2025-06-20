const Product = require('../models/product.model');

class ProductService {
    async getProducts() {
        return Product.find();
    }

    async getProductById(id) {
        return Product.findById(id);
    }

    async createProduct(data) {
        const product = new Product(data);
        return product.save();
    }

    async updateProduct(id, data) {
        return Product.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteProduct(id) {
        return Product.findByIdAndDelete(id);
    }

    async seedProducts() {
        const products = [
            {
                name: 'Premium Coffee Bags',
                type: 'coffee_bag',
                description: 'Artisan roasted coffee beans from the finest plantations.',
                price: 24.99,
                originalPrice: 29.99,
                image: '☕',
                features: ['Single Origin', 'Medium Roast', '250g Package']
            },
            {
                name: 'Ceramic Coffee Cups',
                type: 'coffee_cup',
                description: 'Handcrafted ceramic mugs designed for the perfect coffee experience.',
                price: 18.99,
                originalPrice: 22.99,
                image: '🏺',
                features: ['Ceramic Material', '350ml Capacity', 'Heat Resistant']
            },
            {
                name: 'Free Coffee Claims',
                type: 'free_coffee',
                description: 'Exclusive vouchers for complimentary coffee experiences.',
                price: 0,
                originalPrice: 12.99,
                image: '🎁',
                features: ['Digital Voucher', 'Any Size Coffee', '30 Day Validity'],
                max_claims: 3
            }
        ];

        for (const product of products) {
            const existingProduct = await Product.findOne({ name: product.name });
            if (!existingProduct) {
                const newProduct = new Product(product);
                await newProduct.save();
            }
        }
    }
}

// (async () => {
//     const productService = new ProductService();
//     await productService.seedProducts();
// })();

module.exports = new ProductService();