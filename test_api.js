const axios = require('axios');

async function testExternalAPI() {
    console.log('--- ТЕСТИРОВАНИЕ ВНЕШНЕГО API (ExchangeRate) ---');
    try {
        // 1. Курс USD к остальным валютам
        const res1 = await axios.get('https://open.er-api.com/v6/latest/USD');
        console.log('1. Курс USD получен успешно (Статус: ' + res1.status + ')');

        // 2. Курс EUR к остальным валютам
        const res2 = await axios.get('https://open.er-api.com/v6/latest/EUR');
        console.log('2. Курс EUR получен успешно (Базовая валюта: ' + res2.data.base_code + ')');

        // 3. Получение курса конкретно для RUB
        const rubRate = res1.data.rates.RUB;
        console.log('3. Текущий курс USD -> RUB: ' + rubRate);

        // 4. Проверка даты последнего обновления
        console.log('4. Дата обновления данных: ' + res1.data.time_last_update_utc);

        // 5. Поиск курса CNY (Юань)
        const cnyRate = res1.data.rates.CNY;
        console.log('5. Курс USD -> CNY: ' + cnyRate);

        console.log('\nВсе 5 запросов выполнены. Сделайте скриншот этого окна для отчета!');
    } catch (error) {
        console.error('Ошибка при запросе:', error.message);
    }
}

testExternalAPI();
