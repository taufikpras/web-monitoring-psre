import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

type TicketTab = 'open' | 'closed';

interface Ticket {
    ticket_id: string;
    start: string;
    end: string | null;
    last_notif: string | null;
    cn: string;
    url: string;
    resolve: boolean;
    message: string;
    occurance: number;
}

export function TicketsPage() {
    const [openTickets, setOpenTickets] = useState<Ticket[]>([]);
    const [closedTickets, setClosedTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TicketTab>('open');

    const fetchAllTickets = () => {
        setLoading(true);
        setError(null);

        Promise.all([
            api.getTickets('open'),
            api.getTickets('closed')
        ])
            .then(([open, closed]) => {
                setOpenTickets(Array.isArray(open) ? open : []);
                setClosedTickets(Array.isArray(closed) ? closed : []);
            })
            .catch(err => {
                console.error(err);
                setError(`Failed to load tickets: ${err.message}`);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchAllTickets();
    }, []);

    const getSeverityColor = (occurance: number) => {
        if (occurance >= 10) return 'var(--error-color)';
        if (occurance >= 5) return '#f59e0b';
        return 'var(--text-secondary)';
    };

    const currentTickets = activeTab === 'open' ? openTickets : closedTickets;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Tickets</h1>
                <button className="btn btn-secondary" onClick={fetchAllTickets}>
                    <RefreshCw size={18} />
                </button>
            </div>

            {error && (
                <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#ef444420', color: '#ef4444', borderRadius: '8px' }}>
                    {error}
                </div>
            )}

            {/* Tab Switcher */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border-color)' }}>
                <button
                    onClick={() => setActiveTab('open')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'open' ? '2px solid var(--accent-color)' : '2px solid transparent',
                        color: activeTab === 'open' ? 'var(--accent-color)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'open' ? 600 : 400,
                        cursor: 'pointer',
                        marginBottom: '-2px',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    Open Tickets
                    <span style={{
                        padding: '0.125rem 0.5rem',
                        borderRadius: '12px',
                        backgroundColor: activeTab === 'open' ? 'var(--accent-color)' : 'var(--border-color)',
                        color: activeTab === 'open' ? '#000' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600
                    }}>
                        {openTickets.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('closed')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'closed' ? '2px solid var(--accent-color)' : '2px solid transparent',
                        color: activeTab === 'closed' ? 'var(--accent-color)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'closed' ? 600 : 400,
                        cursor: 'pointer',
                        marginBottom: '-2px',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    Closed Tickets
                    <span style={{
                        padding: '0.125rem 0.5rem',
                        borderRadius: '12px',
                        backgroundColor: activeTab === 'closed' ? 'var(--accent-color)' : 'var(--border-color)',
                        color: activeTab === 'closed' ? '#000' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600
                    }}>
                        {closedTickets.length}
                    </span>
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>CA / URL</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Message</th>
                            <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Occurance</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Start Date</th>
                            {activeTab === 'closed' && (
                                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>End Date</th>
                            )}
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Last Notif</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={activeTab === 'closed' ? 6 : 5} style={{ padding: '2rem', textAlign: 'center' }}>Loading tickets...</td></tr>
                        ) : currentTickets.length === 0 ? (
                            <tr><td colSpan={activeTab === 'closed' ? 6 : 5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No tickets found</td></tr>
                        ) : (
                            currentTickets.map((ticket: Ticket) => (
                                <tr key={ticket.ticket_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {activeTab === 'open' ? (
                                                <AlertTriangle size={16} color="var(--error-color)" />
                                            ) : (
                                                <CheckCircle size={16} color="var(--success-color)" />
                                            )}
                                            {ticket.cn}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                                            {ticket.url}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', verticalAlign: 'top', fontSize: '0.875rem' }}>
                                        {ticket.message}
                                    </td>
                                    <td style={{ padding: '1rem', verticalAlign: 'top', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            backgroundColor: `${getSeverityColor(ticket.occurance)}20`,
                                            color: getSeverityColor(ticket.occurance),
                                            fontSize: '0.875rem',
                                            fontWeight: 600
                                        }}>
                                            {ticket.occurance}x
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', verticalAlign: 'top', fontSize: '0.875rem' }}>
                                        {ticket.start ? new Date(ticket.start).toLocaleString() : '-'}
                                    </td>
                                    {activeTab === 'closed' && (
                                        <td style={{ padding: '1rem', verticalAlign: 'top', fontSize: '0.875rem' }}>
                                            {ticket.end ? new Date(ticket.end).toLocaleString() : '-'}
                                        </td>
                                    )}
                                    <td style={{ padding: '1rem', verticalAlign: 'top', fontSize: '0.875rem' }}>
                                        {ticket.last_notif ? new Date(ticket.last_notif).toLocaleString() : '-'}
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
