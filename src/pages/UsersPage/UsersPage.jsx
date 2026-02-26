import React, { useEffect, useState } from "react";
import "./UsersPage.scss";
import { api } from "../../api";
import UserItem from "../../components/UserItem";
import UserModal from "../../components/UserModal";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await api.getUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
            alert("Ошибка загрузки пользователей");
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setModalMode("create");
        setEditingUser(null);
        setModalOpen(true);
    };

    const openEdit = (user) => {
        setModalMode("edit");
        setEditingUser(user);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить пользователя?")) return;
        try {
            await api.deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            alert("Ошибка удаления");
        }
    };

    const handleSubmitModal = async (payload) => {
        try {
            if (modalMode === "create") {
                const newUser = await api.createUser(payload);
                setUsers(prev => [...prev, newUser]);
            } else {
                const updated = await api.updateUser(payload.id, payload);
                setUsers(prev => prev.map(u => u.id === payload.id ? updated : u));
            }
            setModalOpen(false);
        } catch (err) {
            alert("Ошибка сохранения");
        }
    };

    return (
        <div className="page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">Users App [Task #5]</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Swagger Integrated API</div>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    <div className="toolbar">
                        <h1>Пользователи</h1>
                        <button className="btn btn--primary" onClick={openCreate}>+ Создать</button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', opacity: 0.5 }}>Загрузка...</div>
                    ) : (
                        <div className="list">
                            {users.map(u => (
                                <UserItem key={u.id} user={u} onEdit={openEdit} onDelete={handleDelete} />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <footer className="header" style={{ borderBottom: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="header__inner" style={{ fontSize: '13px', opacity: 0.6 }}>
                    © {new Date().getFullYear()} Users Admin. Практическая работа №5.
                </div>
            </footer>

            <UserModal
                open={modalOpen}
                mode={modalMode}
                initialUser={editingUser}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmitModal}
            />
        </div>
    );
}
