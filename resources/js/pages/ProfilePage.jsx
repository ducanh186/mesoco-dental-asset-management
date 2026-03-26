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
    
    // Loading states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Form data
    const [formData, setFormData] = useState({
        full_name: '',
        employee_code: '',
        position: '',
        dob: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
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
            setFormData({
                full_name: profile.full_name || '',
                employee_code: profile.employee_code || '',
                position: profile.position || '',
                dob: profile.dob || '',
                gender: profile.gender || '',
                phone: profile.phone || '',
                email: profile.email || '',
                address: profile.address || '',
            });
        } catch (error) {
            toast.error(error.response?.data?.message || t('profile.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors = {};
        
        // Full name is required
        if (!formData.full_name.trim()) {
            errors.full_name = t('validation.required');
        }
        
        setFieldErrors(errors);
        
        // Focus first invalid field
        if (errors.full_name) {
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
            // Only send editable fields
            const payload = {
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
                setFormData(prev => ({
                    ...prev,
                    full_name: profile.full_name || '',
                    position: profile.position || '',
                    dob: profile.dob || '',
                    gender: profile.gender || '',
                    phone: profile.phone || '',
                    address: profile.address || '',
                }));
            }
            
            toast.success(t('profile.updateSuccess'));
        } catch (error) {
            const errors = error.response?.data?.errors;
            
            if (errors) {
                // Map backend errors to field errors
                const mappedErrors = {};
                Object.keys(errors).forEach(key => {
                    mappedErrors[key] = errors[key][0];
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
            
            toast.error(error.response?.data?.message || t('profile.updateError'));
        } finally {
            setSaving(false);
        }
    };

    const getUserInitials = () => {
        const name = formData.full_name || user?.name;
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
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
                                    {formData.full_name || user?.name || t('profile.unnamed')}
                                </h2>
                                <p className="text-text-muted">
                                    {formData.employee_code}
                                </p>
                                <Badge variant="primary" size="sm" className="mt-2">
                                    {user?.role || 'Staff'}
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
                            {/* Employee Full Name - Editable */}
                            <Input
                                ref={fullNameRef}
                                label={t('profile.employeeFullName')}
                                value={formData.full_name}
                                onChange={(e) => handleFieldChange('full_name', e.target.value)}
                                error={fieldErrors.full_name}
                                required
                                disabled={saving}
                            />

                            {/* Employee Id - Disabled */}
                            <Input
                                label={t('profile.employeeId')}
                                value={formData.employee_code}
                                disabled
                                helper={t('profile.disabledFieldHint')}
                            />

                            {/* Position - Editable */}
                            <Input
                                ref={positionRef}
                                label={t('profile.position')}
                                value={formData.position}
                                onChange={(e) => handleFieldChange('position', e.target.value)}
                                error={fieldErrors.position}
                                disabled={saving}
                            />

                            {/* Date of Birth - Editable */}
                            <Input
                                ref={dobRef}
                                label={t('profile.dateOfBirth')}
                                type="date"
                                value={formData.dob}
                                onChange={(e) => handleFieldChange('dob', e.target.value)}
                                error={fieldErrors.dob}
                                disabled={saving}
                            />

                            {/* Gender - Editable (Radio) */}
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

                            {/* Phone Number - Editable */}
                            <Input
                                ref={phoneRef}
                                label={t('profile.phoneNumber')}
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleFieldChange('phone', e.target.value)}
                                error={fieldErrors.phone}
                                disabled={saving}
                            />

                            {/* Email - Disabled */}
                            <Input
                                label={t('profile.email')}
                                type="email"
                                value={formData.email}
                                disabled
                                helper={t('profile.disabledFieldHint')}
                            />

                            {/* Address - Editable (full width) */}
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
