import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { type Project } from '../types/project';
import { type Task, type TaskStatus } from '../types/task';
import { useAuth } from '../context/AuthContext';
import './ProjectOverview.css';

const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'testing', 'review', 'blocked', 'done', 'backlog'];

const StatusBadge = ({ status }: { status: TaskStatus }) => (
    <span className={`badge badge-${status}`}>{status.replace('_', ' ')}</span>
);

const PriorityBadge = ({ priority }: { priority?: string }) =>
    priority ? <span className={`badge badge-${priority}`}>{priority}</span> : null;

const ProjectOverview = () => {
    const project = useOutletContext<Project>();
    const { username } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        fetch(`http://127.0.0.1:5000/api/tasks/${project.id}/tasks`)
            .then(r => r.json())
            .then(data => setTasks(Array.isArray(data) ? data : []))
            .catch(() => setTasks([]));
    }, [project.id]);

    // Sprint Progress
    const sprintTasks = tasks.filter(t => t.sprint === project.cur_sprint);
    const total = sprintTasks.length;
    const doneTasks = sprintTasks.filter(t => t.status === 'done').length;
    const progressPct = total > 0 ? Math.round((doneTasks / total) * 100) : 0;
    const statusCounts = STATUS_ORDER.reduce<Record<string, number>>((acc, s) => {
        const count = sprintTasks.filter(t => t.status === s).length;
        if (count > 0) acc[s] = count;
        return acc;
    }, {});

    // My Tasks
    const myTasks = sprintTasks
        .filter(t => username !== null && t.assignees?.includes(username as any))
        .sort((a, b) => {
            const pOrder = { high: 0, medium: 1, low: 2 };
            const pa = pOrder[a.priority ?? 'low'] ?? 2;
            const pb = pOrder[b.priority ?? 'low'] ?? 2;
            if (pa !== pb) return pa - pb;
            return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
        });

    // Overdue
    const overdueTasks = tasks.filter(
        t => t.end_date && t.end_date < today && t.status !== 'done'
    );

    // Blocked / High Priority
    const blockedOrHighSet = new Map<number, Task>();
    tasks.forEach(t => {
        if (t.status === 'blocked' || (t.priority === 'high' && t.status !== 'done')) {
            blockedOrHighSet.set(t.id, t);
        }
    });
    const blockedOrHigh = Array.from(blockedOrHighSet.values());

    return (
        <div className="overview">
            {/* Sprint Progress — full width */}
            <div className="overview-card">
                <h2>Sprint {project.cur_sprint} Progress</h2>
                <div className="sprint-progress-bar-wrap">
                    <div className="sprint-progress-bar-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="sprint-progress-label">
                    {doneTasks} / {total} tasks done ({progressPct}%)
                </p>
                <div className="sprint-chips">
                    {Object.entries(statusCounts).map(([s, n]) => (
                        <span key={s} className={`badge badge-${s}`}>
                            {s.replace('_', ' ')} · {n}
                        </span>
                    ))}
                    {total === 0 && <span className="overview-empty">No tasks in this sprint.</span>}
                </div>
            </div>

            <div className="overview-grid">
                {/* My Tasks */}
                <div className="overview-card">
                    <h2>My Tasks (Sprint {project.cur_sprint})</h2>
                    {myTasks.length === 0 ? (
                        <p className="overview-empty">No tasks assigned to you this sprint.</p>
                    ) : (
                        <div className="overview-task-list">
                            {myTasks.map(t => (
                                <Link
                                    key={t.id}
                                    to={`/projects/${project.id}/tasks/${t.id}`}
                                    className="overview-task-item"
                                >
                                    <span className="overview-task-title">{t.title}</span>
                                    <StatusBadge status={t.status} />
                                    <PriorityBadge priority={t.priority} />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Overdue */}
                <div className="overview-card">
                    <h2>Overdue Tasks</h2>
                    {overdueTasks.length === 0 ? (
                        <p className="overview-empty">No overdue tasks.</p>
                    ) : (
                        <div className="overview-task-list">
                            {overdueTasks.map(t => (
                                <Link
                                    key={t.id}
                                    to={`/projects/${project.id}/tasks/${t.id}`}
                                    className="overview-task-item"
                                >
                                    <span className="overview-task-title">{t.title}</span>
                                    <span className="overview-task-date">{t.end_date}</span>
                                    <StatusBadge status={t.status} />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Blocked / High Priority */}
                <div className="overview-card">
                    <h2>Blocked &amp; High Priority</h2>
                    {blockedOrHigh.length === 0 ? (
                        <p className="overview-empty">Nothing blocked or high priority.</p>
                    ) : (
                        <div className="overview-task-list">
                            {blockedOrHigh.map(t => (
                                <Link
                                    key={t.id}
                                    to={`/projects/${project.id}/tasks/${t.id}`}
                                    className="overview-task-item"
                                >
                                    <span className="overview-task-title">{t.title}</span>
                                    <StatusBadge status={t.status} />
                                    <PriorityBadge priority={t.priority} />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectOverview;
