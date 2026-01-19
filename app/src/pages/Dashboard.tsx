import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Activity, Shield, FileText, AlertTriangle } from 'lucide-react';

export function Dashboard() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({
        total_ca: 0,
        total_crl: 0,
        total_ocsp: 0,
        total_files: 0,
        total_tickets: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch Chart Data
        api.getVAReport24h()
            .then(res => {
                // Transform { crl: { cn: val }, ocsp: { cn: val } } to [{ name: cn, crl: val, ocsp: val }]
                if (res && res.crl && res.ocsp) {
                    const cns = new Set([...Object.keys(res.crl), ...Object.keys(res.ocsp)]);
                    const transformed = Array.from(cns).map(cn => ({
                        name: cn,
                        crl: res.crl[cn] || 0,
                        ocsp: res.ocsp[cn] || 0
                    }));
                    setReportData(transformed);
                }
            })
            .catch(console.error);

        // Fetch Stats
        api.getStats()
            .then(res => setStats(res))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading overview...</div>;
    }

    return (
        <div>
            <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Dashboard Overview</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard title="Total CAs" value={stats.total_ca} icon={Shield} color="var(--accent-color)" />
                <StatCard title="Total Files" value={stats.total_files} icon={FileText} color="var(--success-color)" />
                <StatCard title="Active CRLs" value={stats.total_crl} icon={Activity} color="var(--text-secondary)" />
                <StatCard title="Active OCSPs" value={stats.total_ocsp} icon={Shield} color="var(--text-secondary)" />
                <StatCard title="Open Tickets" value={stats.total_tickets} icon={AlertTriangle} color="#f59e0b" />
            </div>

            <div>
                <h3 style={{ marginBottom: '1.5rem' }}>VA Availability (24H)</h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    {reportData.map((ca) => (
                        <VAAvailabilityCard
                            key={ca.name}
                            caName={ca.name}
                            crlAvailability={ca.crl}
                            ocspAvailability={ca.ocsp}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }: any) {
    return (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
                padding: '1rem',
                borderRadius: '12px',
                backgroundColor: `${color}20`,
                color: color
            }}>
                <Icon size={24} />
            </div>
            <div>
                <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</p>
            </div>
        </div>
    );
}

function VAAvailabilityCard({ caName, crlAvailability, ocspAvailability }: {
    caName: string;
    crlAvailability: number;
    ocspAvailability: number;
}) {
    const getStatusColor = (availability: number) => {
        if (availability > 80) return 'var(--success-color)';
        if (availability >= 71) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="card" style={{
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
        }}>
            <h4 style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }} title={caName}>
                {caName}
            </h4>

            <div style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>CRL</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: getStatusColor(crlAvailability)
                        }}>
                            {crlAvailability.toFixed(1)}%
                        </span>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(crlAvailability)
                        }} />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>OCSP</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: getStatusColor(ocspAvailability)
                        }}>
                            {ocspAvailability.toFixed(1)}%
                        </span>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(ocspAvailability)
                        }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
