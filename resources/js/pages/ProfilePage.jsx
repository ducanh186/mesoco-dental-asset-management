import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Card, 
    CardHeader, 
    CardBody, 
    Button, 
    Input,
    Textarea,
    Badge,
    useToast,
    LoadingSpinner
} from '../components/ui';
import { useI18n } from '../i18n';
import { normalizeRole } from '../utils/roles';
import { preferLocalizedMessage } from '../services/api';

/**
 * ProfilePage - Personal Details form (OrangeHRM-style)
 * 
 * Fields:
 * - Employee Full Name (editable)
 * - Employee Id (disabled)
 * - Position (editable)
 * - Date of Birth (editable)
 * - Gender (editable - radio)
 * - Phone number (editable)
 * - Email (disabled)
 * - Address (editable - textarea)
 */
const ProfilePage = ({ user }) => {
    const toast = useToast();
    const { t } = useI18n();
    const role = normalizeRole(user?.role);
    
    // Loading states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileType, setProfileType] = useState('employee');
    
    // Form data
    const [formData, setFormData] = useState({
        name: '',
        supplier_code: '',
        contact_person: '',
        full_name: '',
        employee_code: '',
        position: '',
        dob: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        note: '',
    });
    
    // Field errors
    const [fieldErrors, setFieldErrors] = useState({});
    
    // Refs for focus management
    const fullNameRef = useRef(null);
    const positionRef = useRef(null);
    const dobRef = useRef(null);
    const phoneRef = useRef(null);
    const addressRef = useRef(null);

    // Fetch profile on mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/profile');
            const profile = response.data.profile;
            setProfileType(profile.profile_type || 'employee');
            setFormData({
                name: profile.name || '',
                supplier_code: profile.supplier_code || '',
                contact_person: profile.contact_person || '',
                full_name: profile.full_name || '',
                employee_code: profile.employee_code || '',
                position: profile.position || '',
                dob: profile.dob || '',
                gender: profile.gender || '',
                phone: profile.phone || '',
                email: profile.email || '',
                address: profile.address || '',
                note: profile.note || '',
            });
        } catch (error) {
            toast.error(preferLocalizedMessage(error.response?.data?.message, t('profile.loadError')));
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors = {};
        
        if (profileType === 'supplier') {
            if (!formData.name.trim()) {
                errors.name = t('validation.required');
            }
        } else if (!formData.full_name.trim()) {
            errors.full_name = t('validation.required');
        }
        
        setFieldErrors(errors);
        
        // Focus first invalid field
        if (errors.name || errors.full_name) {
            fullNameRef.current?.focus();
        }
        
        return Object.keys(errors).length === 0;
    };

    const handleFieldChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setSaving(true);
        
        try {
            const payload = profileType === 'supplier'
                ? {
                    name: formData.name.trim(),
                    contact_person: formData.contact_person?.trim() || null,
                    phone: formData.phone?.trim() || null,
                    address: formData.address?.trim() || null,
                    note: formData.note?.trim() || null,
                }
                : {
                    full_name: formData.full_name.trim(),
                    position: formData.position?.trim() || null,
                    dob: formData.dob || null,
                    gender: formData.gender || null,
                    phone: formData.phone?.trim() || null,
                    address: formData.address?.trim() || null,
                };

            const response = await axios.put('/api/profile', payload);
            
            // Update form with response data
            if (response.data.profile) {
                const profile = response.data.profile;
                setProfileType(profile.profile_type || profileType);
                setFormData(prev => ({
                    ...prev,
                    name: profile.name || prev.name,
                    supplier_code: profile.supplier_code || prev.supplier_code,
                    contact_person: profile.contact_person || '',
                    full_name: profile.full_name || '',
                    position: profile.position || '',
                    dob: profile.dob || '',
                    gender: profile.gender || '',
                    phone: profile.phone || '',
                    address: profile.address || '',
                    note: profile.note || '',
                }));
            }
            
            toast.success(t('profile.updateSuccess'));
        } catch (error) {
            const errors = error.response?.data?.errors;
            
            if (errors) {
                // Map backend errors to field errors
                const mappedErrors = {};
                Object.keys(errors).forEach(key => {
                    mappedErrors[key] = preferLocalizedMessage(errors[key][0], t('profile.updateError'));
                });
                setFieldErrors(mappedErrors);
                
                // Focus first error field
                const firstErrorField = Object.keys(mappedErrors)[0];
                const refMap = {
                    full_name: fullNameRef,
                    position: positionRef,
                    dob: dobRef,
                    phone: phoneRef,
                    address: addressRef,
                };
                refMap[firstErrorField]?.current?.focus();
            }
            
            toast.error(preferLocalizedMessage(error.response?.data?.message, t('profile.updateError')));
        } finally {
            setSaving(false);
        }
    };

    const getUserInitials = () => {
        const name = profileType === 'supplier'
            ? (formData.name || user?.name)
            : (formData.full_name || user?.name);
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getRoleLabel = () => {
        const role = normalizeRole(user?.role);
        const label = t(`roles.${role}`);
        return label === `roles.${role}` ? role : label;
    };

    if (loading) {
        return (
            <div className="profile-page flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header Card */}
                <Card className="mb-6">
                    <CardBody>
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-primary text-text-invert flex items-center justify-center text-2xl font-semibold flex-shrink-0">
                                {getUserInitials()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-semibold text-text truncate">
                                    {profileType === 'supplier'
                                        ? (formData.name || user?.name || t('profile.unnamed'))
                                        : (formData.full_name || user?.name || t('profile.unnamed'))
                                    }
                                </h2>
                                <p className="text-text-muted">
                                    {profileType === 'supplier' ? formData.supplier_code : formData.employee_code}
                                </p>
                                <Badge variant="primary" size="sm" className="mt-2">
                                    {getRoleLabel()}
                                </Badge>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Personal Details Form */}
                <Card>
                    <CardHeader title={t('profile.personalDetails')} />
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                ref={fullNameRef}
                                label={profileType === 'supplier' ? t('profile.supplierName') : t('profile.employeeFullName')}
                                value={profileType === 'supplier' ? formData.name : formData.full_name}
                                onChange={(e) => handleFieldChange(profileType === 'supplier' ? 'name' : 'full_name', e.target.value)}
                                error={fieldErrors[profileType === 'supplier' ? 'name' : 'full_name']}
                                required
                                disabled={saving}
                            />

                            <Input
                                label={profileType === 'supplier' ? t('profile.supplierCode') : t('profile.employeeId')}
                                value={profileType === 'supplier' ? formData.supplier_code : formData.employee_code}
                                disabled
                                helper={t('profile.disabledFieldHint')}
                            />

                            {profileType === 'supplier' ? (
                                <Input
                                    ref={positionRef}
                                    label={t('profile.contactPerson')}
                                    value={formData.contact_person}
                                    onChange={(e) => handleFieldChange('contact_person', e.target.value)}
                                    error={fieldErrors.contact_person}
                                    disabled={saving}
                                />
                            ) : (
                                <Input
                                    ref={positionRef}
                                    label={t('profile.position')}
                                    value={formData.position}
                                    onChange={(e) => handleFieldChange('position', e.target.value)}
                                    error={fieldErrors.position}
                                    disabled={saving}
                                />
                            )}

                            {profileType === 'employee' && (
                                <>
                                    <Input
                                        ref={dobRef}
                                        label={t('profile.dateOfBirth')}
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => handleFieldChange('dob', e.target.value)}
                                        error={fieldErrors.dob}
                                        disabled={saving}
                                    />

                                    <div className="ui-input-wrapper">
                                        <label className="ui-input-label">{t('profile.gender')}</label>
                                        <div className="flex items-center gap-6 mt-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="male"
                                                    checked={formData.gender === 'male'}
                                                    onChange={(e) => handleFieldChange('gender', e.target.value)}
                                                    disabled={saving}
                                                    className="w-4 h-4 text-primary focus:ring-primary border-border"
                                                />
                                                <span className="text-text">{t('profile.male')}</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="female"
                                                    checked={formData.gender === 'female'}
                                                    onChange={(e) => handleFieldChange('gender', e.target.value)}
                                                    disabled={saving}
                                                    className="w-4 h-4 text-primary focus:ring-primary border-border"
                                                />
                                                <span className="text-text">{t('profile.female')}</span>
                                            </label>
                                        </div>
                                        {fieldErrors.gender && (
                                            <p className="ui-input-error-text mt-1">{fieldErrors.gender}</p>
                                        )}
                                    </div>
                                </>
                            )}

                            <Input
                                ref={phoneRef}
                                label={t('profile.phoneNumber')}
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleFieldChange('phone', e.target.value)}
                                error={fieldErrors.phone}
                                disabled={saving}
                            />

                            <Input
                                label={t('profile.email')}
                                type="email"
                                value={formData.email}
                                disabled
                                helper={t('profile.disabledFieldHint')}
                            />

                            <div className="md:col-span-2">
                                <Textarea
                                    ref={addressRef}
                                    label={t('profile.address')}
                                    value={formData.address}
                                    onChange={(e) => handleFieldChange('address', e.target.value)}
                                    error={fieldErrors.address}
                                    rows={3}
                                    disabled={saving}
                                />
                            </div>

                            {profileType === 'supplier' && (
                                <div className="md:col-span-2">
                                    <Textarea
                                        label={t('profile.supplierNote')}
                                        value={formData.note}
                                        onChange={(e) => handleFieldChange('note', e.target.value)}
                                        error={fieldErrors.note}
                                        rows={3}
                                        disabled={saving}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end mt-6 pt-4 border-t border-border">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <span className="btn-spinner mr-2"></span>
                                        {t('common.saving')}
                                    </>
                                ) : t('common.save')}
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;
