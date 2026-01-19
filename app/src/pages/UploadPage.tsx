import { useState } from 'react';
import { api } from '../lib/api';
import { Upload, File, Check, AlertCircle } from 'lucide-react';

export function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const [uploadResult, setUploadResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const validExtensions = ['zip', 'pem', 'crt', 'der'];
            const ext = selectedFile.name.split('.').pop()?.toLowerCase();

            if (ext && validExtensions.includes(ext)) {
                setFile(selectedFile);
                setStatus('idle');
                setMessage('');
                setUploadResult(null); // Clear previous result
            } else {
                setStatus('error');
                setMessage('Invalid file type. Only .zip, .pem, .crt, .der allowed.');
                setFile(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setStatus('idle');
        setUploadResult(null);
        try {
            const res = await api.uploadFile(file);
            setStatus('success');
            setMessage('File uploaded successfully!');
            setUploadResult(res);
            setFile(null);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Upload Certificate</h1>

            <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto'
                }}>
                    <Upload size={40} color="var(--accent-color)" />
                </div>

                <h3 style={{ marginBottom: '0.5rem' }}>Select File to Upload</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Supported formats: .zip, .pem, .crt, .der
                </p>

                <div style={{ marginBottom: '2rem' }}>
                    <input
                        type="file"
                        id="file-upload"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept=".zip,.pem,.crt,.der"
                    />
                    <label
                        htmlFor="file-upload"
                        className="btn btn-secondary"
                        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <File size={18} />
                        {file ? file.name : 'Choose File'}
                    </label>
                </div>

                {message && (
                    <div style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        backgroundColor: status === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: status === 'success' ? 'var(--success-color)' : 'var(--error-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        {status === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                        {message}
                    </div>
                )}

                <button
                    className="btn"
                    disabled={!file || loading}
                    onClick={handleUpload}
                    style={{ width: '100%', opacity: !file || loading ? 0.5 : 1 }}
                >
                    {loading ? 'Uploading...' : 'Upload File'}
                </button>
            </div>

            {uploadResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Files Table */}
                    {uploadResult.files && uploadResult.files.length > 0 && (
                        <div>
                            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <File size={24} color="var(--accent-color)" />
                                Uploaded Files
                            </h2>
                            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Subject DN</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Issuer DN</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Is CA</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {uploadResult.files.map((file: any, i: number) => (
                                            <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{file.dn}</td>
                                                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{file.issuerdn}</td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    {file.isca ? (
                                                        <span style={{
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '4px',
                                                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                                            color: 'var(--success-color)',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600
                                                        }}>YES</span>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>No</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                    {new Date(file.updated).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Verifiers Table (CRLs & OCSPs) */}
                    {(uploadResult.crls?.length > 0 || uploadResult.ocsps?.length > 0) && (
                        <div>
                            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Check size={24} color="var(--accent-color)" />
                                Updated Verifiers (CRL & OCSP)
                            </h2>
                            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Type</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>URL</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Issuer DN</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Issuer File ID</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Render CRLs */}
                                        {uploadResult.crls?.map((crl: any, i: number) => (
                                            <tr key={`crl-${i}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        backgroundColor: 'rgba(234, 179, 8, 0.1)',
                                                        color: 'var(--warning-color)',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600
                                                    }}>CRL</span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <a href={crl.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontSize: '0.875rem' }}>
                                                        {crl.url}
                                                    </a>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{crl.issuer_dn}</td>
                                                <td style={{ padding: '1rem', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{crl.issuer_file_id}</td>
                                                <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                    {new Date(crl.updated).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                        {/* Render OCSPs */}
                                        {uploadResult.ocsps?.map((ocsp: any, i: number) => (
                                            <tr key={`ocsp-${i}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                                                        color: '#a855f7',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600
                                                    }}>OCSP</span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <a href={ocsp.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontSize: '0.875rem' }}>
                                                        {ocsp.url}
                                                    </a>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{ocsp.issuer_dn}</td>
                                                <td style={{ padding: '1rem', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{ocsp.issuer_file_id}</td>
                                                <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                    {new Date(ocsp.updated).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
