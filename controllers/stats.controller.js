const Order = require('../models/order.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const UserMemory = require('../models/userMemory.model');
const { ethers } = require('ethers');
const { CONTRACT_ADDRESS, CONTRACT_ABI } = require('../utils/contract');

// Blockchain setup
let contract, provider;
if (CONTRACT_ADDRESS && CONTRACT_ABI) {
    provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

// Helper for percentage change
function getChange(current, previous) {
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / previous) * 100;
}

exports.fetchStats = async (req, res) => {
    try {
        // Revenue
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [totalRevenue, lastMonthRevenue, thisMonthRevenue] = await Promise.all([
            Order.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),
            Order.aggregate([
                { $match: { status: 'completed', created_at: { $gte: lastMonth, $lt: thisMonth } } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),
            Order.aggregate([
                { $match: { status: 'completed', created_at: { $gte: thisMonth } } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ])
        ]);

        // NFTs Minted
        const [totalNFTs, lastMonthNFTs, thisMonthNFTs] = await Promise.all([
            UserMemory.countDocuments({}),
            UserMemory.countDocuments({ created_at: { $gte: lastMonth, $lt: thisMonth } }),
            UserMemory.countDocuments({ created_at: { $gte: thisMonth } })
        ]);

        // Active Users (users with at least 1 order in the last 30 days)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const [activeUsers, prevActiveUsers] = await Promise.all([
            Order.distinct('user', { created_at: { $gte: thirtyDaysAgo } }),
            Order.distinct('user', { created_at: { $gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000), $lt: thirtyDaysAgo } })
        ]);

        // Products Sold
        const [totalProductsSold, lastMonthProductsSold, thisMonthProductsSold] = await Promise.all([
            Order.aggregate([
                { $match: { status: 'completed' } },
                { $unwind: '$items' },
                { $group: { _id: null, total: { $sum: '$items.quantity' } } }
            ]),
            Order.aggregate([
                { $match: { status: 'completed', created_at: { $gte: lastMonth, $lt: thisMonth } } },
                { $unwind: '$items' },
                { $group: { _id: null, total: { $sum: '$items.quantity' } } }
            ]),
            Order.aggregate([
                { $match: { status: 'completed', created_at: { $gte: thisMonth } } },
                { $unwind: '$items' },
                { $group: { _id: null, total: { $sum: '$items.quantity' } } }
            ])
        ]);

        res.json({
            totalRevenue: {
                value: totalRevenue[0]?.total || 0,
                change: getChange(thisMonthRevenue[0]?.total || 0, lastMonthRevenue[0]?.total || 0)
            },
            nftsMinted: {
                value: totalNFTs,
                change: getChange(thisMonthNFTs, lastMonthNFTs)
            },
            activeUsers: {
                value: activeUsers.length,
                change: getChange(activeUsers.length, prevActiveUsers.length)
            },
            productsSold: {
                value: totalProductsSold[0]?.total || 0,
                change: getChange(thisMonthProductsSold[0]?.total || 0, lastMonthProductsSold[0]?.total || 0)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.fetchSalesData = async (req, res) => {
    try {
        // Monthly sales for the last 12 months
        const now = new Date();
        const months = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                month: d.toLocaleString('default', { month: 'short' }),
                year: d.getFullYear(),
                start: d,
                end: new Date(d.getFullYear(), d.getMonth() + 1, 1)
            });
        }
        const sales = await Promise.all(months.map(async m => {
            const count = await Order.countDocuments({
                status: 'completed',
                created_at: { $gte: m.start, $lt: m.end }
            });
            return { month: `${m.month} ${m.year}`, sales: count };
        }));
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.fetchTopProducts = async (req, res) => {
    try {
        // Top 5 products by number of sales
        const topProducts = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    numberOfSales: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                }
            },
            { $sort: { numberOfSales: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $project: {
                    _id: 0,
                    name: '$product.name',
                    numberOfSales: 1,
                    revenue: 1
                }
            }
        ]);
        res.json(topProducts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.fetchBlockChainStats = async (req, res) => {
    try {
        // Transactions: count of UserMemory (NFTs minted)
        const transactions = await UserMemory.countDocuments({});
        // Smart contracts: number of unique products (memories)
        const smartContracts = await Product.countDocuments({});
        res.json({
            transactions,
            smartContracts
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 