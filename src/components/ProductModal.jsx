import React, { useEffect, useState } from "react";

export default function ProductModal({ open, mode, initialProduct, onClose, onSubmit }) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");

    useEffect(() => {
        if (!open) return;
        setName(initialProduct?.name ?? "");
        setCategory(initialProduct?.category ?? "");
        setDescription(initialProduct?.description ?? "");
        setPrice(initialProduct?.price ?? "");
        setStock(initialProduct?.stock ?? "");
    }, [open, initialProduct]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return alert("Введите название");

        onSubmit({
            id: initialProduct?.id,
            name: trimmed,
            category: category.trim(),
            description: description.trim(),
            price: Number(price),
            stock: Number(stock)
        });
    };

    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div className="modal" onMouseDown={e => e.stopPropagation()}>
                <div className="modal__header">
                    <div className="modal__title">
                        {mode === "edit" ? "Редактирование товара" : "Добавление товара"}
                    </div>
                </div>
                <form className="form" onSubmit={handleSubmit}>
                    <label>Название: <input value={name} onChange={e => setName(e.target.value)} autoFocus /></label>
                    <label>Категория: <input value={category} onChange={e => setCategory(e.target.value)} /></label>
                    <label>Описание: <textarea value={description} onChange={e => setDescription(e.target.value)} /></label>
                    <label>Цена: <input type="number" value={price} onChange={e => setPrice(e.target.value)} /></label>
                    <label>Количество: <input type="number" value={stock} onChange={e => setStock(e.target.value)} /></label>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn" onClick={onClose}>Отмена</button>
                        <button type="submit" className="btn btn--primary">
                            {mode === "edit" ? "Сохранить" : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
