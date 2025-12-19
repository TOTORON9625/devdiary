'use client';

import { ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import { LoginScreen } from '@/components/LoginScreen';
import Sidebar from '@/components/Layout/Sidebar';

function AuthenticatedLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <LoginScreen />;
    }

    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}

interface ClientLayoutProps {
    children: ReactNode;
    password: string;
}

export function ClientLayout({ children, password }: ClientLayoutProps) {
    return (
        <AuthProvider password={password}>
            <AuthenticatedLayout>{children}</AuthenticatedLayout>
        </AuthProvider>
    );
}
