const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

// Secrets & expiration
const ACCESS_SECRET = 'access_secret_key_change_in_production';
const REFRESH_SECRET = 'refresh_secret_key_change_in_production';
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

// In‑memory "databases"
let users = [
    {
        id: nanoid(6),
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        passwordHash: bcrypt.hashSync('admin123', 10),
        role: 'admin',
    },
];
let products = [];
const refreshTokens = new Set(); // store valid refresh tokens

// Middleware
app.use(express.json());
app.use(
    cors({
        origin: 'http://localhost:3001',
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// Request logger
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
            console.log('Body:', req.body);
        }
    });
    next();
});

// Swagger setup (optional – can be kept or removed)
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'NeoStore API',
            version: '1.0.0',
            description: 'API for practical works #7‑11',
        },
        servers: [{ url: `http://localhost:${port}`, description: 'Local server' }],
    },
    apis: ['./app.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ----------------------------------------------------------------------
// Helper functions
// ----------------------------------------------------------------------
const generateAccessToken = (user) => {
    return jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        ACCESS_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES_IN }
    );
};

const findUserByEmail = (email) => users.find((u) => u.email === email);

// ----------------------------------------------------------------------
// Auth middleware
// ----------------------------------------------------------------------
const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    try {
        const payload = jwt.verify(token, ACCESS_SECRET);
        req.user = payload; // { sub, email, role, iat, exp }
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// ----------------------------------------------------------------------
// Role middleware
// ----------------------------------------------------------------------
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

// ----------------------------------------------------------------------
// Public endpoints
// ----------------------------------------------------------------------
app.get('/', (req, res) => res.send('Server is running. Documentation at /api-docs'));

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email: { type: string, example: user@example.com }
 *               password: { type: string, example: secret123 }
 *               firstName: { type: string, example: John }
 *               lastName: { type: string, example: Doe }
 *     responses:
 *       201: { description: User created }
 *       400: { description: Missing fields or email exists }
 */
app.post('/api/auth/register', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    if (findUserByEmail(email)) {
        return res.status(400).json({ error: 'Email already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
        id: nanoid(6),
        email,
        firstName,
        lastName,
        passwordHash,
        role: 'user', // default role
    };
    users.push(newUser);
    res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
    });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in and receive tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: user@example.com }
 *               password: { type: string, example: secret123 }
 *     responses:
 *       200: { description: Tokens returned }
 *       401: { description: Invalid credentials }
 */
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    const user = findUserByEmail(email);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.add(refreshToken);
    res.json({ accessToken, refreshToken });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Get a new pair of tokens using a refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: New tokens }
 *       401: { description: Invalid or expired refresh token }
 */
app.post('/api/auth/refresh', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ error: 'refreshToken required' });
    }
    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({ error: 'Invalid refresh token' });
    }
    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = users.find((u) => u.id === payload.sub);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        // Rotate refresh token
        refreshTokens.delete(refreshToken);
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        refreshTokens.add(newRefreshToken);
        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user info (protected)
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User data }
 *       401: { description: Unauthorized }
 */
app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = users.find((u) => u.id === req.user.sub);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
    });
});

// ----------------------------------------------------------------------
// User management (admin only)
// ----------------------------------------------------------------------
app.get('/api/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    // Never send passwordHash
    const safeUsers = users.map(({ passwordHash, ...rest }) => rest);
    res.json(safeUsers);
});

app.get('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const user = users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
});

app.put('/api/users/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    const user = users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { email, firstName, lastName, role } = req.body;
    if (email !== undefined) {
        // check uniqueness if changed
        if (email !== user.email && findUserByEmail(email)) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        user.email = email;
    }
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (role !== undefined && ['user', 'seller', 'admin'].includes(role)) {
        user.role = role;
    }
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
});

app.delete('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const index = users.findIndex((u) => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'User not found' });
    users.splice(index, 1);
    res.status(204).send();
});

// ----------------------------------------------------------------------
// Product management
// ----------------------------------------------------------------------
/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         title: { type: string }
 *         category: { type: string }
 *         description: { type: string }
 *         price: { type: number }
 */
app.post('/api/products', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
    const { title, category, description, price } = req.body;
    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const newProduct = {
        id: nanoid(6),
        title,
        category,
        description,
        price: Number(price),
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.get('/api/products', authMiddleware, roleMiddleware(['user', 'seller', 'admin']), (req, res) => {
    res.json(products);
});

app.get('/api/products/:id', authMiddleware, roleMiddleware(['user', 'seller', 'admin']), (req, res) => {
    const product = products.find((p) => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
});

app.put('/api/products/:id', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
    const product = products.find((p) => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const { title, category, description, price } = req.body;
    if (title !== undefined) product.title = title;
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    res.json(product);
});

app.delete('/api/products/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const index = products.findIndex((p) => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });
    products.splice(index, 1);
    res.status(204).send();
});

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Swagger UI at http://localhost:${port}/api-docs`);
});