import React, { useEffect, useState } from 'react';

export default function UserModal({ open, mode, initialUser, onClose, onSubmit }) {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('user');

    useEffect(() => {
        if (!open) return;
        setEmail(initialUser?.email ?? '');
        setFirstName(initialUser?.firstName ?? '');
        setLastName(initialUser?.lastName ?? '');
        setRole(initialUser?.role ?? 'user');
    }, [open, initialUser]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email.trim() || !firstName.trim() || !lastName.trim()) {
            return alert('All fields are required');
        }
        onSubmit({
            id: initialUser?.id,
            email: email.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            role,
        });
    };

    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <div className="modal__title">Edit User</div>
                </div>
                <form className="form" onSubmit={handleSubmit}>
                    <label>
                        Email: <input value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
                    </label>
                    <label>
                        First Name: <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </label>
                    <label>
                        Last Name: <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </label>
                    <label>
                        Role:
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="user">User</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                        </select>
                    </label>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn--primary">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}