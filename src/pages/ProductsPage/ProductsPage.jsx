import React, { useEffect, useState } from "react";
import "./ProductsPage.scss";
import { api } from "../../api";
import ProductItem from "../../components/ProductItem";
import ProductModal from "../../components/ProductModal";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await api.getProducts();
            setProducts(data);
        } catch (err) {
            console.error(err);
            alert("Ошибка загрузки товаров");
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setModalMode("create");
        setEditingProduct(null);
        setModalOpen(true);
    };

    const openEdit = (product) => {
        setModalMode("edit");
        setEditingProduct(product);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить товар?")) return;
        try {
            await api.deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert("Ошибка удаления");
        }
    };

    const handleSubmitModal = async (payload) => {
        try {
            if (modalMode === "create") {
                const newProduct = await api.createProduct(payload);
                setProducts(prev => [...prev, newProduct]);
            } else {
                const updated = await api.updateProduct(payload.id, payload);
                setProducts(prev => prev.map(p => p.id === payload.id ? updated : p));
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
                    <div className="brand">NeoStore 2026 Admin</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>React + Express CRUD</div>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    <div className="toolbar">
                        <h1>Список товаров</h1>
                        <button className="btn btn--primary" onClick={openCreate}>+ Добавить товар</button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', opacity: 0.5 }}>Загрузка товаров...</div>
                    ) : (
                        <div className="list">
                            {products.map(p => (
                                <ProductItem key={p.id} product={p} onEdit={openEdit} onDelete={handleDelete} />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <footer className="header" style={{ borderBottom: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="header__inner" style={{ fontSize: '13px', opacity: 0.6 }}>
                    © {new Date().getFullYear()} NeoStore 2026. Практическая работа №4.
                </div>
            </footer>

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
