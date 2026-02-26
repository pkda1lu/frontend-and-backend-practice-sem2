const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const app = express();
const port = 3000;

// Исходные данные: 10 товаров
let products = [
    { id: nanoid(6), name: "CyberVision XR", category: "VR/AR", description: "Очки дополненной реальности с 12K разрешением.", price: 125000, stock: 5 },
    { id: nanoid(6), name: "NeuralLink Solo", category: "Нейроинтерфейсы", description: "Беспроводной чип для управления умным домом мыслями.", price: 89000, stock: 12 },
    { id: nanoid(6), name: "GravityBoard G1", category: "Транспорт", description: "Ховерборд на магнитной подушке.", price: 45000, stock: 7 },
    { id: nanoid(6), name: "CryoCooler Pro", category: "Аксессуары", description: "Портативный охладитель напитков на жидком азоте.", price: 15000, stock: 20 },
    { id: nanoid(6), name: "HoloDisplay X", category: "Мониторы", description: "Голографический проекционный экран.", price: 65000, stock: 3 },
    { id: nanoid(6), name: "PocketStar Mini", category: "Смартфоны", description: "Сверхкомпактный гибкий смартфон.", price: 55000, stock: 15 },
    { id: nanoid(6), name: "AeroDron S1", category: "Дроны", description: "Бесшумный дрон с ИИ-пилотированием.", price: 92000, stock: 4 },
    { id: nanoid(6), name: "BioSense Watch", category: "Носимая электроника", description: "Часы с полным анализом состава крови.", price: 34000, stock: 25 },
    { id: nanoid(6), name: "PulseCore Z", category: "Аудио", description: "Акустическая система, передающая звук через вибрацию костей.", price: 21000, stock: 10 },
    { id: nanoid(6), name: "TitanPad Ultra", category: "Планшеты", description: "Планшет с прозрачным графеновым дисплеем.", price: 110000, stock: 6 }
];

// Настройка парсинга JSON ПЕРЕД маршрутами
app.use(express.json());

// CORS настройка
app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware для логирования
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
            console.log('Body:', req.body);
        }
    });
    next();
});

// Вспомогательная функция
function findProductOr404(id, res) {
    const product = products.find(p => p.id === id);
    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return null;
    }
    return product;
}

// REST Маршруты для товаров
app.get('/api/products', (req, res) => res.json(products));

app.get('/api/products/:id', (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (product) res.json(product);
});

app.post('/api/products', (req, res) => {
    const { name, category, description, price, stock } = req.body || {};
    if (!name) return res.status(400).json({ error: "Name is required" });

    const newProduct = {
        id: nanoid(6),
        name: name.trim(),
        category: (category || "").trim(),
        description: (description || "").trim(),
        price: Number(price) || 0,
        stock: Number(stock) || 0
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.patch('/api/products/:id', (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;

    const { name, category, description, price, stock } = req.body || {};
    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);

    res.json(product);
});

app.delete('/api/products/:id', (req, res) => {
    const id = req.params.id;
    if (!products.some(p => p.id === id)) {
        return res.status(404).json({ error: "Product not found" });
    }
    products = products.filter(p => p.id !== id);
    res.status(204).send();
});

// Ошибка 404 для всех остальных маршрутов
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => console.log(`Сервер магазина на http://localhost:${port}`));
