'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Lock, Eye, EyeOff } from 'lucide-react';

export function LoginScreen() {
    const { login } = useAuth();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(password)) {
            setError('');
        } else {
            setError('パスワードが正しくありません');
            setPassword('');
        }
    };

    return (
        <div className="login-screen">
            <div className="login-card">
                <div className="login-icon">
                    <Lock size={48} />
                </div>
                <h1 className="login-title">開発日記</h1>
                <p className="login-subtitle">パスワードを入力してください</p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="input password-input"
                            placeholder="パスワード"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {error && <p className="login-error">{error}</p>}

                    <button type="submit" className="btn btn-primary login-button">
                        ログイン
                    </button>
                </form>
            </div>
        </div>
    );
}
