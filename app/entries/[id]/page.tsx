'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
    Save,
    ArrowLeft,
    Pin,
    Star,
    Tag,
    FolderOpen,
    ImagePlus,
    Trash2,
    Edit3,
    Eye
} from 'lucide-react';

const MDEditor = dynamic(
    () => import('@uiw/react-md-editor'),
    { ssr: false }
);

const MDPreview = dynamic(
    () => import('@uiw/react-md-editor').then(mod => mod.default.Markdown),
    { ssr: false }
);

interface Category {
    id: number;
    name: string;
    color: string;
}

interface TagItem {
    id: number;
    name: string;
    color: string;
}

interface Entry {
    id: number;
    title: string;
    content: string;
    category_id: number | null;
    is_pinned: boolean;
    is_favorite: boolean;
    created_at: string;
    updated_at: string;
    category_name?: string;
    category_color?: string;
    tags?: TagItem[];
}

export default function EntryPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const [entry, setEntry] = useState<Entry | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [isPinned, setIsPinned] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<TagItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [entryRes, categoriesRes, tagsRes] = await Promise.all([
                    fetch(`/api/entries/${id}`),
                    fetch('/api/categories'),
                    fetch('/api/tags')
                ]);

                if (!entryRes.ok) {
                    router.push('/entries');
                    return;
                }

                const entryData = await entryRes.json();
                setEntry(entryData);
                setTitle(entryData.title);
                setContent(entryData.content || '');
                setCategoryId(entryData.category_id);
                setIsPinned(entryData.is_pinned);
                setIsFavorite(entryData.is_favorite);
                setSelectedTags(entryData.tags?.map((t: TagItem) => t.id) || []);

                setCategories(await categoriesRes.json());
                setTags(await tagsRes.json());
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [id, router]);

    const handleSave = async () => {
        if (!title.trim()) {
            alert('タイトルを入力してください');
            return;
        }

        setSaving(true);
        try {
            const response = await fetch(`/api/entries/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    category_id: categoryId,
                    is_pinned: isPinned,
                    is_favorite: isFavorite,
                    tagIds: selectedTags
                })
            });

            if (response.ok) {
                setEntry(prev => prev ? {
                    ...prev,
                    title,
                    content,
                    category_id: categoryId,
                    is_pinned: isPinned,
                    is_favorite: isFavorite
                } : null);
                setIsEditing(false);
            } else {
                alert('保存に失敗しました');
            }
        } catch (error) {
            console.error('Error saving entry:', error);
            alert('保存に失敗しました');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('この日記を削除しますか？')) return;

        try {
            const response = await fetch(`/api/entries/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                router.push('/entries');
            } else {
                alert('削除に失敗しました');
            }
        } catch (error) {
            console.error('Error deleting entry:', error);
            alert('削除に失敗しました');
        }
    };

    const handleImageUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                const imageMarkdown = `![${file.name}](${data.url})`;
                setContent(prev => prev + '\n' + imageMarkdown);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const toggleTag = (tagId: number) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!entry) {
        return null;
    }

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="page-title" style={{ fontSize: '1.25rem' }}>
                        {isEditing ? '日記を編集' : entry.title}
                    </h1>
                </div>
                <div className="page-actions">
                    {isEditing ? (
                        <>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setIsEditing(false)}
                            >
                                キャンセル
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                <Save size={18} />
                                {saving ? '保存中...' : '保存'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit3 size={18} />
                                編集
                            </button>
                            <button
                                className="btn btn-ghost"
                                onClick={handleDelete}
                                style={{ color: 'var(--error)' }}
                            >
                                <Trash2 size={18} />
                                削除
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="editor-container">
                {isEditing ? (
                    <>
                        {/* Title */}
                        <div className="editor-header">
                            <input
                                type="text"
                                className="editor-title-input"
                                placeholder="タイトルを入力..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* Meta */}
                        <div className="editor-meta">
                            <div className="editor-meta-item">
                                <FolderOpen size={18} />
                                <select
                                    className="input select"
                                    style={{ width: '160px', padding: '0.5rem' }}
                                    value={categoryId || ''}
                                    onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : null)}
                                >
                                    <option value="">カテゴリなし</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                className={`btn ${isPinned ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setIsPinned(!isPinned)}
                                style={{ padding: '0.5rem 0.75rem' }}
                            >
                                <Pin size={18} />
                                ピン留め
                            </button>

                            <button
                                className={`btn ${isFavorite ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setIsFavorite(!isFavorite)}
                                style={{ padding: '0.5rem 0.75rem' }}
                            >
                                <Star size={18} />
                                お気に入り
                            </button>

                            <label className="btn btn-ghost" style={{ padding: '0.5rem 0.75rem', cursor: 'pointer' }}>
                                <ImagePlus size={18} />
                                画像追加
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageUpload(file);
                                    }}
                                />
                            </label>
                        </div>

                        {/* Tags */}
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <Tag size={18} />
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>タグ</span>
                            </div>
                            <div className="tag-selector">
                                {tags.map((tag) => (
                                    <button
                                        key={tag.id}
                                        className={`tag-option ${selectedTags.includes(tag.id) ? 'selected' : ''}`}
                                        style={{
                                            background: `${tag.color}20`,
                                            color: tag.color
                                        }}
                                        onClick={() => toggleTag(tag.id)}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Editor */}
                        <div className="editor-body" data-color-mode="dark">
                            <MDEditor
                                value={content}
                                onChange={(val) => setContent(val || '')}
                                height={500}
                                preview="live"
                            />
                        </div>
                    </>
                ) : (
                    <>
                        {/* View Mode */}
                        <div className="editor-meta">
                            {entry.category_name && (
                                <span
                                    className="entry-category"
                                    style={{
                                        background: `${entry.category_color}20`,
                                        color: entry.category_color
                                    }}
                                >
                                    <FolderOpen size={14} />
                                    {entry.category_name}
                                </span>
                            )}

                            {entry.is_pinned && (
                                <span className="tag" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
                                    <Pin size={14} />
                                    ピン留め
                                </span>
                            )}

                            {entry.is_favorite && (
                                <span className="tag" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                                    <Star size={14} />
                                    お気に入り
                                </span>
                            )}

                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: 'auto' }}>
                                作成: {new Date(entry.created_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
                            </span>
                        </div>

                        {/* Tags */}
                        {entry.tags && entry.tags.length > 0 && (
                            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                                <div className="entry-tags" style={{ margin: 0 }}>
                                    {entry.tags.map((tag) => (
                                        <span
                                            key={tag.id}
                                            className="tag"
                                            style={{
                                                background: `${tag.color}20`,
                                                color: tag.color
                                            }}
                                        >
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Content Preview */}
                        <div className="editor-body" data-color-mode="dark">
                            <MDPreview
                                source={entry.content || '*内容がありません*'}
                                style={{
                                    padding: '1.5rem',
                                    background: 'transparent'
                                }}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
