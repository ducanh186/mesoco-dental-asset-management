import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useI18n } from '../i18n';
import { preferLocalizedMessage } from '../services/api';

const SEVERITY_OPTIONS = [
    { value: 'low', labelKey: 'requests.severities.low' },
    { value: 'medium', labelKey: 'requests.severities.medium' },
    { value: 'high', labelKey: 'requests.severities.high' },
    { value: 'critical', labelKey: 'requests.severities.critical' },
];

const HANDOVER_WORKFLOWS = [
    { value: 'Bàn giao', labelKey: 'myDevices.workflow.handover' },
    { value: 'Thu hồi', labelKey: 'myDevices.workflow.recall' },
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

    const openHandoverForm = (asset) => {
        setActiveForm({
            kind: 'handover',
            asset,
            initialDateTime: toLocalIsoString(new Date()),
        });
    };

    const closeForm = () => setActiveForm(null);

    const handleFormSubmitted = async () => {
        closeForm();
        await reload();
    };

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
                <div className="card-grid">
                    {devices.map((device) => (
                        <article key={device.id} className="device-card">
                            <header>
                                <h3>{device.name}</h3>
                                <span className="badge">{device.asset_code}</span>
                            </header>
                            <dl>
                                <div>
                                    <dt>{t('myDevices.field.serial')}</dt>
                                    <dd>{device.serial_number || '—'}</dd>
                                </div>
                                <div>
                                    <dt>{t('myDevices.field.location')}</dt>
                                    <dd>{device.location_name || '—'}</dd>
                                </div>
                                <div>
                                    <dt>{t('myDevices.field.status')}</dt>
                                    <dd>{device.status}</dd>
                                </div>
                            </dl>
                            <footer className="card-actions">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => openRepairForm(device)}
                                >
                                    {t('myDevices.action.createRepair')}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => openHandoverForm(device)}
                                >
                                    {t('myDevices.action.createHandover')}
                                </button>
                            </footer>
                        </article>
                    ))}
                </div>
            )}

            {activeForm?.kind === 'repair' && (
                <RepairRequestForm
                    asset={activeForm.asset}
                    initialDateTime={activeForm.initialDateTime}
                    onClose={closeForm}
                    onSubmitted={handleFormSubmitted}
                />
            )}

            {activeForm?.kind === 'handover' && (
                <HandoverRequestForm
                    asset={activeForm.asset}
                    initialDateTime={activeForm.initialDateTime}
                    onClose={closeForm}
                    onSubmitted={handleFormSubmitted}
                />
            )}
        </div>
    );
};

const RepairRequestForm = ({ asset, initialDateTime, onClose, onSubmitted }) => {
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

const HandoverRequestForm = ({ asset, initialDateTime, onClose, onSubmitted }) => {
    const { t } = useI18n();
    const [workflow, setWorkflow] = useState(HANDOVER_WORKFLOWS[0].value);
    const computedTitle = useMemo(
        () => `${workflow} ${asset.asset_code || ''} - ${asset.name || ''}`.trim(),
        [workflow, asset.asset_code, asset.name]
    );
    const [title, setTitle] = useState(computedTitle);
    const [note, setNote] = useState('');
    const [eventAt, setEventAt] = useState(formatDateTime(initialDateTime));
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setTitle(computedTitle);
    }, [computedTitle]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            await axios.post('/api/requests', {
                type: 'CONSUMABLE_REQUEST',
                title,
                description: note || null,
                items: [
                    {
                        item_kind: 'CONSUMABLE',
                        sku: asset.asset_code || null,
                        name: asset.name || null,
                        qty: 1,
                        unit: 'cái',
                        note: eventAt ? `${workflow} dự kiến: ${eventAt}` : null,
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
                <h2>{t('myDevices.form.handoverTitle')}</h2>
                <p className="modal-subtitle">
                    {asset.asset_code} - {asset.name}
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                <label className="form-field">
                    <span>{t('myDevices.form.workflow')}</span>
                    <select value={workflow} onChange={(e) => setWorkflow(e.target.value)}>
                        {HANDOVER_WORKFLOWS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {t(option.labelKey)}
                            </option>
                        ))}
                    </select>
                </label>

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
                    <span>{t('myDevices.form.eventAt')}</span>
                    <input
                        type="datetime-local"
                        value={eventAt}
                        onChange={(e) => setEventAt(e.target.value)}
                    />
                </label>

                <label className="form-field">
                    <span>{t('myDevices.form.note')}</span>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        maxLength={1000}
                    />
                </label>

                <div className="modal-actions">
                    <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
                        {t('common.cancel')}
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? t('requests.submitting') : t('myDevices.form.submitHandover')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MyDevicesPage;
