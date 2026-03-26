/**
 * Vietnamese Translations - Tiếng Việt
 */
export default {
    // ========================================================================
    // Common / Chung
    // ========================================================================
    common: {
        save: 'Lưu',
        cancel: 'Hủy',
        delete: 'Xóa',
        edit: 'Sửa',
        create: 'Tạo mới',
        add: 'Thêm',
        remove: 'Gỡ bỏ',
        search: 'Tìm kiếm',
        filter: 'Lọc',
        clear: 'Xóa',
        reset: 'Đặt lại',
        submit: 'Gửi',
        confirm: 'Xác nhận',
        close: 'Đóng',
        back: 'Quay lại',
        next: 'Tiếp theo',
        previous: 'Trước',
        loading: 'Đang tải...',
        noData: 'Không có dữ liệu',
        error: 'Lỗi',
        success: 'Thành công',
        warning: 'Cảnh báo',
        info: 'Thông tin',
        yes: 'Có',
        no: 'Không',
        all: 'Tất cả',
        none: 'Không có',
        actions: 'Thao tác',
        status: 'Trạng thái',
        type: 'Loại',
        name: 'Tên',
        description: 'Mô tả',
        notes: 'Ghi chú',
        date: 'Ngày',
        time: 'Thời gian',
        createdAt: 'Ngày tạo',
        updatedAt: 'Ngày cập nhật',
        details: 'Chi tiết',
        view: 'Xem',
        copy: 'Sao chép',
        copied: 'Đã sao chép',
        download: 'Tải xuống',
        upload: 'Tải lên',
        refresh: 'Làm mới',
        retry: 'Thử lại',
        optional: 'Tùy chọn',
        required: 'Bắt buộc',
        items: 'mục',
        assign: 'Gán',
        unassign: 'Gỡ gán',
        regenerate: 'Tạo lại',
    },

    // ========================================================================
    // Navigation / Điều hướng
    // ========================================================================
    nav: {
        dashboard: 'Tổng quan',
        myAssets: 'Tài sản của tôi',
        assets: 'Quản lý tài sản',
        equipment: 'Thiết bị',
        requests: 'Yêu cầu',
        maintenance: 'Bảo trì',
        reports: 'Báo cáo',
        users: 'Người dùng',
        settings: 'Cài đặt',
        profile: 'Hồ sơ',
        logout: 'Đăng xuất',
        collapse: 'Thu gọn',
        expand: 'Mở rộng',
    },

    // ========================================================================
    // Auth / Xác thực
    // ========================================================================
    auth: {
        login: 'Đăng nhập',
        logout: 'Đăng xuất',
        register: 'Đăng ký',
        forgotPassword: 'Quên mật khẩu',
        resetPassword: 'Đặt lại mật khẩu',
        changePassword: 'Đổi mật khẩu',
        employeeCode: 'Mã nhân viên',
        email: 'Email',
        password: 'Mật khẩu',
        confirmPassword: 'Xác nhận mật khẩu',
        currentPassword: 'Mật khẩu hiện tại',
        newPassword: 'Mật khẩu mới',
        rememberMe: 'Ghi nhớ đăng nhập',
        loginSuccess: 'Đăng nhập thành công',
        logoutSuccess: 'Đã đăng xuất',
        invalidCredentials: 'Thông tin đăng nhập không đúng',
        sessionExpired: 'Phiên đăng nhập đã hết hạn',
        unauthorized: 'Bạn không có quyền truy cập',
        verificationCode: 'Mã xác thực',
        sendCode: 'Gửi mã',
        resendCode: 'Gửi lại mã',
        codeExpired: 'Mã đã hết hạn',
        codeSent: 'Đã gửi mã xác thực đến email của bạn',
        passwordChanged: 'Đổi mật khẩu thành công',
        mustChangePassword: 'Bạn cần đổi mật khẩu để tiếp tục',
        welcomeBack: 'Chào mừng trở lại',
        signInToContinue: 'Đăng nhập để tiếp tục',
    },

    // ========================================================================
    // Dashboard / Tổng quan
    // ========================================================================
    dashboard: {
        title: 'Tổng quan',
        welcome: 'Chào mừng trở lại, {name}!',
        welcomeSubtitle: 'Đây là tình hình thiết bị của bạn hôm nay.',
        totalEquipment: 'Tổng thiết bị',
        totalAssets: 'Tổng tài sản',
        activeRequests: 'Yêu cầu đang xử lý',
        maintenanceDue: 'Cần bảo trì',
        assignedAssets: 'Đã gán',
        availableAssets: 'Có sẵn',
        maintenanceAssets: 'Đang bảo trì',
        recentActivity: 'Hoạt động gần đây',
        recentEquipment: 'Thiết bị gần đây',
        quickActions: 'Thao tác nhanh',
        myAssignedAssets: 'Tài sản được gán cho tôi',
        pendingRequests: 'Yêu cầu chờ xử lý',
        pendingApproval: '{count} chờ duyệt',
        overdue: '{count} quá hạn',
        thisMonth: '+{count} tháng này',
        addEquipment: 'Thêm thiết bị',
        newRequest: 'Tạo yêu cầu',
        scanQrCode: 'Quét mã QR',
        viewReports: 'Xem báo cáo',
        viewAll: 'Xem tất cả',
        loading: 'Đang tải...',
        noEquipmentFound: 'Không tìm thấy thiết bị',
        noEquipmentHint: 'Bắt đầu bằng cách thêm thiết bị đầu tiên.',
        equipmentName: 'Tên thiết bị',
        code: 'Mã',
        assignedTo: 'Người sử dụng',
        lastMaintenance: 'Bảo trì lần cuối',
    },

    // ========================================================================
    // Assets / Tài sản
    // ========================================================================
    assets: {
        title: 'Quản lý tài sản',
        subtitle: 'Quản lý dữ liệu và phân công tài sản',
        myAssets: 'Tài sản của tôi',
        myAssetsSubtitle: 'Xem tài sản được gán và tra cứu QR',
        allAssets: 'Tất cả tài sản',
        createAsset: 'Tạo tài sản mới',
        editAsset: 'Chỉnh sửa tài sản',
        deleteAsset: 'Xóa tài sản',
        assetDetails: 'Chi tiết tài sản',
        assetCode: 'Mã tài sản',
        assetName: 'Tên tài sản',
        assetType: 'Loại tài sản',
        assetStatus: 'Trạng thái',
        
        // Types
        types: {
            all: 'Tất cả loại',
            tray: 'Khay',
            machine: 'Máy móc',
            tool: 'Dụng cụ',
            equipment: 'Thiết bị',
            other: 'Khác',
        },
        
        // Statuses
        statuses: {
            all: 'Tất cả trạng thái',
            active: 'Đang hoạt động',
            off_service: 'Ngừng phục vụ',
            maintenance: 'Đang bảo trì',
            retired: 'Đã thanh lý',
        },
        
        // Assignment
        assignment: 'Phân công',
        assigned: 'Đã gán',
        unassigned: 'Chưa gán',
        assignTo: 'Gán cho',
        assignAsset: 'Gán tài sản',
        unassignAsset: 'Gỡ gán tài sản',
        currentAssignee: 'Người đang sử dụng',
        assignedSince: 'Được gán từ',
        assignmentHistory: 'Lịch sử phân công',
        noAssignment: 'Chưa được gán',
        selectEmployee: 'Chọn nhân viên',
        assignSuccess: 'Gán tài sản thành công',
        unassignSuccess: 'Gỡ gán tài sản thành công',
        
        // QR
        qrIdentity: 'Định danh QR',
        qrCode: 'Mã QR',
        qrPayload: 'Nội dung QR',
        regenerateQr: 'Tạo lại QR',
        regenerateQrConfirm: 'Mã QR cũ vẫn hoạt động (để tương thích ngược). Bạn có chắc muốn tạo mã QR mới?',
        qrRegenerated: 'Đã tạo mã QR mới',
        copyPayload: 'Sao chép nội dung QR',
        noQrCode: 'Chưa có mã QR',
        
        // QR Resolve
        qrLookup: 'Tra cứu QR',
        qrLookupSubtitle: 'Nhập hoặc quét mã QR để xem thông tin tài sản',
        enterQrPayload: 'Nhập nội dung QR (VD: MESO-xxxx-xxxx-xxxx)',
        resolve: 'Tra cứu',
        assetFound: 'Đã tìm thấy tài sản!',
        assetNotFound: 'Không tìm thấy tài sản hoặc đã bị xóa',
        qrEnterHint: 'Nhập mã QR để xem thông tin tài sản',
        qrHelpTitle: 'Hướng dẫn tra cứu QR',
        qrHelpDesc: 'Quét mã QR trên tài sản bằng camera điện thoại hoặc ứng dụng quét QR, sau đó dán nội dung (VD: MESO-xxxx-xxxx-xxxx) vào ô nhập liệu phía trên.',
        
        // Table columns
        columns: {
            assetCode: 'Mã tài sản',
            name: 'Tên tài sản',
            type: 'Loại',
            status: 'Trạng thái',
            assignee: 'Người sử dụng',
            assignment: 'Phân công',
            qr: 'QR',
            assignedAt: 'Ngày gán',
            actions: 'Thao tác',
        },
        
        // My Assets
        myAssigned: 'Tài sản được gán',
        noAssignedYet: 'Bạn chưa được gán tài sản nào',
        available: 'Có sẵn',
        
        // CRUD
        createSuccess: 'Tạo tài sản thành công',
        updateSuccess: 'Cập nhật tài sản thành công',
        deleteSuccess: 'Xóa tài sản thành công',
        deleteConfirm: 'Bạn có chắc muốn xóa tài sản "{name}"? Thao tác này không thể hoàn tác.',
        
        // Filters
        searchPlaceholder: 'Tìm theo mã hoặc tên...',
        filterByType: 'Lọc theo loại',
        filterByStatus: 'Lọc theo trạng thái',
        filterByAssignment: 'Lọc theo phân công',
        
        // Empty states
        noAssets: 'Không có tài sản nào',
        noAssignedAssets: 'Bạn chưa được gán tài sản nào',
        
        // Form
        assetCodeHint: 'Để trống để tự động tạo mã',
        enterAssetName: 'Nhập tên tài sản',
        optionalNotes: 'Ghi chú (tùy chọn)',
        chooseEmployee: 'Chọn nhân viên...',
        
        // Items count
        itemsCount: '{count} tài sản',

        // Check-in / Check-out (Phase 4)
        checkIn: 'Nhận tài sản',
        checkOut: 'Trả tài sản',
        checkinStatus: 'Trạng thái nhận',
        checkedIn: 'Đã nhận',
        notCheckedIn: 'Chưa nhận',
        checkinSuccess: 'Nhận tài sản thành công',
        checkoutSuccess: 'Trả tài sản thành công',
        checkedInAt: 'Đã nhận lúc',
        notCheckedInYet: 'Chưa nhận hôm nay',
        currentShift: 'Ca hiện tại',
        noActiveShift: 'Không có ca đang hoạt động',
        viewDetails: 'Xem chi tiết',

        // Modal Tabs
        statusTab: 'Trạng thái',
        instructionsTab: 'Hướng dẫn',
        openInstructions: 'Mở hướng dẫn',
        noInstructions: 'Không có hướng dẫn cho tài sản này',
        instructionsDesc: 'Tài sản này có tài liệu hướng dẫn đính kèm. Nhấn nút bên dưới để xem.',
    },

    // ========================================================================
    // Users / Người dùng
    // ========================================================================
    users: {
        title: 'Quản lý người dùng',
        allUsers: 'Tất cả người dùng',
        createUser: 'Tạo người dùng',
        editUser: 'Chỉnh sửa người dùng',
        deleteUser: 'Xóa người dùng',
        userDetails: 'Chi tiết người dùng',
        fullName: 'Họ và tên',
        employeeCode: 'Mã nhân viên',
        email: 'Email',
        role: 'Vai trò',
        status: 'Trạng thái',
        
        // Roles
        roles: {
            admin: 'Quản trị viên',
            hr: 'Nhân sự',
            doctor: 'Bác sĩ',
            technician: 'Kỹ thuật viên',
            staff: 'Nhân viên',
        },
        
        // Statuses
        statuses: {
            active: 'Đang hoạt động',
            inactive: 'Ngừng hoạt động',
        },
    },

    // ========================================================================
    // Profile / Hồ sơ
    // ========================================================================
    profile: {
        title: 'Hồ sơ của tôi',
        personalInfo: 'Thông tin cá nhân',
        security: 'Bảo mật',
        preferences: 'Tùy chọn',
        language: 'Ngôn ngữ',
        changeAvatar: 'Đổi ảnh đại diện',
        updateProfile: 'Cập nhật hồ sơ',
        updateSuccess: 'Cập nhật hồ sơ thành công',
    },

    // ========================================================================
    // Settings / Cài đặt
    // ========================================================================
    settings: {
        title: 'Cài đặt',
        general: 'Chung',
        appearance: 'Giao diện',
        language: 'Ngôn ngữ',
        notifications: 'Thông báo',
        selectLanguage: 'Chọn ngôn ngữ',
        theme: 'Giao diện',
        lightMode: 'Sáng',
        darkMode: 'Tối',
        systemDefault: 'Theo hệ thống',
    },

    // ========================================================================
    // Requests / Yêu cầu
    // ========================================================================
    requests: {
        title: 'Yêu cầu',
        subtitle: 'Quản lý yêu cầu mượn, trả và bảo trì thiết bị',
        myRequests: 'Yêu cầu của tôi',
        allRequests: 'Tất cả yêu cầu',
        totalRequests: 'Tổng yêu cầu',
        createRequest: 'Tạo yêu cầu',
        newRequest: 'Yêu cầu mới',
        requestDetails: 'Chi tiết yêu cầu',
        requestId: 'Mã yêu cầu',
        requestDate: 'Ngày yêu cầu',
        requestType: 'Loại yêu cầu',
        equipment: 'Thiết bị',
        priority: 'Độ ưu tiên',
        notes: 'Ghi chú',
        requester: 'Người yêu cầu',
        // Status
        pending: 'Chờ xử lý',
        approved: 'Đã duyệt',
        rejected: 'Từ chối',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy',
        // Types
        types: {
            all: 'Tất cả loại',
            borrow: 'Mượn thiết bị',
            return: 'Trả thiết bị',
            maintenance: 'Yêu cầu bảo trì',
        },
        // Priority
        priorities: {
            low: 'Thấp',
            normal: 'Bình thường',
            high: 'Cao',
        },
        // Actions
        view: 'Xem',
        cancel: 'Hủy',
        approve: 'Duyệt',
        reject: 'Từ chối',
        submitRequest: 'Gửi yêu cầu',
        // Messages
        noRequests: 'Không có yêu cầu',
        noRequestsHint: 'Bắt đầu bằng cách tạo yêu cầu mới.',
        searchPlaceholder: 'Tìm theo thiết bị hoặc mã yêu cầu...',
        requestSubmitted: 'Gửi yêu cầu thành công!',
        addDetails: 'Thêm thông tin chi tiết...',
        comingSoon: 'Sắp ra mắt',
    },

    // ========================================================================
    // Maintenance / Bảo trì
    // ========================================================================
    maintenance: {
        title: 'Bảo trì',
        subtitle: 'Lịch bảo trì và hồ sơ dịch vụ',
        schedule: 'Lịch bảo trì',
        records: 'Hồ sơ bảo trì',
        totalRecords: 'Tổng hồ sơ',
        upcoming: 'Sắp tới',
        inProgress: 'Đang thực hiện',
        completed: 'Hoàn thành',
        overdue: 'Quá hạn',
        // Types
        types: {
            all: 'Tất cả loại',
            scheduled: 'Định kỳ',
            emergency: 'Khẩn cấp',
            preventive: 'Phòng ngừa',
        },
        // Fields
        maintenanceId: 'Mã bảo trì',
        equipmentCode: 'Mã thiết bị',
        scheduledDate: 'Ngày dự kiến',
        assignedTo: 'Phân công cho',
        description: 'Mô tả',
        // Views
        listView: 'Danh sách',
        calendarView: 'Lịch',
        // Actions
        createSchedule: 'Tạo lịch bảo trì',
        markComplete: 'Đánh dấu hoàn thành',
        reschedule: 'Đổi lịch',
        // Messages
        noRecords: 'Không có hồ sơ bảo trì',
        noRecordsHint: 'Lịch bảo trì sẽ hiển thị ở đây.',
        searchPlaceholder: 'Tìm theo thiết bị hoặc mã bảo trì...',
        history: 'Lịch sử bảo trì',
        comingSoon: 'Sắp ra mắt',
    },

    // ========================================================================
    // Reports / Báo cáo
    // ========================================================================
    reports: {
        title: 'Báo cáo',
        assetReport: 'Báo cáo tài sản',
        assignmentReport: 'Báo cáo phân công',
        maintenanceReport: 'Báo cáo bảo trì',
        exportPdf: 'Xuất PDF',
        exportExcel: 'Xuất Excel',
        comingSoon: 'Sắp ra mắt',
    },

    // ========================================================================
    // Errors / Lỗi
    // ========================================================================
    errors: {
        general: 'Đã xảy ra lỗi. Vui lòng thử lại.',
        network: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối.',
        notFound: 'Không tìm thấy trang',
        notFoundMessage: 'Trang bạn tìm kiếm không tồn tại.',
        forbidden: 'Bạn không có quyền truy cập trang này',
        serverError: 'Lỗi máy chủ. Vui lòng thử lại sau.',
        validation: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
        sessionExpired: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        goHome: 'Về trang chủ',
        goBack: 'Quay lại',
    },

    // ========================================================================
    // Confirmations / Xác nhận
    // ========================================================================
    confirm: {
        delete: 'Xác nhận xóa',
        deleteMessage: 'Bạn có chắc muốn xóa? Thao tác này không thể hoàn tác.',
        deleteAssetMessage: 'Bạn có chắc muốn xóa tài sản "{name}"? Thao tác này không thể hoàn tác.',
        unassign: 'Xác nhận gỡ gán',
        unassignMessage: 'Bạn có chắc muốn gỡ gán tài sản "{name}" khỏi {assignee}?',
        regenerateQr: 'Xác nhận tạo lại QR',
        logout: 'Xác nhận đăng xuất',
        logoutMessage: 'Bạn có chắc muốn đăng xuất?',
    },

    // ========================================================================
    // Time / Thời gian
    // ========================================================================
    time: {
        today: 'Hôm nay',
        yesterday: 'Hôm qua',
        tomorrow: 'Ngày mai',
        thisWeek: 'Tuần này',
        lastWeek: 'Tuần trước',
        thisMonth: 'Tháng này',
        lastMonth: 'Tháng trước',
        daysAgo: '{count} ngày trước',
        hoursAgo: '{count} giờ trước',
        minutesAgo: '{count} phút trước',
        justNow: 'Vừa xong',
        current: 'Hiện tại',
    },

    // ========================================================================
    // Pagination / Phân trang
    // ========================================================================
    pagination: {
        showing: 'Hiển thị {from} - {to} trong {total}',
        page: 'Trang {page} / {total}',
        itemsPerPage: 'Số mục mỗi trang',
        goToPage: 'Đến trang',
        first: 'Đầu',
        last: 'Cuối',
    },
};
