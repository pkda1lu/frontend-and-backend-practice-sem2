import React from "react";

export default function ProductItem({ product, onEdit, onDelete }) {
    return (
        <div className="product-item">
            <div className="product-item__header">
                <span className="product-item__category">{product.category}</span>
                <span className="product-item__id">#{product.id}</span>
            </div>
            <h3 className="product-item__name">{product.name}</h3>
            <p className="product-item__description">{product.description}</p>
            <div className="product-item__price">{product.price.toLocaleString()} ₽</div>
            <div className="product-item__stock">На складе: {product.stock}</div>
            <div className="product-item__footer">
                <button className="btn btn--primary" onClick={() => onEdit(product)}>Редактировать</button>
                <button className="btn btn--danger" onClick={() => onDelete(product.id)}>Удалить</button>
            </div>
        </div>
    );
}
