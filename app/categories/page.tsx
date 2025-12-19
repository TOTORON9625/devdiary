'use client';

import { useEffect, useState } from 'react';
import { FolderOpen, Plus, Trash2, X } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    color: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#6366f1');

    const colors = [
        '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
        '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'
    ];

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        if (!newCategoryName.trim()) return;

        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName, color: newCategoryColor })
            });

            if (response.ok) {
                await fetchCategories();
                setShowModal(false);
                setNewCategoryName('');
                setNewCategoryColor('#6366f1');
            }
        } catch (error) {
            console.error('Error creating category:', error);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('このカテゴリを削除しますか？')) return;

        try {
            await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
            await fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">カテゴリ管理</h1>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        新規カテゴリ
                    </button>
                </div>
            </div>

            <div className="card">
                {categories.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-md)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '4px',
                                        background: cat.color
                                    }} />
                                    <span style={{ fontWeight: 500 }}>{cat.name}</span>
                                    <span
                                        className="entry-category"
                                        style={{ background: `${cat.color}20`, color: cat.color }}
                                    >
                                        プレビュー
                                    </span>
                                </div>
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => handleDelete(cat.id)}
                                    style={{ color: 'var(--error)' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <FolderOpen size={48} />
                        <h3>カテゴリがありません</h3>
                        <p>新しいカテゴリを作成してください</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">新規カテゴリ</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                    カテゴリ名
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="カテゴリ名を入力..."
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                    カラー
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setNewCategoryColor(color)}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: color,
                                                border: newCategoryColor === color ? '3px solid white' : 'none',
                                                cursor: 'pointer',
                                                transition: 'transform 0.15s ease'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <span style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }}>プレビュー:</span>
                                <span
                                    className="entry-category"
                                    style={{ background: `${newCategoryColor}20`, color: newCategoryColor }}
                                >
                                    {newCategoryName || 'カテゴリ名'}
                                </span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                キャンセル
                            </button>
                            <button className="btn btn-primary" onClick={handleCreate}>
                                作成
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
