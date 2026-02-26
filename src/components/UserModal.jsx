import React, { useEffect, useState } from "react";

export default function UserModal({ open, mode, initialUser, onClose, onSubmit }) {
    const [name, setName] = useState("");
    const [age, setAge] = useState("");

    useEffect(() => {
        if (!open) return;
        setName(initialUser?.name ?? "");
        setAge(initialUser?.age ?? "");
    }, [open, initialUser]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        const parsedAge = Number(age);

        if (!trimmed) return alert("Введите имя");
        if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 120) return alert("Введите корректный возраст (0-120)");

        onSubmit({
            id: initialUser?.id,
            name: trimmed,
            age: parsedAge
        });
    };

    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div className="modal" onMouseDown={e => e.stopPropagation()}>
                <div className="modal__header">
                    <div className="modal__title">
                        {mode === "edit" ? "Редактирование пользователя" : "Добавление пользователя"}
                    </div>
                </div>
                <form className="form" onSubmit={handleSubmit}>
                    <label>Имя: <input value={name} onChange={e => setName(e.target.value)} autoFocus /></label>
                    <label>Возраст: <input type="number" value={age} onChange={e => setAge(e.target.value)} /></label>
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
