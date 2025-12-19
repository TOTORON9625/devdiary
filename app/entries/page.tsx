'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Search,
    PlusCircle,
    Calendar,
    Pin,
    Star,
    BookOpen,
    Filter
} from 'lucide-react';

interface Entry {
    id: number;
    title: string;
    content: string;
    created_at: string;
    category_name?: string;
    category_color?: string;
    is_pinned: boolean;
    is_favorite: boolean;
    tags?: { id: number; name: string; color: string }[];
}

interface Category {
    id: number;
    name: string;
    color: string;
}

function EntriesContent() {
    const searchParams = useSearchParams();
    const [entries, setEntries] = useState<Entry[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    const pinnedOnly = searchParams.get('pinnedOnly') === 'true';
    const favoriteOnly = searchParams.get('favoriteOnly') === 'true';

    useEffect(() => {
        async function fetchData() {
            try {
                const params = new URLSearchParams();
                if (searchQuery) params.set('search', searchQuery);
                if (selectedCategory) params.set('categoryId', selectedCategory);
                if (pinnedOnly) params.set('pinnedOnly', 'true');
                if (favoriteOnly) params.set('favoriteOnly', 'true');

                const [entriesRes, categoriesRes] = await Promise.all([
                    fetch(`/api/entries?${params.toString()}`),
                    fetch('/api/categories')
                ]);

                const entriesData = await entriesRes.json();
                const categoriesData = await categoriesRes.json();

                setEntries(entriesData);
                setCategories(categoriesData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [searchQuery, selectedCategory, pinnedOnly, favoriteOnly]);

    const getPageTitle = () => {
        if (pinnedOnly) return 'ピン留めした日記';
        if (favoriteOnly) return 'お気に入りの日記';
        return '日記一覧';
    };

    const getExcerpt = (content: string) => {
        const plainText = content.replace(/[#*`>\-\[\]()!]/g, '').trim();
        return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">{getPageTitle()}</h1>
                <div className="page-actions">
                    <Link href="/entries/new" className="btn btn-primary">
                        <PlusCircle size={18} />
                        新規作成
                    </Link>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="search-bar">
                <div className="search-input-wrapper">
                    <Search />
                    <input
                        type="text"
                        className="input"
                        placeholder="日記を検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filters">
                    <select
                        className="input select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ width: '180px' }}
                    >
                        <option value="">すべてのカテゴリ</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Entries List */}
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            ) : entries.length > 0 ? (
                <div className="entries-list">
                    {entries.map((entry) => (
                        <Link
                            key={entry.id}
                            href={`/entries/${entry.id}`}
                            className="entry-card"
                        >
                            <div className="card">
                                <div className="entry-header">
                                    <div className="entry-title">
                                        {entry.is_pinned && <Pin size={16} className="icon" />}
                                        {entry.is_favorite && <Star size={16} style={{ color: 'var(--warning)' }} />}
                                        {entry.title}
                                    </div>
                                    <div className="entry-meta">
                                        {entry.category_name && (
                                            <span
                                                className="entry-category"
                                                style={{
                                                    background: `${entry.category_color}20`,
                                                    color: entry.category_color
                                                }}
                                            >
                                                {entry.category_name}
                                            </span>
                                        )}
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Calendar size={14} />
                                            {new Date(entry.created_at).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })}
                                        </span>
                                    </div>
                                </div>

                                <p className="entry-excerpt">
                                    {getExcerpt(entry.content || '')}
                                </p>

                                {entry.tags && entry.tags.length > 0 && (
                                    <div className="entry-tags">
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
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <BookOpen size={64} />
                    <h3>日記が見つかりません</h3>
                    <p>
                        {searchQuery || selectedCategory
                            ? '検索条件に一致する日記がありません'
                            : '最初の日記を書いてみましょう'
                        }
                    </p>
                    <Link href="/entries/new" className="btn btn-primary">
                        <PlusCircle size={18} />
                        新規作成
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function EntriesPage() {
    return (
        <Suspense fallback={<div className="loading-container"><div className="loading-spinner"></div></div>}>
            <EntriesContent />
        </Suspense>
    );
}

