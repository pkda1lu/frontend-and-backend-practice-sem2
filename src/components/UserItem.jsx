import React from 'react';

export default function UserItem({ user, onEdit, onDelete }) {
    return (
        <div className="product-item">
            <div className="product-item__header">
                <span className="product-item__id">#{user.id}</span>
                <span className="product-item__category">{user.role}</span>
            </div>
            <h3 className="product-item__name">
                {user.firstName} {user.lastName}
            </h3>
            <div className="product-item__price">{user.email}</div>
            <div className="product-item__footer">
                <button className="btn btn--primary" onClick={() => onEdit(user)}>
                    Edit
                </button>
                <button className="btn btn--danger" onClick={() => onDelete(user.id)}>
                    Delete
                </button>
            </div>
        </div>
    );
}