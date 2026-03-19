import React, { useEffect, useState } from 'react';
import { productApi } from '../api';
import ProductItem from '../components/ProductItem';
import ProductModal from '../components/ProductModal';
import { useAuth } from '../context/AuthContext';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [editingProduct, setEditingProduct] = useState(null);
    const { user } = useAuth();

    const loadProducts = async () => {
        try {
            setLoading(true);
            const { data } = await productApi.getProducts();
            setProducts(data);
        } catch (err) {
            console.error(err);
            alert('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const openCreate = () => {
        setModalMode('create');
        setEditingProduct(null);
        setModalOpen(true);
    };

    const openEdit = (product) => {
        setModalMode('edit');
        setEditingProduct(product);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete product?')) return;
        try {
            await productApi.deleteProduct(id);
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleSubmitModal = async (payload) => {
        try {
            if (modalMode === 'create') {
                const { data } = await productApi.createProduct(payload);
                setProducts((prev) => [...prev, data]);
            } else {
                const { data } = await productApi.updateProduct(payload.id, payload);
                setProducts((prev) => prev.map((p) => (p.id === payload.id ? data : p)));
            }
            setModalOpen(false);
        } catch (err) {
            alert('Save failed');
        }
    };

    // Determine if user can create/edit/delete based on role
    const canCreate = user && (user.role === 'seller' || user.role === 'admin');
    const canEdit = user && (user.role === 'seller' || user.role === 'admin');
    const canDelete = user && user.role === 'admin';

    return (
        <div className="page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">Products</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)' }}>Role: {user?.role}</div>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    <div className="toolbar">
                        <h1>Products</h1>
                        {canCreate && (
                            <button className="btn btn--primary" onClick={openCreate}>
                                + Create
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', opacity: 0.5 }}>Loading...</div>
                    ) : (
                        <div className="list">
                            {products.map((p) => (
                                <ProductItem
                                    key={p.id}
                                    product={p}
                                    onEdit={canEdit ? openEdit : null}
                                    onDelete={canDelete ? handleDelete : null}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <ProductModal
                open={modalOpen}
                mode={modalMode}
                initialProduct={editingProduct}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmitModal}
            />
        </div>
    );
}