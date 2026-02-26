import React from "react";

export default function UserItem({ user, onEdit, onDelete }) {
    return (
        <div className="product-item">
            <div className="product-item__header">
                <span className="product-item__id">#{user.id}</span>
            </div>
            <h3 className="product-item__name">{user.name}</h3>
            <div className="product-item__price">{user.age} лет</div>
            <div className="product-item__footer">
                <button className="btn btn--primary" onClick={() => onEdit(user)}>Редактировать</button>
                <button className="btn btn--danger" onClick={() => onDelete(user.id)}>Удалить</button>
            </div>
        </div>
    );
}
