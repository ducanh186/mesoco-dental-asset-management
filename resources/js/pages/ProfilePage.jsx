import React, { useState } from 'react';
import { 
    Card, 
    CardHeader, 
    CardBody, 
    Button, 
    Input, 
    Badge,
    useToast 
} from '../components/ui';
import { useI18n } from '../i18n';

/**
 * ProfilePage - User profile with personal info and settings
 */
const ProfilePage = ({ user }) => {
    const toast = useToast();
    const { t } = useI18n();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || 'John Doe',
        email: user?.email || 'john.doe@mesoco.com',
        phone: user?.phone || '+84 123 456 789',
        department: user?.department || 'Dental Operations',
    });

    // Mock activity data
    const recentActivity = [
        { id: 1, action: t('profile.borrowedEquipment'), item: 'Dental X-Ray Machine', date: '2026-01-22', status: 'active' },
        { id: 2, action: t('profile.returnedEquipment'), item: 'Ultrasonic Scaler', date: '2026-01-20', status: 'completed' },
        { id: 3, action: t('profile.maintenanceRequest'), item: 'Autoclave Sterilizer', date: '2026-01-18', status: 'pending' },
        { id: 4, action: t('profile.borrowedEquipment'), item: 'LED Curing Light', date: '2026-01-15', status: 'completed' },
    ];

    const handleSave = () => {
        setIsEditing(false);
        toast.success(t('profile.updateSuccess'));
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'active': return 'primary';
            case 'completed': return 'success';
            case 'pending': return 'warning';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'active': return t('profile.active');
            case 'completed': return t('profile.completed');
            case 'pending': return t('profile.pending');
            default: return status;
        }
    };

    const getUserInitials = () => {
        if (!user?.name) return 'JD';
        const names = user.name.split(' ');
        return names.length >= 2 
            ? `${names[0][0]}${names[1][0]}`.toUpperCase()
            : user.name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="profile-page">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardBody>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-primary text-text-invert flex items-center justify-center text-3xl font-semibold mb-4">
                                    {getUserInitials()}
                                </div>
                                <h2 className="text-xl font-semibold text-text mb-1">
                                    {user?.name || 'John Doe'}
                                </h2>
                                <p className="text-text-muted mb-3">
                                    {user?.employee_code || 'EMP-001'}
                                </p>
                                <Badge variant="primary" size="md">
                                    {user?.role || 'Staff'}
                                </Badge>
                            </div>

                            <div className="mt-6 pt-6 border-t border-border">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">{t('profile.department')}</span>
                                        <span className="text-text font-medium">{formData.department}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">{t('profile.joined')}</span>
                                        <span className="text-text font-medium">March 2024</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">{t('profile.equipmentAssigned')}</span>
                                        <span className="text-text font-medium">5 {t('profile.items')}</span>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Details & Activity */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader 
                            title={t('profile.personalInfo')}
                            action={
                                isEditing ? (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>
                                            {t('common.cancel')}
                                        </Button>
                                        <Button size="sm" onClick={handleSave}>
                                            {t('common.save')}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                                        {t('common.edit')}
                                    </Button>
                                )
                            }
                        />
                        <CardBody>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label={t('profile.fullName')}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={!isEditing}
                                />
                                <Input
                                    label={t('profile.email')}
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={!isEditing}
                                />
                                <Input
                                    label={t('profile.phone')}
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    disabled={!isEditing}
                                />
                                <Input
                                    label={t('profile.department')}
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                        </CardBody>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader title={t('profile.recentActivity')} />
                        <CardBody>
                            {recentActivity.length === 0 ? (
                                <div className="text-center py-8 text-text-muted">
                                    <p>{t('profile.noRecentActivity')}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentActivity.map((activity) => (
                                        <div 
                                            key={activity.id} 
                                            className="flex items-center justify-between py-3 border-b border-border last:border-0"
                                        >
                                            <div className="flex-1">
                                                <p className="text-text font-medium">{activity.action}</p>
                                                <p className="text-sm text-text-muted">{activity.item}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-text-light">{activity.date}</span>
                                                <Badge variant={getStatusVariant(activity.status)} size="sm">
                                                    {getStatusLabel(activity.status)}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
