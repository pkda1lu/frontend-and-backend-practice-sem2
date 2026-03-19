import React, { useEffect, useState } from 'react';
import './UsersPage.scss';
import { userApi } from '../api';
import UserItem from '../components/UserItem';
import UserModal from '../components/UserModal';
import { useAuth } from '../context/AuthContext';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('edit'); // only edit for admin
    const [editingUser, setEditingUser] = useState(null);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const { data } = await userApi.getUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
            alert('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (user) => {
        setModalMode('edit');
        setEditingUser(user);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete user?')) return;
        try {
            await userApi.deleteUser(id);
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleSubmitModal = async (payload) => {
        try {
            const { data } = await userApi.updateUser(payload.id, payload);
            setUsers((prev) => prev.map((u) => (u.id === payload.id ? data : u)));
            setModalOpen(false);
        } catch (err) {
            alert('Update failed');
        }
    };

    // Only admin can see this page (already protected by route)
    return (
        <div className="page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">User Management (Admin)</div>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    <h1>Users</h1>
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="list">
                            {users.map((u) => (
                                <UserItem
                                    key={u.id}
                                    user={u}
                                    onEdit={openEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

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