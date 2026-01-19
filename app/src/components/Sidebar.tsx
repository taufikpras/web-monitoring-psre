import { LayoutDashboard, Upload, Database, AlertTriangle, FileText } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

// Defined in vite.config.ts
declare const __APP_VERSION__: string;

export function Sidebar() {
    const [apiVersion, setApiVersion] = useState<string>('...');

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/data', icon: Database, label: 'Data Manager' },
        { to: '/files', icon: FileText, label: 'File Repository' },
        { to: '/upload', icon: Upload, label: 'Upload Certificate' },
        { to: '/tickets', icon: AlertTriangle, label: 'Tickets' },
    ];

    useEffect(() => {
        api.getVersion()
            .then(res => setApiVersion(res.version))
            .catch(() => setApiVersion('Unknown'));
    }, []);

    return (
        <aside style={{
            width: '260px',
            height: '100vh',
            backgroundColor: 'var(--card-bg)',
            borderRight: '1px solid var(--border-color)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 10
        }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, var(--accent-color), var(--accent-hover))',
                    borderRadius: '8px'
                }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>PSRE Monitor</h2>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            color: isActive ? '#fff' : 'var(--text-secondary)',
                            backgroundColor: isActive ? 'var(--accent-color)' : 'transparent',
                            fontWeight: isActive ? 500 : 400,
                            transition: 'all 0.2s',
                        })}
                    >
                        <item.icon size={20} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', opacity: 0.8 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span>Frontend v{__APP_VERSION__}</span>
                    <span>API v{apiVersion}</span>
                </div>
            </div>
        </aside>
    );
}
