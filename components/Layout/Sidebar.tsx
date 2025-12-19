'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BookOpen,
    Calendar,
    Home,
    PlusCircle,
    Tag,
    FolderOpen,
    Star,
    Pin,
    Settings
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'ダッシュボード', icon: Home },
        { href: '/entries', label: '日記一覧', icon: BookOpen },
        { href: '/entries/new', label: '新規作成', icon: PlusCircle },
        { href: '/calendar', label: 'カレンダー', icon: Calendar },
    ];

    const filterItems = [
        { href: '/entries?pinnedOnly=true', label: 'ピン留め', icon: Pin },
        { href: '/entries?favoriteOnly=true', label: 'お気に入り', icon: Star },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <BookOpen size={24} />
                    <span>Dev Diary</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div style={{ padding: '0 1rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        メニュー
                    </span>
                </div>

                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </Link>
                ))}

                <div style={{ padding: '1rem 1rem 0.5rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        フィルター
                    </span>
                </div>

                {filterItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="nav-item"
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </Link>
                ))}

                <div style={{ padding: '1rem 1rem 0.5rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        管理
                    </span>
                </div>

                <Link href="/tags" className="nav-item">
                    <Tag size={20} />
                    <span>タグ管理</span>
                </Link>

                <Link href="/categories" className="nav-item">
                    <FolderOpen size={20} />
                    <span>カテゴリ管理</span>
                </Link>
            </nav>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button className="nav-item" style={{ width: '100%' }}>
                    <Settings size={20} />
                    <span>設定</span>
                </button>
            </div>
        </aside>
    );
}
