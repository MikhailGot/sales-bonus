/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции
   return purchase.quantity * purchase.sale_price * (1 - purchase.discount / 100);
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    // @TODO: Расчет бонуса от позиции в рейтинге
	if( index == 0 ) {
		return seller["profit"] * (15/100);
	} else if( (index > 0) && (index < 3) ){
		return seller["profit"] * (10/100);
	} else if(index == (total - 1)) {
		return 0;
	} else {
		return seller["profit"] * (5/100);
	};
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    // @TODO: Проверка входных данных

    // @TODO: Проверка наличия опций

    // @TODO: Подготовка промежуточных данных для сбора статистики

    // @TODO: Индексация продавцов и товаров для быстрого доступа

    // @TODO: Расчет выручки и прибыли для каждого продавца

    // @TODO: Сортировка продавцов по прибыли

    // @TODO: Назначение премий на основе ранжирования

    // @TODO: Подготовка итоговой коллекции с нужными полями
	
	if( !data || 
		!data.customers || !data.customers.length ||
		!data.products ||  !data.products.length ||
		!data.sellers ||   !data.sellers.length ||
		!data.purchase_records || !data.purchase_records.length ||
		"object" != typeof(options) ||
		!options.calculateRevenue || 
		"function" != typeof(options.calculateRevenue) ||
		"function" != typeof(options.calculateBonus)
	) {
		throw new Error('Некорректные входные данные');
	};
	
	const sellerIndex = Object.fromEntries(data.sellers.map(seller => [seller.id, {
		...seller,
		"products_sold": [],
		"sales_count": 0,
		"profit": 0,
		"revenue": 0
		}]));
	const productIndex = Object.fromEntries(data.products.map(product => [product.sku, product]));
	
	data.purchase_records.forEach(record => {
        const seller = sellerIndex[record.seller_id];
		seller.sales_count++;
		seller.revenue += record.total_amount;
        // Увеличить количество продаж 
        // Увеличить общую сумму всех продаж

        // Расчёт прибыли для каждого товара
        record.items.forEach(item => {
            const product = productIndex[item.sku]; // Товар
			const cost =  product.purchase_price * item.quantity;
			const revenue = options.calculateRevenue(item, product);
			const profit = revenue - cost;
            // Посчитать себестоимость (cost) товара как product.purchase_price, умноженную на количество товаров из чека
            // Посчитать выручку (revenue) с учётом скидки через функцию calculateRevenue
            // Посчитать прибыль: выручка минус себестоимость
        // Увеличить общую накопленную прибыль (profit) у продавца  
			seller.profit += profit;
            // Учёт количества проданных товаров
            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = item.quantity;
            } else {
				seller.products_sold[item.sku] += item.quantity;
			};
            // По артикулу товара увеличить его проданное количество у продавца
        });		
	});
	
	const sellerStats = data.sellers.map(function(item){
		seller = sellerIndex[item.id];
		sortableProductsSold = Object.entries(seller.products_sold).map((item) => ({"sku":item[0], "quantity": item[1]}));
		sortableProductsSold.sort((a,b) => b["quantity"] - a["quantity"]);
		return {
			"seller_id": seller.id,
			"name": `${seller.first_name} ${seller.last_name}`,
			"revenue": seller.revenue.toFixed(2),
			"profit": seller.profit.toFixed(2),
			"sales_count": seller.sales_count,
			"top_products": sortableProductsSold.slice(0,10),
			"bonus": 0
		};
	});
	sellerStats.sort((a,b) => b["profit"] - a["profit"]);
	sellerStats.forEach((seller,index) => seller.bonus = options.calculateBonus(index,sellerStats.length,seller).toFixed(2));
	return sellerStats;
}
