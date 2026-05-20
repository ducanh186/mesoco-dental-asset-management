import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useI18n } from '../i18n';
import { preferLocalizedMessage } from '../services/api';

const SEVERITY_OPTIONS = [
    { value: 'low', labelKey: 'requests.severities.low' },
    { value: 'medium', labelKey: 'requests.severities.medium' },
    { value: 'high', labelKey: 'requests.severities.high' },
    { value: 'critical', labelKey: 'requests.severities.critical' },
];

const toLocalIsoString = (date) => {
    const pad = (n) => `${n}`.padStart(2, '0');
    return (
        date.getFullYear() +
        '-' +
        pad(date.getMonth() + 1) +
        '-' +
        pad(date.getDate()) +
        'T' +
        pad(date.getHours()) +
        ':' +
        pad(date.getMinutes())
    );
};

const formatDateTime = (value) => {
    if (!value) {
        return '';
    }

    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        return '';
    }

    return toLocalIsoString(d);
};

const MyDevicesPage = ({ user }) => {
    const { t } = useI18n();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState({ total: 0, active: 0, maintenance: 0 });
    const [activeForm, setActiveForm] = useState(null);

    const reload = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/my-devices');
            setDevices(response.data.assets || []);
            setSummary(response.data.summary || { total: 0, active: 0, maintenance: 0 });
            setError(null);
        } catch (err) {
            setError(preferLocalizedMessage(err.response?.data?.message, t('myDevices.loadFailed')));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        reload();
    }, [reload]);

    const openRepairForm = (asset) => {
        setActiveForm({
            kind: 'repair',
            asset,
            initialDateTime: toLocalIsoString(new Date()),
        });
    };

    const closeForm = () => setActiveForm(null);

    const handleFormSubmitted = async () => {
        closeForm();
        await reload();
    };

    const getStatusLabel = (status) => {
        const labels = {
            active: t('myDevices.status.active'),
            maintenance: t('myDevices.status.maintenance'),
            off_service: t('myDevices.status.offService'),
            inventorying: t('myDevices.status.inventorying'),
            retired: t('myDevices.status.retired'),
        };

        return labels[status] || status || '—';
    };

    const canCreateRepair = (device) => (
        device?.status === 'active' && device?.is_assigned !== false && !device?.is_locked
    );
    const requesterName = user?.employee?.full_name
        || user?.full_name
        || user?.name
        || user?.username
        || user?.email
        || t('myDevices.form.currentUser');

    return (
        <div className="page my-devices-page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">{t('myDevices.title')}</h1>
                    <p className="page-subtitle">{t('myDevices.subtitle')}</p>
                </div>
                <div className="summary-row">
                    <span className="summary-chip">
                        {t('myDevices.summary.total')}: <strong>{summary.total}</strong>
                    </span>
                    <span className="summary-chip">
                        {t('myDevices.summary.active')}: <strong>{summary.active}</strong>
                    </span>
                    <span className="summary-chip">
                        {t('myDevices.summary.maintenance')}: <strong>{summary.maintenance}</strong>
                    </span>
                </div>
            </header>

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <div className="loading-placeholder">{t('common.loading')}</div>
            ) : devices.length === 0 ? (
                <div className="empty-state">
                    <p>{t('myDevices.empty')}</p>
                </div>
            ) : (
                <div className="device-table-card">
                    <table className="device-table">
                        <thead>
                            <tr>
                                <th>{t('myDevices.field.name')}</th>
                                <th>{t('myDevices.field.code')}</th>
                                <th>{t('myDevices.field.serial')}</th>
                                <th>{t('myDevices.field.location')}</th>
                                <th>{t('myDevices.field.status')}</th>
                                <th>{t('myDevices.field.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.map((device) => (
                                <tr key={device.id}>
                                    <td data-label={t('myDevices.field.name')}>
                                        <span className="device-name">{device.name || '—'}</span>
                                    </td>
                                    <td data-label={t('myDevices.field.code')}>
                                        <code className="device-code">{device.asset_code || '—'}</code>
                                    </td>
                                    <td data-label={t('myDevices.field.serial')}>{device.serial_number || '—'}</td>
                                    <td data-label={t('myDevices.field.location')}>{device.location_name || '—'}</td>
                                    <td data-label={t('myDevices.field.status')}>
                                        <span className={`device-status status-${device.status || 'unknown'}`}>
                                            {getStatusLabel(device.status)}
                                        </span>
                                    </td>
                                    <td data-label={t('myDevices.field.actions')}>
                                        <div className="table-actions">
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={() => openRepairForm(device)}
                                                disabled={!canCreateRepair(device)}
                                                title={!canCreateRepair(device) ? t('myDevices.action.repairUnavailable') : undefined}
                                            >
                                                {t('myDevices.action.createRepair')}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeForm?.kind === 'repair' && (
                <RepairRequestForm
                    asset={activeForm.asset}
                    initialDateTime={activeForm.initialDateTime}
                    requesterName={requesterName}
                    onClose={closeForm}
                    onSubmitted={handleFormSubmitted}
                />
            )}

        </div>
    );
};

const RepairRequestForm = ({ asset, initialDateTime, requesterName, onClose, onSubmitted }) => {
    const { t } = useI18n();
    const defaultTitle = `Sửa chữa ${asset.asset_code || ''} - ${asset.name || ''}`.trim();
    const [title, setTitle] = useState(defaultTitle);
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState('medium');
    const [incidentAt, setIncidentAt] = useState(formatDateTime(initialDateTime));
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            await axios.post('/api/requests', {
                type: 'JUSTIFICATION',
                title,
                description,
                severity,
                incident_at: incidentAt,
                items: [
                    {
                        item_kind: 'ASSET',
                        asset_id: asset.id,
                    },
                ],
            });
            onSubmitted?.();
        } catch (err) {
            setError(preferLocalizedMessage(err.response?.data?.message, t('myDevices.submitFailed')));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
            <form className="modal-card" onSubmit={handleSubmit}>
                <h2>{t('myDevices.form.repairTitle')}</h2>
                <p className="modal-subtitle">
                    {asset.asset_code} - {asset.name}
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                <div className="readonly-grid">
                    <div>
                        <span>{t('myDevices.form.device')}</span>
                        <strong>{asset.name || '—'}</strong>
                    </div>
                    <div>
                        <span>{t('myDevices.form.deviceCode')}</span>
                        <strong>{asset.asset_code || '—'}</strong>
                    </div>
                    <div>
                        <span>{t('myDevices.form.requester')}</span>
                        <strong>{requesterName}</strong>
                    </div>
                    <div>
                        <span>{t('myDevices.form.createdAt')}</span>
                        <strong>{incidentAt || '—'}</strong>
                    </div>
                </div>

                <label className="form-field">
                    <span>{t('myDevices.form.fieldTitle')}</span>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        maxLength={255}
                    />
                </label>

                <label className="form-field">
                    <span>{t('myDevices.form.severity')}</span>
                    <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                        {SEVERITY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {t(option.labelKey)}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="form-field">
                    <span>{t('myDevices.form.incidentAt')}</span>
                    <input
                        type="datetime-local"
                        value={incidentAt}
                        onChange={(e) => setIncidentAt(e.target.value)}
                    />
                </label>

                <label className="form-field">
                    <span>{t('myDevices.form.description')}</span>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        maxLength={5000}
                    />
                </label>

                <div className="modal-actions">
                    <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
                        {t('common.cancel')}
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? t('requests.submitting') : t('myDevices.form.submitRepair')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MyDevicesPage;
