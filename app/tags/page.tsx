'use client';

import { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, X } from 'lucide-react';

interface TagItem {
    id: number;
    name: string;
    color: string;
}

export default function TagsPage() {
    const [tags, setTags] = useState<TagItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('#8b5cf6');

    const colors = [
        '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
        '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'
    ];

    useEffect(() => {
        fetchTags();
    }, []);

    async function fetchTags() {
        try {
            const response = await fetch('/api/tags');
            const data = await response.json();
            setTags(data);
        } catch (error) {
            console.error('Error fetching tags:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        if (!newTagName.trim()) return;

        try {
            const response = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTagName, color: newTagColor })
            });

            if (response.ok) {
                await fetchTags();
                setShowModal(false);
                setNewTagName('');
                setNewTagColor('#8b5cf6');
            }
        } catch (error) {
            console.error('Error creating tag:', error);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('このタグを削除しますか？')) return;

        try {
            await fetch(`/api/tags?id=${id}`, { method: 'DELETE' });
            await fetchTags();
        } catch (error) {
            console.error('Error deleting tag:', error);
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
                <h1 className="page-title">タグ管理</h1>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        新規タグ
                    </button>
                </div>
            </div>

            <div className="card">
                {tags.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {tags.map((tag) => (
                            <div
                                key={tag.id}
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
                                        borderRadius: '50%',
                                        background: tag.color
                                    }} />
                                    <span style={{ fontWeight: 500 }}>{tag.name}</span>
                                    <span
                                        className="tag"
                                        style={{ background: `${tag.color}20`, color: tag.color }}
                                    >
                                        プレビュー
                                    </span>
                                </div>
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => handleDelete(tag.id)}
                                    style={{ color: 'var(--error)' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Tag size={48} />
                        <h3>タグがありません</h3>
                        <p>新しいタグを作成してください</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">新規タグ</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                    タグ名
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="タグ名を入力..."
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
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
                                            onClick={() => setNewTagColor(color)}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: color,
                                                border: newTagColor === color ? '3px solid white' : 'none',
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
                                    className="tag"
                                    style={{ background: `${newTagColor}20`, color: newTagColor }}
                                >
                                    {newTagName || 'タグ名'}
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
