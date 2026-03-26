import React, { useState, useEffect, useCallback } from 'react';
import { 
    Card, 
    CardHeader, 
    CardBody, 
    Button, 
    Input, 
    Badge,
    useToast 
} from '../components/ui';
import { reportsApi, handleApiError } from '../services/api';

/**
 * ReportPage - Phase 8
 * System-wide reports and statistics dashboard
 */
const ReportPage = ({ user }) => {
    const toast = useToast();
    
    // State
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState(null);
    
    // Date range
    const [fromDate, setFromDate] = useState(() => {
        const date = new Date();
        date.setDate(1);
        return date.toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState(() => {
        const date = new Date();
        return date.toISOString().split('T')[0];
    });

    // Fetch report
    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const response = await reportsApi.summary({ from: fromDate, to: toDate });
            setReport(response);
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, toast]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleRefresh = () => {
        fetchReport();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-text-muted">Đang tải báo cáo...</p>
            </div>
        );
    }

    const { assets, maintenance, requests, feedback } = report || {};

    return (
        <div className="report-page space-y-6">
            {/* Header with Date Filter */}
            <Card>
                <CardBody>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-text">Báo cáo tổng hợp</h2>
                            <p className="text-sm text-text-muted">
                                Thống kê từ {new Date(fromDate).toLocaleDateString('vi-VN')} đến {new Date(toDate).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-40"
                            />
                            <span className="text-text-muted">đến</span>
                            <Input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-40"
                            />
                            <Button variant="outline" onClick={handleRefresh}>
                                Làm mới
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Asset Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader title="Tài sản" subtitle="Tổng quan trạng thái tài sản" />
                    <CardBody>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-surface-muted rounded-lg">
                                <p className="text-3xl font-bold text-text">{assets?.total || 0}</p>
                                <p className="text-sm text-text-muted">Tổng cộng</p>
                            </div>
                            <div className="text-center p-4 bg-success/10 rounded-lg">
                                <p className="text-3xl font-bold text-success">{assets?.active || 0}</p>
                                <p className="text-sm text-text-muted">Đang hoạt động</p>
                            </div>
                            <div className="text-center p-4 bg-error/10 rounded-lg">
                                <p className="text-3xl font-bold text-error">{assets?.locked || 0}</p>
                                <p className="text-sm text-text-muted">Đang khóa</p>
                            </div>
                            <div className="text-center p-4 bg-warning/10 rounded-lg">
                                <p className="text-3xl font-bold text-warning">{assets?.off_service || 0}</p>
                                <p className="text-sm text-text-muted">Ngừng hoạt động</p>
                            </div>
                            <div className="text-center p-4 bg-primary/10 rounded-lg">
                                <p className="text-3xl font-bold text-primary">{assets?.maintenance || 0}</p>
                                <p className="text-sm text-text-muted">Đang bảo trì</p>
                            </div>
                            <div className="text-center p-4 bg-text-light/10 rounded-lg">
                                <p className="text-3xl font-bold text-text-muted">{assets?.retired || 0}</p>
                                <p className="text-sm text-text-muted">Đã thanh lý</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Maintenance Statistics */}
                <Card>
                    <CardHeader title="Bảo trì" subtitle="Thống kê lịch bảo trì" />
                    <CardBody>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-error/10 rounded-lg">
                                <p className="text-3xl font-bold text-error">{maintenance?.overdue || 0}</p>
                                <p className="text-sm text-text-muted">Quá hạn</p>
                            </div>
                            <div className="text-center p-4 bg-primary/10 rounded-lg">
                                <p className="text-3xl font-bold text-primary">{maintenance?.in_progress || 0}</p>
                                <p className="text-sm text-text-muted">Đang thực hiện</p>
                            </div>
                            <div className="text-center p-4 bg-warning/10 rounded-lg">
                                <p className="text-3xl font-bold text-warning">{maintenance?.scheduled || 0}</p>
                                <p className="text-sm text-text-muted">Đã lên lịch</p>
                            </div>
                            <div className="text-center p-4 bg-success/10 rounded-lg col-span-2 sm:col-span-1">
                                <p className="text-3xl font-bold text-success">{maintenance?.completed_in_period || 0}</p>
                                <p className="text-sm text-text-muted">Hoàn thành (kỳ)</p>
                            </div>
                            <div className="text-center p-4 bg-info/10 rounded-lg col-span-2 sm:col-span-2">
                                <p className="text-3xl font-bold text-info">{maintenance?.created_in_period || 0}</p>
                                <p className="text-sm text-text-muted">Tạo mới (kỳ)</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Request Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader title="Yêu cầu" subtitle="Thống kê yêu cầu trong kỳ" />
                    <CardBody>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                                <span className="text-text">Đang chờ xử lý</span>
                                <Badge variant="warning" size="lg">{requests?.pending || 0}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-surface-muted rounded-lg">
                                    <p className="text-xl font-bold text-text">{requests?.created_in_period || 0}</p>
                                    <p className="text-xs text-text-muted">Tạo mới (kỳ)</p>
                                </div>
                                <div className="text-center p-3 bg-success/10 rounded-lg">
                                    <p className="text-xl font-bold text-success">{requests?.by_status?.approved || 0}</p>
                                    <p className="text-xs text-text-muted">Đã duyệt</p>
                                </div>
                                <div className="text-center p-3 bg-error/10 rounded-lg">
                                    <p className="text-xl font-bold text-error">{requests?.by_status?.rejected || 0}</p>
                                    <p className="text-xs text-text-muted">Từ chối</p>
                                </div>
                                <div className="text-center p-3 bg-text-light/10 rounded-lg">
                                    <p className="text-xl font-bold text-text-muted">{requests?.by_status?.cancelled || 0}</p>
                                    <p className="text-xs text-text-muted">Đã hủy</p>
                                </div>
                            </div>
                            <div className="pt-2 border-t">
                                <p className="text-sm font-medium text-text mb-2">Theo loại yêu cầu:</p>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="info">Sự cố: {requests?.by_type?.justification || 0}</Badge>
                                    <Badge variant="primary">Mượn thiết bị: {requests?.by_type?.asset_loan || 0}</Badge>
                                    <Badge variant="default">Vật tư: {requests?.by_type?.consumable_request || 0}</Badge>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Feedback Statistics */}
                <Card>
                    <CardHeader title="Phản hồi" subtitle="Thống kê phản hồi người dùng" />
                    <CardBody>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                                <span className="text-text">Chưa giải quyết</span>
                                <Badge variant="warning" size="lg">{feedback?.unresolved || 0}</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-3 bg-warning/10 rounded-lg">
                                    <p className="text-xl font-bold text-warning">{feedback?.by_status?.new || 0}</p>
                                    <p className="text-xs text-text-muted">Mới</p>
                                </div>
                                <div className="text-center p-3 bg-primary/10 rounded-lg">
                                    <p className="text-xl font-bold text-primary">{feedback?.by_status?.in_progress || 0}</p>
                                    <p className="text-xs text-text-muted">Đang xử lý</p>
                                </div>
                                <div className="text-center p-3 bg-success/10 rounded-lg">
                                    <p className="text-xl font-bold text-success">{feedback?.by_status?.resolved || 0}</p>
                                    <p className="text-xs text-text-muted">Đã giải quyết</p>
                                </div>
                            </div>
                            <div className="pt-2 border-t">
                                <p className="text-sm font-medium text-text mb-2">Theo loại (trong kỳ):</p>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="danger">Sự cố: {feedback?.by_type?.issue || 0}</Badge>
                                    <Badge variant="info">Đề xuất: {feedback?.by_type?.suggestion || 0}</Badge>
                                    <Badge variant="success">Khen ngợi: {feedback?.by_type?.praise || 0}</Badge>
                                    <Badge variant="default">Khác: {feedback?.by_type?.other || 0}</Badge>
                                </div>
                            </div>
                            {feedback?.average_rating && (
                                <div className="pt-2 border-t">
                                    <p className="text-sm text-text-muted">Đánh giá trung bình</p>
                                    <p className="text-2xl font-bold text-yellow-500">
                                        {'★'.repeat(Math.round(feedback.average_rating))}
                                        {'☆'.repeat(5 - Math.round(feedback.average_rating))}
                                        <span className="text-lg text-text ml-2">({feedback.average_rating}/5)</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Maintenance by Type */}
            {maintenance?.by_type && (
                <Card>
                    <CardHeader title="Bảo trì theo loại" subtitle="Phân loại sự kiện bảo trì" />
                    <CardBody>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                            {Object.entries(maintenance.by_type).map(([type, count]) => (
                                <div key={type} className="text-center p-3 bg-surface-muted rounded-lg">
                                    <p className="text-xl font-bold text-text">{count}</p>
                                    <p className="text-xs text-text-muted capitalize">{type.replace('_', ' ')}</p>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
};

export default ReportPage;
