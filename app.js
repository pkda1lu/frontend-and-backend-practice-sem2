const express = require('express');
const app = express();
const port = 3000;

// Инициализируем список товаров (согласно заданию: id, название, стоимость)
let products = [
    { id: 1, name: 'Монитор LG 27"', price: 25000 },
    { id: 2, name: 'Клавиатура Razer', price: 8500 },
    { id: 3, name: 'Мышь Logitech G502', price: 6200 }
];

// Middleware для парсинга JSON (согласно методичке)
app.use(express.json());

// 1. Просмотр всех товаров (GET /products)
app.get('/products', (req, res) => {
    res.json(products);
});

// 2. Просмотр товара по id (GET /products/:id)
app.get('/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    if (!product) {
        return res.status(404).json({ message: 'Товар не найден' });
    }
    res.json(product);
});

// 3. Добавление товара (POST /products)
app.post('/products', (req, res) => {
    const { name, price } = req.body;
    
    const newProduct = {
        id: Date.now(), // Используем Date.now() как в методичке
        name,
        price
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

// 4. Редактирование товара (PATCH /products/:id)
app.patch('/products/:id', (req, res) => {
    let product = products.find(p => p.id == req.params.id);
    
    if (!product) {
        return res.status(404).json({ message: 'Товар не найден' });
    }

    const { name, price } = req.body;
    
    // Проверка undefined как в методичке
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;

    res.json(product);
});

// 5. Удаление товара (DELETE /products/:id)
app.delete('/products/:id', (req, res) => {
    products = products.filter(p => p.id != req.params.id);
    res.send('Ok'); // Ответ как в методичке
});

// Запуск сервера (согласно методичке)
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
