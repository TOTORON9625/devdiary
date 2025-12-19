'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
    Save,
    ArrowLeft,
    Pin,
    Star,
    Tag,
    FolderOpen,
    ImagePlus
} from 'lucide-react';

const MDEditor = dynamic(
    () => import('@uiw/react-md-editor'),
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

export default function NewEntryPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [isPinned, setIsPinned] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<TagItem[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const [categoriesRes, tagsRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/tags')
                ]);

                setCategories(await categoriesRes.json());
                setTags(await tagsRes.json());
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        fetchData();
    }, []);

    const handleSave = async () => {
        if (!title.trim()) {
            alert('タイトルを入力してください');
            return;
        }

        setSaving(true);
        try {
            const response = await fetch('/api/entries', {
                method: 'POST',
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
                const data = await response.json();
                router.push(`/entries/${data.id}`);
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
                    <h1 className="page-title">新規日記</h1>
                </div>
                <div className="page-actions">
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <Save size={18} />
                        {saving ? '保存中...' : '保存'}
                    </button>
                </div>
            </div>

            <div className="editor-container">
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
            </div>
        </div>
    );
}
