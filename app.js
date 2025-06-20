const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const memoryRoutes = require('./routes/memory.routes.js');

const app = express();

// Middleware
app.use(cors());

app.use(express.json());

// Database
connectDB();

// Routes
app.use('/api/v1', apiRoutes);
app.use('/api/v1/memory', memoryRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        services: {
            database: 'connected',
            api: 'running'
        }
    });
});

// Serve static files if needed
app.use(express.static('public'));

// Swagger UI setup
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Crefy API',
        version: '1.0.0',
        description: 'API documentation for Crefy backend',
    },
    servers: [
        {
            url: '/api/v1',
            description: 'Main API server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    security: [{ bearerAuth: [] }],
};

const options = {
    swaggerDefinition,
    apis: ['./routes/*.js', './controllers/*.js'], // Scan these files for JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

module.exports = app;