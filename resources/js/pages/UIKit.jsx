import React, { useState } from 'react';
import {
    Button,
    ButtonGroup,
    Input,
    Textarea,
    Select,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Badge,
    StatusBadge,
    Table,
    TableCard,
    TablePagination,
    Modal,
    ConfirmModal,
    useToast,
} from '../components/ui';

/**
 * UI Kit Showcase Page
 * Demonstrates all UI components with their various states
 */
const UIKit = () => {
    const toast = useToast();
    
    // Component states
    const [inputValue, setInputValue] = useState('');
    const [selectValue, setSelectValue] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Sample data
    const selectOptions = [
        { value: 'option1', label: 'Lựa chọn 1' },
        { value: 'option2', label: 'Lựa chọn 2' },
        { value: 'option3', label: 'Lựa chọn 3' },
        { value: 'disabled', label: 'Lựa chọn bị khóa', disabled: true },
    ];

    const tableColumns = [
        { key: 'id', label: 'ID', width: '80px' },
        { key: 'name', label: 'Họ và tên' },
        { key: 'email', label: 'Email' },
        { key: 'status', label: 'Trạng thái', render: (value) => <StatusBadge status={value} /> },
        { 
            key: 'actions', 
            label: 'Thao tác', 
            align: 'right',
            render: (_, row) => (
                <Button size="sm" variant="ghost" onClick={() => toast.info(`Đã chọn dòng ${row.id}`)}>
                    Xem
                </Button>
            )
        },
    ];

    const tableData = [
        { id: 1, name: 'Nguyễn Văn An', email: 'an@example.com', status: 'active' },
        { id: 2, name: 'Trần Thị Bình', email: 'binh@example.com', status: 'pending' },
        { id: 3, name: 'Lê Minh Châu', email: 'chau@example.com', status: 'inactive' },
        { id: 4, name: 'Phạm Gia Hân', email: 'han@example.com', status: 'active' },
        { id: 5, name: 'Võ Quốc Khánh', email: 'khanh@example.com', status: 'rejected' },
    ];

    const handleLoadingDemo = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000);
    };

    const handleTableLoadingDemo = () => {
        setTableLoading(true);
        setTimeout(() => setTableLoading(false), 2000);
    };

    // Section Component
    const Section = ({ title, children }) => (
        <section className="ui-kit-section bg-surface rounded-lg shadow-sm border border-border">
            <h2 className="ui-kit-section-title bg-surface-muted text-text border-b border-border">{title}</h2>
            <div className="ui-kit-section-content">{children}</div>
        </section>
    );

    // Subsection Component
    const Subsection = ({ title, children }) => (
        <div className="ui-kit-subsection">
            <h3 className="ui-kit-subsection-title text-text-muted border-b border-border">{title}</h3>
            <div className="ui-kit-subsection-content">{children}</div>
        </div>
    );

    return (
        <div className="ui-kit-page min-h-screen bg-background">
            <header className="ui-kit-header border-b border-border">
                <h1 className="ui-kit-title text-text">Bộ giao diện</h1>
                <p className="ui-kit-subtitle text-text-muted">
                    Trang trình diễn các thành phần giao diện được xây dựng bằng React và Tailwind CSS
                </p>
            </header>

            <div className="ui-kit-content">
                {/* ============================================ */}
                {/* BUTTONS */}
                {/* ============================================ */}
                <Section title="Nút bấm">
                    <Subsection title="Biến thể">
                        <div className="ui-kit-row">
                            <Button variant="primary">Chính</Button>
                            <Button variant="secondary">Phụ</Button>
                            <Button variant="danger">Nguy hiểm</Button>
                            <Button variant="ghost">Ẩn nền</Button>
                            <Button variant="outline">Viền</Button>
                        </div>
                    </Subsection>

                    <Subsection title="Kích thước">
                        <div className="ui-kit-row ui-kit-row-center">
                            <Button size="sm">Nhỏ</Button>
                            <Button size="md">Vừa</Button>
                            <Button size="lg">Lớn</Button>
                        </div>
                    </Subsection>

                    <Subsection title="Trạng thái">
                        <div className="ui-kit-row">
                            <Button>Mặc định</Button>
                            <Button disabled>Đã khóa</Button>
                            <Button loading={isLoading} onClick={handleLoadingDemo}>
                                {isLoading ? 'Đang tải...' : 'Bấm để tải'}
                            </Button>
                        </div>
                    </Subsection>

                    <Subsection title="Kèm biểu tượng">
                        <div className="ui-kit-row">
                            <Button 
                                leftIcon={
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                }
                            >
                                Thêm mục
                            </Button>
                            <Button 
                                variant="secondary"
                                rightIcon={
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                }
                            >
                                Tiếp theo
                            </Button>
                        </div>
                    </Subsection>

                    <Subsection title="Nhóm nút">
                        <ButtonGroup>
                            <Button variant="outline">Trái</Button>
                            <Button variant="outline">Giữa</Button>
                            <Button variant="outline">Phải</Button>
                        </ButtonGroup>
                    </Subsection>

                    <Subsection title="Toàn chiều ngang">
                        <Button fullWidth>Nút toàn chiều ngang</Button>
                    </Subsection>
                </Section>

                {/* ============================================ */}
                {/* INPUTS */}
                {/* ============================================ */}
                <Section title="Ô nhập liệu">
                    <Subsection title="Cơ bản">
                        <div className="ui-kit-form-grid">
                            <Input 
                                label="Ô nhập mặc định" 
                                placeholder="Nhập nội dung..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <Input 
                                label="Ô bắt buộc" 
                                placeholder="Trường này là bắt buộc"
                                required 
                            />
                            <Input 
                                label="Có hướng dẫn" 
                                placeholder="Nhập email"
                                helper="Chúng tôi sẽ không chia sẻ email của bạn"
                            />
                            <Input 
                                label="Có lỗi" 
                                placeholder="Dữ liệu không hợp lệ"
                                error="Trường này là bắt buộc"
                                value="giá trị lỗi"
                            />
                        </div>
                    </Subsection>

                    <Subsection title="Trạng thái ô nhập">
                        <div className="ui-kit-form-grid">
                            <Input 
                                label="Đã khóa" 
                                placeholder="Ô nhập đã khóa"
                                disabled 
                            />
                            <Input 
                                label="Chỉ đọc" 
                                value="Giá trị chỉ đọc"
                                readOnly 
                            />
                        </div>
                    </Subsection>

                    <Subsection title="Kích thước ô nhập">
                        <div className="ui-kit-form-grid">
                            <Input label="Nhỏ" size="sm" placeholder="Ô nhập nhỏ" />
                            <Input label="Vừa" size="md" placeholder="Ô nhập vừa" />
                            <Input label="Lớn" size="lg" placeholder="Ô nhập lớn" />
                        </div>
                    </Subsection>

                    <Subsection title="Kiểu dữ liệu">
                        <div className="ui-kit-form-grid">
                            <Input label="Mật khẩu" type="password" placeholder="Nhập mật khẩu" />
                            <Input label="Email" type="email" placeholder="user@example.com" />
                            <Input label="Số" type="number" placeholder="0" />
                            <Input label="Ngày" type="date" />
                        </div>
                    </Subsection>

                    <Subsection title="Kèm biểu tượng">
                        <div className="ui-kit-form-grid">
                            <Input 
                                label="Tìm kiếm" 
                                placeholder="Tìm kiếm..."
                                leftIcon={
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                }
                            />
                            <Input 
                                label="Email" 
                                placeholder="Nhập email"
                                type="email"
                                rightIcon={
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                        <polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                }
                            />
                        </div>
                    </Subsection>

                    <Subsection title="Vùng nhập văn bản">
                        <div className="ui-kit-form-grid">
                            <Textarea 
                                label="Mô tả" 
                                placeholder="Nhập mô tả..."
                                helper="Tối đa 500 ký tự"
                            />
                            <Textarea 
                                label="Có lỗi" 
                                placeholder="Nội dung không hợp lệ"
                                error="Mô tả quá ngắn"
                                rows={3}
                            />
                        </div>
                    </Subsection>
                </Section>

                {/* ============================================ */}
                {/* SELECT */}
                {/* ============================================ */}
                <Section title="Danh sách chọn">
                    <Subsection title="Cơ bản">
                        <div className="ui-kit-form-grid">
                            <Select 
                                label="Danh sách mặc định"
                                options={selectOptions}
                                value={selectValue}
                                onChange={(e) => setSelectValue(e.target.value)}
                            />
                            <Select 
                                label="Danh sách bắt buộc"
                                options={selectOptions}
                                required
                            />
                            <Select 
                                label="Có hướng dẫn"
                                options={selectOptions}
                                helper="Chọn một mục"
                            />
                            <Select 
                                label="Có lỗi"
                                options={selectOptions}
                                error="Vui lòng chọn một mục"
                            />
                        </div>
                    </Subsection>

                    <Subsection title="Trạng thái danh sách chọn">
                        <div className="ui-kit-form-grid">
                            <Select 
                                label="Đã khóa"
                                options={selectOptions}
                                disabled
                            />
                        </div>
                    </Subsection>

                    <Subsection title="Kích thước danh sách chọn">
                        <div className="ui-kit-form-grid">
                            <Select label="Nhỏ" size="sm" options={selectOptions} />
                            <Select label="Vừa" size="md" options={selectOptions} />
                            <Select label="Lớn" size="lg" options={selectOptions} />
                        </div>
                    </Subsection>
                </Section>

                {/* ============================================ */}
                {/* CARDS */}
                {/* ============================================ */}
                <Section title="Thẻ nội dung">
                    <Subsection title="Biến thể thẻ">
                        <div className="ui-kit-card-grid">
                            <Card>
                                <CardHeader title="Thẻ mặc định" subtitle="Phụ đề thẻ" />
                                <CardBody>
                                    <p>Đây là biến thể thẻ mặc định với kiểu hiển thị tiêu chuẩn.</p>
                                </CardBody>
                                <CardFooter>
                                    <Button size="sm">Thao tác</Button>
                                </CardFooter>
                            </Card>

                            <Card variant="outlined">
                                <CardHeader title="Thẻ có viền" />
                                <CardBody>
                                    <p>Thẻ này dùng viền mảnh thay cho bóng đổ.</p>
                                </CardBody>
                            </Card>

                            <Card variant="elevated">
                                <CardHeader title="Thẻ nổi bật" />
                                <CardBody>
                                    <p>Thẻ này có bóng đổ đậm hơn để nhấn mạnh.</p>
                                </CardBody>
                            </Card>
                        </div>
                    </Subsection>

                    <Subsection title="Thẻ có hành động">
                        <Card>
                            <CardHeader 
                                title="Người dùng" 
                                subtitle="Quản lý các thành viên trong nhóm"
                                action={<Button size="sm">Thêm người dùng</Button>}
                            />
                            <CardBody>
                                <p>Nội dung thẻ hiển thị tại đây cùng với nút hành động ở phần đầu thẻ.</p>
                            </CardBody>
                            <CardFooter align="between">
                                <span className="text-sm text-gray-500">Cập nhật gần nhất: Hôm nay</span>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost">Hủy</Button>
                                    <Button size="sm">Lưu</Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </Subsection>
                </Section>

                {/* ============================================ */}
                {/* BADGES */}
                {/* ============================================ */}
                <Section title="Huy hiệu">
                    <Subsection title="Biến thể">
                        <div className="ui-kit-row">
                            <Badge variant="default">Mặc định</Badge>
                            <Badge variant="primary">Chính</Badge>
                            <Badge variant="success">Thành công</Badge>
                            <Badge variant="warning">Cảnh báo</Badge>
                            <Badge variant="danger">Nguy hiểm</Badge>
                            <Badge variant="info">Thông tin</Badge>
                        </div>
                    </Subsection>

                    <Subsection title="Kích thước">
                        <div className="ui-kit-row ui-kit-row-center">
                            <Badge size="sm">Nhỏ</Badge>
                            <Badge size="md">Vừa</Badge>
                            <Badge size="lg">Lớn</Badge>
                        </div>
                    </Subsection>

                    <Subsection title="Có chấm chỉ báo">
                        <div className="ui-kit-row">
                            <Badge variant="success" dot>Đang hoạt động</Badge>
                            <Badge variant="warning" dot>Tạm vắng</Badge>
                            <Badge variant="danger" dot>Bận</Badge>
                            <Badge variant="default" dot>Ngoại tuyến</Badge>
                        </div>
                    </Subsection>

                    <Subsection title="Kiểu viền">
                        <div className="ui-kit-row">
                            <Badge variant="primary" outline>Chính</Badge>
                            <Badge variant="success" outline>Thành công</Badge>
                            <Badge variant="danger" outline>Nguy hiểm</Badge>
                        </div>
                    </Subsection>

                    <Subsection title="Huy hiệu trạng thái có sẵn">
                        <div className="ui-kit-row">
                            <StatusBadge status="active" />
                            <StatusBadge status="pending" />
                            <StatusBadge status="inactive" />
                            <StatusBadge status="approved" />
                            <StatusBadge status="rejected" />
                            <StatusBadge status="maintenance" />
                            <StatusBadge status="available" />
                            <StatusBadge status="assigned" />
                            <StatusBadge status="overdue" />
                        </div>
                    </Subsection>
                </Section>

                {/* ============================================ */}
                {/* TABLE */}
                {/* ============================================ */}
                <Section title="Bảng dữ liệu">
                    <Subsection title="Bảng cơ bản">
                        <Table 
                            columns={tableColumns}
                            data={tableData}
                        />
                    </Subsection>

                    <Subsection title="Bảng kèm thẻ bao ngoài">
                        <TableCard
                            title="Thành viên nhóm"
                            subtitle="Quản lý người dùng trong tổ chức"
                            action={<Button size="sm">Thêm thành viên</Button>}
                            columns={tableColumns}
                            data={tableData}
                        >
                            <TablePagination 
                                currentPage={currentPage}
                                totalPages={3}
                                totalItems={15}
                                pageSize={5}
                                onPageChange={setCurrentPage}
                            />
                        </TableCard>
                    </Subsection>

                    <Subsection title="Trạng thái tải">
                        <div className="mb-4">
                            <Button size="sm" onClick={handleTableLoadingDemo}>
                                Bật/tắt tải
                            </Button>
                        </div>
                        <Table 
                            columns={tableColumns}
                            data={tableData}
                            loading={tableLoading}
                        />
                    </Subsection>

                    <Subsection title="Trạng thái rỗng">
                        <Table 
                            columns={tableColumns}
                            data={[]}
                            emptyMessage="Không tìm thấy thành viên nào"
                        />
                    </Subsection>

                    <Subsection title="Trạng thái rỗng tùy biến">
                        <Table 
                            columns={tableColumns}
                            data={[]}
                            emptyState={
                                <div className="text-center py-8">
                                    <svg 
                                        className="mx-auto h-12 w-12 text-gray-400" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có người dùng</h3>
                                    <p className="mt-1 text-sm text-gray-500">Hãy bắt đầu bằng cách thêm một thành viên mới.</p>
                                    <div className="mt-4">
                                        <Button size="sm">Thêm thành viên</Button>
                                    </div>
                                </div>
                            }
                        />
                    </Subsection>

                    <Subsection title="Dòng có thể bấm">
                        <Table 
                            columns={tableColumns.slice(0, 4)}
                            data={tableData}
                            onRowClick={(row) => toast.info(`Đã chọn: ${row.name}`)}
                        />
                    </Subsection>
                </Section>

                {/* ============================================ */}
                {/* MODAL */}
                {/* ============================================ */}
                <Section title="Hộp thoại">
                    <Subsection title="Hộp thoại cơ bản">
                        <div className="ui-kit-row">
                            <Button onClick={() => setIsModalOpen(true)}>Mở hộp thoại</Button>
                            <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
                                Mở hộp thoại xác nhận
                            </Button>
                        </div>

                        <Modal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            title="Hộp thoại mẫu"
                            footer={
                                <div className="ui-modal-footer-buttons">
                                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                                        Hủy
                                    </Button>
                                    <Button onClick={() => {
                                        toast.success('Đã lưu thành công!');
                                        setIsModalOpen(false);
                                    }}>
                                        Lưu thay đổi
                                    </Button>
                                </div>
                            }
                        >
                            <div className="space-y-4">
                                <p>Đây là hộp thoại cơ bản với tiêu đề, nội dung và các nút thao tác ở chân hộp thoại.</p>
                                <Input label="Họ và tên" placeholder="Nhập họ và tên" />
                                <Select 
                                    label="Danh mục" 
                                    options={selectOptions}
                                />
                            </div>
                        </Modal>

                        <ConfirmModal
                            isOpen={isConfirmOpen}
                            onClose={() => setIsConfirmOpen(false)}
                            onConfirm={() => {
                                toast.success('Đã xác nhận thao tác!');
                                setIsConfirmOpen(false);
                            }}
                            title="Xóa mục"
                            message="Bạn có chắc muốn xóa mục này không? Thao tác này không thể hoàn tác."
                            confirmText="Xóa"
                            cancelText="Hủy"
                            variant="danger"
                        />
                    </Subsection>
                </Section>

                {/* ============================================ */}
                {/* TOAST */}
                {/* ============================================ */}
                <Section title="Thông báo nổi">
                    <Subsection title="Loại thông báo">
                        <div className="ui-kit-row">
                            <Button 
                                variant="primary" 
                                onClick={() => toast.success('Thao tác đã hoàn tất thành công!')}
                            >
                                Thành công
                            </Button>
                            <Button 
                                variant="danger" 
                                onClick={() => toast.error('Đã xảy ra lỗi. Vui lòng thử lại.')}
                            >
                                Lỗi
                            </Button>
                            <Button 
                                variant="secondary" 
                                onClick={() => toast.warning('Vui lòng kiểm tra lại dữ liệu trước khi gửi.')}
                            >
                                Cảnh báo
                            </Button>
                            <Button 
                                variant="ghost" 
                                onClick={() => toast.info('Đây là một thông tin hữu ích dành cho bạn.')}
                            >
                                Thông tin
                            </Button>
                        </div>
                    </Subsection>

                    <Subsection title="Thông báo có tiêu đề">
                        <div className="ui-kit-row">
                            <Button onClick={() => toast.addToast({
                                type: 'success',
                                title: 'Thành công!',
                                message: 'Các thay đổi của bạn đã được lưu thành công.',
                            })}>
                                Có tiêu đề
                            </Button>
                            <Button onClick={() => toast.addToast({
                                type: 'error',
                                title: 'Lỗi',
                                message: 'Không thể lưu thay đổi. Vui lòng kiểm tra kết nối và thử lại.',
                                duration: 10000,
                            })}>
                                Hiển thị lâu (10 giây)
                            </Button>
                        </div>
                    </Subsection>

                    <Subsection title="Nhiều thông báo liên tiếp">
                        <Button onClick={() => {
                            toast.success('Thông báo đầu tiên');
                            setTimeout(() => toast.info('Thông báo thứ hai'), 500);
                            setTimeout(() => toast.warning('Thông báo thứ ba'), 1000);
                        }}>
                            Hiển thị nhiều thông báo
                        </Button>
                    </Subsection>
                </Section>
            </div>
        </div>
    );
};

export default UIKit;
