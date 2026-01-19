import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Search, Trash2, RefreshCw, Shield } from 'lucide-react';

export function DataList() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const fetchData = (dn?: string) => {
        setLoading(true);
        setError(null);
        api.getData(dn)
            .then(res => {
                // API returns an object { "1": { ca: {...}, ... }, "2": ... }
                // Transform into array
                if (typeof res === 'object' && res !== null && !Array.isArray(res)) {
                    const list = Object.entries(res).map(([id, val]: [string, any]) => ({
                        id,
                        ...val
                    }));
                    setData(list);
                } else {
                    // Fallback for array response
                    setData(Array.isArray(res) ? res : []);
                }
            })
            .catch(err => {
                console.error(err);
                setError(`Failed to load data: ${err.message}`);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (dn: string, keyid: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                await api.deleteData(dn, keyid);
                fetchData(search);
            } catch (err: any) {
                alert(`Failed to delete: ${err.message}`);
            }
        }
    };

    const handleDeleteAll = async () => {
        if (confirm('Are you sure you want to delete ALL data? This action cannot be undone.')) {
            try {
                await api.deleteAllData();
                fetchData(search);
            } catch (err: any) {
                alert(`Failed to delete all: ${err.message}`);
            }
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Data Manager</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn"
                        style={{ backgroundColor: 'var(--error-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={handleDeleteAll}
                        disabled={loading || data.length === 0}
                    >
                        <Trash2 size={18} />
                        Delete All
                    </button>
                    <button className="btn btn-secondary" onClick={() => fetchData(search)}>
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#ef444420', color: '#ef4444', borderRadius: '8px' }}>
                    {error}
                </div>
            )}

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            className="input"
                            placeholder="Search DN..."
                            style={{ paddingLeft: '3rem' }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchData(search)}
                        />
                    </div>
                    <button className="btn" onClick={() => fetchData(search)}>Search</button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>ID</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Certificate Authority</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>CRL & OCSP</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Last Updated</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-secondary)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading data...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No records found</td></tr>
                        ) : (
                            data.map((item: any) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', verticalAlign: 'top' }}>{item.id}</td>
                                    <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Shield size={16} color="var(--accent-color)" />
                                            {item.ca?.cn || '-'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                            {item.ca?.dn || '-'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', verticalAlign: 'top', fontSize: '0.875rem' }}>
                                        {/* CRLS */}
                                        {item.crls && item.crls.length > 0 && (
                                            <div style={{ marginBottom: '0.5rem' }}>
                                                <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>CRLs:</strong>
                                                <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.25rem' }}>
                                                    {item.crls.map((c: any, idx: number) => (
                                                        <li key={idx} style={{ marginBottom: '0.25rem' }}>
                                                            <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', wordBreak: 'break-all' }}>
                                                                {c.url}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {/* OCSPS */}
                                        {item.ocsps && item.ocsps.length > 0 && (
                                            <div>
                                                <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>OCSPs:</strong>
                                                <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.25rem' }}>
                                                    {item.ocsps.map((o: any, idx: number) => (
                                                        <li key={idx} style={{ marginBottom: '0.25rem' }}>
                                                            <a href={o.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', wordBreak: 'break-all' }}>
                                                                {o.url}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {!item.crls?.length && !item.ocsps?.length && <span style={{ color: 'var(--text-secondary)' }}>-</span>}
                                    </td>
                                    <td style={{ padding: '1rem', verticalAlign: 'top', fontSize: '0.875rem' }}>
                                        {item.ca?.updated ? new Date(item.ca.updated).toLocaleString() : '-'}
                                    </td>
                                    <td style={{ padding: '1rem', verticalAlign: 'top', textAlign: 'right' }}>
                                        <button
                                            style={{ color: 'var(--error-color)', padding: '0.5rem' }}
                                            onClick={() => item.ca && handleDelete(item.ca.dn, item.ca.keyid)}
                                            title="Delete"
                                            disabled={!item.ca}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
