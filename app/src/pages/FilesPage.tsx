import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { FileText, Trash2, RefreshCw, Search } from 'lucide-react';

type FileTab = 'ca' | 'non-ca';

export function FilesPage() {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<FileTab>('ca');
    const [selectedCA, setSelectedCA] = useState<string>('all');

    const fetchFiles = () => {
        setLoading(true);
        setError(null);
        api.getFiles()
            .then(res => {
                setFiles(Array.isArray(res) ? res : []);
            })
            .catch(err => {
                console.error(err);
                setError(`Failed to load files: ${err.message}`);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    // Separate files by type (needed by handleDeleteAll)
    const caFiles = files.filter(f => f.isca === true);
    const nonCaFiles = files.filter(f => f.isca === false);

    const handleDelete = async (dn: string, keyid: string) => {
        if (confirm('Are you sure you want to delete this file?')) {
            try {
                await api.deleteFile(dn, keyid);
                fetchFiles();
            } catch (err: any) {
                alert(`Failed to delete: ${err.message}`);
            }
        }
    };

    const handleDeleteAll = async () => {
        const tabName = activeTab === 'ca' ? 'CA' : 'Non-CA';
        const currentFiles = activeTab === 'ca' ? caFiles : nonCaFiles;

        if (currentFiles.length === 0) {
            alert(`No ${tabName} files to delete.`);
            return;
        }

        if (confirm(`Are you sure you want to delete ALL ${tabName} files (${currentFiles.length} files)? This action cannot be undone.`)) {
            try {
                // Delete each file in the current tab
                for (const file of currentFiles) {
                    await api.deleteFile(file.dn, file.keyid);
                }
                fetchFiles();
                alert(`Successfully deleted ${currentFiles.length} ${tabName} files.`);
            } catch (err: any) {
                alert(`Failed to delete all: ${err.message}`);
            }
        }
    };

    // Get unique CA names from non-CA files (issuercn)
    const uniqueCAs = Array.from(new Set(nonCaFiles.map(f => f.issuercn).filter(Boolean))).sort();

    // Get current tab files
    let currentTabFiles = activeTab === 'ca' ? caFiles : nonCaFiles;

    // Apply CA filter for non-CA tab
    if (activeTab === 'non-ca' && selectedCA !== 'all') {
        currentTabFiles = currentTabFiles.filter(f => f.issuercn === selectedCA);
    }

    // Filter files based on search
    const filteredFiles = currentTabFiles.filter(f =>
        (f.dn && f.dn.toLowerCase().includes(search.toLowerCase())) ||
        (f.cn && f.cn.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>File Repository</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn"
                        style={{ backgroundColor: 'var(--error-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={handleDeleteAll}
                        disabled={loading || currentTabFiles.length === 0}
                    >
                        <Trash2 size={18} />
                        Delete All {activeTab === 'ca' ? 'CA' : 'Non-CA'} Files
                    </button>
                    <button className="btn btn-secondary" onClick={fetchFiles}>
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#ef444420', color: '#ef4444', borderRadius: '8px' }}>
                    {error}
                </div>
            )}

            {/* Tab Switcher */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border-color)' }}>
                <button
                    onClick={() => {
                        setActiveTab('ca');
                        setSelectedCA('all'); // Reset CA filter when switching tabs
                    }}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'ca' ? '2px solid var(--accent-color)' : '2px solid transparent',
                        color: activeTab === 'ca' ? 'var(--accent-color)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'ca' ? 600 : 400,
                        cursor: 'pointer',
                        marginBottom: '-2px',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    CA Certificates
                    <span style={{
                        padding: '0.125rem 0.5rem',
                        borderRadius: '12px',
                        backgroundColor: activeTab === 'ca' ? 'var(--accent-color)' : 'var(--border-color)',
                        color: activeTab === 'ca' ? '#000' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600
                    }}>
                        {caFiles.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('non-ca')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'non-ca' ? '2px solid var(--accent-color)' : '2px solid transparent',
                        color: activeTab === 'non-ca' ? 'var(--accent-color)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'non-ca' ? 600 : 400,
                        cursor: 'pointer',
                        marginBottom: '-2px',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    Non-CA Certificates
                    <span style={{
                        padding: '0.125rem 0.5rem',
                        borderRadius: '12px',
                        backgroundColor: activeTab === 'non-ca' ? 'var(--accent-color)' : 'var(--border-color)',
                        color: activeTab === 'non-ca' ? '#000' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600
                    }}>
                        {nonCaFiles.length}
                    </span>
                </button>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            className="input"
                            placeholder="Search by DN or CN..."
                            style={{ paddingLeft: '3rem' }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {activeTab === 'non-ca' && (
                        <select
                            className="input"
                            style={{ minWidth: '200px' }}
                            value={selectedCA}
                            onChange={(e) => setSelectedCA(e.target.value)}
                        >
                            <option value="all">All CAs</option>
                            {uniqueCAs.map(ca => (
                                <option key={ca} value={ca}>{ca}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>File</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Issuer</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Updated</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-secondary)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>Loading files...</td></tr>
                        ) : filteredFiles.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No files found</td></tr>
                        ) : (
                            filteredFiles.map((file: any, i: number) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FileText size={16} color="var(--accent-color)" />
                                            {file.cn || 'Unknown CN'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                            {file.dn}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', verticalAlign: 'top', fontSize: '0.875rem' }}>
                                        <div>{file.issuercn}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{file.issuerdn}</div>
                                    </td>
                                    <td style={{ padding: '1rem', verticalAlign: 'top', fontSize: '0.875rem' }}>
                                        {file.updated ? new Date(file.updated).toLocaleString() : '-'}
                                    </td>
                                    <td style={{ padding: '1rem', verticalAlign: 'top', textAlign: 'right' }}>
                                        <button
                                            style={{ color: 'var(--error-color)', padding: '0.5rem' }}
                                            onClick={() => handleDelete(file.dn, file.keyid)}
                                            title="Delete"
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
