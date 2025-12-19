'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  Pin,
  Star,
  PlusCircle,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface Stats {
  totalEntries: number;
  thisMonthEntries: number;
  pinnedEntries: number;
  favoriteEntries: number;
  entriesByCategory: { name: string; count: number; color: string }[];
  entriesByTag: { name: string; count: number; color: string }[];
}

interface Entry {
  id: number;
  title: string;
  content: string;
  created_at: string;
  category_name?: string;
  category_color?: string;
  is_pinned: boolean;
  tags?: { id: number; name: string; color: string }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentEntries, setRecentEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, entriesRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/entries')
        ]);

        const statsData = await statsRes.json();
        const entriesData = await entriesRes.json();

        setStats(statsData);
        setRecentEntries(entriesData.slice(0, 5));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

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
        <h1 className="page-title">ダッシュボード</h1>
        <div className="page-actions">
          <Link href="/entries/new" className="btn btn-primary">
            <PlusCircle size={18} />
            新規作成
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalEntries || 0}</div>
            <div className="stat-label">総エントリ数</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.thisMonthEntries || 0}</div>
            <div className="stat-label">今月の投稿</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
            <Pin size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.pinnedEntries || 0}</div>
            <div className="stat-label">ピン留め</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)' }}>
            <Star size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.favoriteEntries || 0}</div>
            <div className="stat-label">お気に入り</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Recent Entries */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">最近の日記</h3>
            <Link href="/entries" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>
              すべて表示 <ArrowRight size={16} />
            </Link>
          </div>

          {recentEntries.length > 0 ? (
            <div className="entries-list">
              {recentEntries.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/entries/${entry.id}`}
                  className="entry-card"
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    padding: '1rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all var(--transition-fast)'
                  }}>
                    <div className="entry-header">
                      <div className="entry-title">
                        {entry.is_pinned && <Pin size={16} className="icon" />}
                        {entry.title}
                      </div>
                      <div className="entry-meta">
                        <Calendar size={14} />
                        {new Date(entry.created_at).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })}
                      </div>
                    </div>
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
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <BookOpen size={48} />
              <h3>まだ日記がありません</h3>
              <p>最初の日記を書いてみましょう</p>
              <Link href="/entries/new" className="btn btn-primary">
                <PlusCircle size={18} />
                新規作成
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Categories */}
          <div className="card">
            <h3 className="card-title mb-4">カテゴリ別</h3>
            {stats?.entriesByCategory && stats.entriesByCategory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats.entriesByCategory.map((cat) => (
                  <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '4px',
                      background: cat.color
                    }} />
                    <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{cat.name}</span>
                    <span style={{
                      fontWeight: 600,
                      background: 'var(--accent-gradient)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {cat.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm">カテゴリがありません</p>
            )}
          </div>

          {/* Tags */}
          <div className="card">
            <h3 className="card-title mb-4">タグ別</h3>
            {stats?.entriesByTag && stats.entriesByTag.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {stats.entriesByTag.map((tag) => (
                  <span
                    key={tag.name}
                    className="tag"
                    style={{
                      background: `${tag.color}20`,
                      color: tag.color
                    }}
                  >
                    {tag.name}
                    <span style={{
                      marginLeft: '0.25rem',
                      opacity: 0.7
                    }}>
                      ({tag.count})
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm">タグがありません</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="card-title mb-4">クイックアクセス</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/calendar" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <Calendar size={18} />
                カレンダーを見る
              </Link>
              <Link href="/entries?pinnedOnly=true" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <Pin size={18} />
                ピン留め一覧
              </Link>
              <Link href="/entries?favoriteOnly=true" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <Star size={18} />
                お気に入り一覧
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
