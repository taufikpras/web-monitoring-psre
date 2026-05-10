import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Activity, Clock, Server, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface WorkerStatus {
    name: string;
    status: string;
    concurrency: number | string;
}

interface AgentStatusResponse {
    workers: WorkerStatus[];
    api_time: string;
    timezone: string;
    error?: string;
}

interface TaskInfo {
    task_id: string;
    name: string;
    state: string;
    received: number;
    started: number;
    succeeded: number;
    failed: number;
    worker: string;
    runtime: number;
    args_info?: string;
}

export function AgentPage() {
    const [statusData, setStatusData] = useState<AgentStatusResponse | null>(null);
    const [tasks, setTasks] = useState<TaskInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [frontEndTime, setFrontEndTime] = useState<string>('');

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [status, tasksData] = await Promise.all([
                api.getAgentStatus(),
                api.getAgentTasks()
            ]);
            setStatusData(status);
            setTasks(tasksData.tasks || []);
        } catch (err: any) {
            setError(err.message || "Failed to load agent data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const timer = setInterval(() => {
            setFrontEndTime(new Date().toLocaleString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const getStateColor = (state: string) => {
        switch (state?.toUpperCase()) {
            case 'SUCCESS': return 'var(--success-color)';
            case 'FAILURE': return 'var(--error-color)';
            case 'STARTED': return '#f59e0b';
            case 'RECEIVED': return 'var(--accent-color)';
            default: return 'var(--text-secondary)';
        }
    };

    const formatTimestamp = (ts: number | null) => {
        if (!ts) return '-';
        return new Date(ts * 1000).toLocaleString();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Background Agent</h1>
                <button className="btn btn-secondary" onClick={fetchData}>
                    <RefreshCw size={18} className={loading ? "spin" : ""} />
                </button>
            </div>

            {error && (
                <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#ef444420', color: '#ef4444', borderRadius: '8px' }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                        <Clock size={20} />
                        <h3 style={{ margin: 0 }}>Time Synchronization</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Frontend Time (Local)</div>
                            <div style={{ fontWeight: 600 }}>{frontEndTime || '-'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>API Time ({statusData?.timezone || '?'})</div>
                            <div style={{ fontWeight: 600 }}>
                                {statusData?.api_time ? new Date(statusData.api_time).toLocaleString() : '-'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                        <Server size={20} />
                        <h3 style={{ margin: 0 }}>Celery Workers</h3>
                    </div>
                    {statusData?.error ? (
                        <div style={{ color: 'var(--error-color)' }}>{statusData.error}</div>
                    ) : statusData?.workers?.length === 0 ? (
                        <div style={{ color: 'var(--text-secondary)' }}>No workers detected.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {statusData?.workers?.map((w, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {w.status === 'Online' ? <CheckCircle size={16} color="var(--success-color)" /> : <XCircle size={16} color="var(--error-color)" />}
                                        <span style={{ fontWeight: 500 }}>{w.name}</span>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        Concurrency: {w.concurrency}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Activity size={24} color="var(--accent-color)" />
                Task History
            </h2>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Task Name</th>
                            <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Registered</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Completed/Failed</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Worker</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading tasks...</td></tr>
                        ) : tasks.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No task history found</td></tr>
                        ) : (
                            tasks.map((task) => (
                                <tr key={task.task_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: 500 }}>{task.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{task.task_id}</div>
                                        {task.args_info && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                {task.args_info}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', verticalAlign: 'top', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            backgroundColor: `${getStateColor(task.state)}20`,
                                            color: getStateColor(task.state),
                                            fontSize: '0.875rem',
                                            fontWeight: 600
                                        }}>
                                            {task.state}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', verticalAlign: 'top', fontSize: '0.875rem' }}>
                                        {formatTimestamp(task.received || task.started)}
                                    </td>
                                    <td style={{ padding: '1rem', verticalAlign: 'top', fontSize: '0.875rem' }}>
                                        {formatTimestamp(task.succeeded || task.failed)}
                                    </td>
                                    <td style={{ padding: '1rem', verticalAlign: 'top', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        {task.worker}
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
