/**
 * Vietnamese Translations - Tiếng Việt
 * Mesoco Dental Asset Management
 * Quy ước: Dùng từ ngữ thân thiện vận hành phòng khám
 * - "Phiếu" thay vì "Request"
 * - "Chờ duyệt" thay vì "Submitted"
 * - "Thiết bị" thay vì "Asset"
 */
export default {
    // ========================================================================
    // Common / Chung
    // ========================================================================
    common: {
        save: 'Lưu',
        saving: 'Đang lưu...',
        cancel: 'Hủy',
        delete: 'Xóa',
        edit: 'Chỉnh sửa',
        create: 'Tạo mới',
        update: 'Cập nhật',
        add: 'Thêm',
        remove: 'Gỡ bỏ',
        search: 'Tìm kiếm',
        searchPlaceholder: 'Tìm kiếm...',
        selectOption: 'Chọn một tùy chọn...',
        filter: 'Lọc',
        sort: 'Sắp xếp',
        clear: 'Xóa',
        reset: 'Đặt lại',
        submit: 'Gửi',
        confirm: 'Xác nhận',
        close: 'Đóng',
        closeSidebar: 'Đóng thanh bên',
        closeModal: 'Đóng hộp thoại',
        back: 'Quay lại',
        next: 'Tiếp tục',
        previous: 'Trước',
        loading: 'Đang tải...',
        processing: 'Đang xử lý...',
        noData: 'Chưa có dữ liệu',
        error: 'Lỗi',
        success: 'Thành công',
        warning: 'Cảnh báo',
        info: 'Thông tin',
        unknown: 'Không xác định',
        yes: 'Có',
        no: 'Không',
        all: 'Tất cả',
        none: 'Không có',
        actions: 'Thao tác',
        openMenu: 'Mở menu',
        user: 'Người dùng',
        print: 'In',
        status: {
            label: 'Trạng thái',
            active: 'Hoạt động',
            inactive: 'Không hoạt động',
            pending: 'Chờ xử lý',
            approved: 'Đã duyệt',
            rejected: 'Từ chối',
            submitted: 'Chờ duyệt',
            cancelled: 'Đã hủy',
            maintenance: 'Bảo trì',
            inProgress: 'Đang xử lý',
            in_progress: 'Đang xử lý',
            offService: 'Tạm ngưng',
            off_service: 'Tạm ngưng',
            available: 'Sẵn sàng',
            assigned: 'Đã phân công',
            overdue: 'Quá hạn',
            expired: 'Hết hạn',
            terminated: 'Đã chấm dứt',
            retired: 'Đã thu hủy',
            draft: 'Nháp'
        },
        type: 'Loại',
        name: 'Tên',
        description: 'Mô tả',
        note: 'Ghi chú',
        notes: 'Ghi chú',
        date: 'Ngày',
        time: 'Thời gian',
        from: 'Từ',
        to: 'Đến',
        createdAt: 'Ngày tạo',
        updatedAt: 'Cập nhật lúc',
        details: 'Chi tiết',
        view: 'Xem',
        copy: 'Sao chép',
        copied: 'Đã sao chép',
        download: 'Tải xuống',
        upload: 'Tải lên',
        refresh: 'Làm mới',
        retry: 'Thử lại',
        optional: 'Không bắt buộc',
        required: 'Bắt buộc',
        items: 'mục',
        assign: 'Giao',
        unassign: 'Thu hồi',
        regenerate: 'Tạo lại',
    },

    // ========================================================================
    // Navigation / Điều hướng
    // ========================================================================
    nav: {
        dashboard: 'Tổng quan',
        profile: 'Hồ sơ',
        employees: 'Hồ sơ nhân viên',
        assets: 'Danh mục tài sản',
        equipmentCatalog: 'Danh mục tài sản',
        myEquipment: 'Thiết bị của tôi',
        myAssets: 'Thiết bị của tôi',
        equipment: 'Thiết bị',
        shifts: 'Ca làm',
        checkin: 'Ghi nhận ca',
        requests: 'Phiếu cấp phát',
        reviewRequests: 'Duyệt phiếu cấp phát',
        inventory: 'Kiểm kê định kì',
        inventoryValuation: 'Kiểm kê & định giá',
        maintenance: 'Bảo trì & Sửa chữa',
        offService: 'Tạm ngưng sử dụng',
        feedback: 'Phản hồi & đề xuất',
        reports: 'Báo cáo & thống kê',
        settings: 'Cài đặt',
        admin: 'Quản trị',
        users: 'Người dùng',
        locations: 'Danh mục vị trí',
        myAssetHistory: 'Lịch sử thiết bị',
        equipmentLookup: 'Tra cứu thiết bị',
        qrScan: 'Quét QR',
        contracts: 'Hợp đồng',
        disposal: 'Thu hủy',
        incidents: 'Quản lý sự cố',
        disposalForms: 'Phiếu thu hủy',
        suppliers: 'Nhà cung cấp',
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
        // Login page
        employeeId: 'Mã nhân viên',
        enterEmployeeId: 'Nhập mã nhân viên',
        enterPassword: 'Nhập mật khẩu',
        signingIn: 'Đang đăng nhập...',
        continue: 'Tiếp tục',
        loginFailed: 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin.',
        // Forgot password page
        forgotPasswordDesc: 'Nhập địa chỉ email của bạn và chúng tôi sẽ gửi mã xác thực để đặt lại mật khẩu.',
        emailAddress: 'Địa chỉ email',
        enterEmail: 'Nhập email',
        sending: 'Đang gửi...',
        sendVerificationCode: 'Gửi mã xác thực',
        backToLogin: 'Quay lại Đăng nhập',
        backToEmail: 'Quay lại Email',
        resetPasswordDesc: 'Nhập mã xác thực 6 chữ số đã gửi đến email và mật khẩu mới.',
        enterVerificationCode: 'Nhập mã xác thực',
        resendCodeIn: 'Gửi lại mã sau {seconds}s',
        resendVerificationCode: 'Gửi lại mã xác thực',
        enterNewPassword: 'Nhập mật khẩu mới',
        confirmNewPassword: 'Xác nhận mật khẩu mới',
        passwordRequirements: 'Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
        resetting: 'Đang đặt lại...',
        resetPasswordBtn: 'Đặt lại mật khẩu',
        verificationCodeResent: 'Đã gửi mã xác thực mới.',
        invalidVerificationCode: 'Mã xác thực không hợp lệ.',
        failedToSendCode: 'Gửi mã xác thực thất bại. Vui lòng thử lại.',
        failedToResetPassword: 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.',
        failedToResendCode: 'Gửi lại mã thất bại. Vui lòng thử lại.',
        // New validation messages
        employeeIdRequired: 'Vui lòng nhập mã nhân viên.',
        passwordRequired: 'Vui lòng nhập mật khẩu.',
        emailRequired: 'Vui lòng nhập địa chỉ email.',
        emailInvalid: 'Vui lòng nhập email hợp lệ.',
        codeRequired: 'Vui lòng nhập mã xác thực.',
        passwordTooShort: 'Mật khẩu phải có ít nhất 8 ký tự.',
        confirmPasswordRequired: 'Vui lòng xác nhận mật khẩu.',
        passwordMismatch: 'Mật khẩu không khớp.',
        // Generic error messages (security)
        invalidCredentialsGeneric: 'Mã nhân viên hoặc mật khẩu không đúng.',
        codeSentGeneric: 'Nếu email đã đăng ký, chúng tôi đã gửi mã xác thực. Vui lòng kiểm tra hộp thư.',
        passwordResetSuccess: 'Đặt lại mật khẩu thành công. Đang chuyển về trang đăng nhập...',
        // Password visibility
        showPassword: 'Hiện mật khẩu',
        hidePassword: 'Ẩn mật khẩu',
    },

    // ========================================================================
    // Change Password / Đổi mật khẩu
    // ========================================================================
    changePassword: {
        currentPasswordRequired: 'Vui lòng nhập mật khẩu hiện tại.',
        newPasswordRequired: 'Vui lòng nhập mật khẩu mới.',
        confirmPasswordRequired: 'Vui lòng xác nhận mật khẩu mới.',
        currentPasswordIncorrect: 'Mật khẩu hiện tại không đúng.',
        passwordsDoNotMatch: 'Mật khẩu không khớp.',
        newPasswordSameAsCurrent: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.',
        enterCurrentPassword: 'Nhập mật khẩu hiện tại',
        success: 'Đổi mật khẩu thành công.',
        genericError: 'Đổi mật khẩu thất bại.',
        changing: 'Đang xử lý...',
    },

    // ========================================================================
    // Roles / Vai trò
    // ========================================================================
    roles: {
        staff: 'Nhân viên',
        employee: 'Nhân viên', // DB value 'employee' displays as 'Nhân viên'
        doctor: 'Bác sĩ',
        nurse: 'Y tá',
        technician: 'Kỹ thuật viên',
        receptionist: 'Lễ tân',
        manager: 'Quản lý',
        admin: 'Quản trị',
        owner: 'Chủ phòng khám',
        hr: 'Nhân sự',
    },

    // ========================================================================
    // Dashboard / Tổng quan
    // ========================================================================
    dashboard: {
        title: 'Tổng quan',
        welcome: 'Chào mừng trở lại, {name}!',
        welcomeSubtitle: 'Đây là tình hình thiết bị của bạn hôm nay.',
        welcomeSubtitleAdmin: 'Tổng quan về hệ thống quản lý thiết bị nha khoa.',
        welcomeSubtitleUser: 'Xem thiết bị được giao và quản lý phiếu yêu cầu của bạn.',
        welcomeSubtitleTechnician: 'Theo dõi lịch bảo trì và quản lý thiết bị.',
        
        // Admin/HR Cards
        totalEquipment: 'Tổng thiết bị',
        totalAssets: 'Tổng thiết bị',
        pendingApprovals: 'Phiếu chờ duyệt',
        activeRequests: 'Phiếu đang xử lý',
        maintenanceDue: 'Cần bảo trì',
        
        // Technician Cards
        maintenanceInProgress: 'Đang bảo trì',
        scheduledMaintenance: 'Lịch bảo trì',
        scheduled: '{count} đã lên lịch',
        upcomingTasks: 'Có công việc sắp tới',
        noScheduled: 'Không có lịch',
        
        // Doctor/Staff Cards
        myEquipmentCount: 'Thiết bị của tôi',
        myActiveRequests: 'Phiếu đang xử lý',
        alerts: 'Cảnh báo',
        lockedCount: '{count} đang khóa',
        pendingCount: '{count} chờ duyệt',
        allAvailable: 'Tất cả sẵn sàng',
        equipmentLocked: 'Thiết bị bị khóa',
        noAlerts: 'Không có cảnh báo',
        
        // Card Subtitles
        activeCount: '{count} đang hoạt động',
        needsReview: 'Cần xem xét',
        allClear: 'Đã xử lý hết',
        onSchedule: 'Đúng tiến độ',
        
        // Legacy keys (keep for backward compatibility)
        assignedAssets: 'Đã giao',
        availableAssets: 'Có sẵn',
        maintenanceAssets: 'Đang bảo trì',
        recentActivity: 'Hoạt động gần đây',
        recentEquipment: 'Thiết bị gần đây',
        myRecentEquipment: 'Thiết bị của tôi',
        
        // Quick Actions
        quickActions: 'Thao tác nhanh',
        addEquipment: 'Thêm thiết bị',
        newRequest: 'Tạo phiếu',
        scanQrCode: 'Quét mã QR',
        viewReports: 'Xem báo cáo',
        myEquipment: 'Thiết bị của tôi',
        myRequests: 'Phiếu của tôi',
        reviewRequests: 'Duyệt phiếu cấp phát',
        maintenance: 'Bảo trì & Sửa chữa',
        inventory: 'Kiểm kê & định giá',
        
        // Table
        viewAll: 'Xem tất cả',
        loading: 'Đang tải...',
        fetchError: 'Không thể tải dữ liệu. Vui lòng thử lại.',
        noEquipmentFound: 'Không tìm thấy thiết bị',
        noEquipmentHint: 'Bắt đầu bằng cách thêm thiết bị đầu tiên.',
        equipmentName: 'Tên thiết bị',
        code: 'Mã',
        assignedTo: 'Người sử dụng',
        lastMaintenance: 'Bảo trì lần cuối',
        lockStatus: 'Trạng thái khóa',
        locked: 'Đang khóa',
        available: 'Sẵn sàng',
        createRequest: 'Tạo phiếu',
        
        // Legacy keys
        myAssignedAssets: 'Thiết bị được giao cho tôi',
        pendingRequests: 'Phiếu chờ xử lý',
        pendingApproval: '{count} chờ duyệt',
        overdue: '{count} quá hạn',
        thisMonth: '+{count} tháng này',
    },

    // ========================================================================
    // Assets / Thiết bị
    // ========================================================================
    assets: {
        title: 'Thiết bị',
        subtitle: 'Quản lý dữ liệu và phân công thiết bị',
        myAssets: 'Thiết bị của tôi',
        myAssetsSubtitle: 'Xem thiết bị được giao và tra cứu QR',
        allAssets: 'Tất cả thiết bị',
        createAsset: 'Tạo thiết bị mới',
        editAsset: 'Chỉnh sửa thiết bị',
        deleteAsset: 'Xóa thiết bị',
        assetDetails: 'Chi tiết thiết bị',
        assetCode: 'Mã thiết bị',
        assetName: 'Tên thiết bị',
        assetType: 'Loại thiết bị',
        assetStatus: 'Trạng thái',
        serialNumber: 'Số serial',
        model: 'Model',
        category: 'Nhóm thiết bị',
        location: 'Vị trí',
        movable: 'Thiết bị di động',
        fixed: 'Thiết bị cố định',
        
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
            off_service: 'Tạm ngưng sử dụng',
            maintenance: 'Đang bảo trì',
            retired: 'Đã thu hủy',
        },
        
        // Assignment
        assignment: 'Phân công',
        assigned: 'Đã giao',
        unassigned: 'Chưa giao',
        assignTo: 'Giao cho',
        assignAsset: 'Giao thiết bị',
        unassignAsset: 'Thu hồi thiết bị',
        currentAssignee: 'Người đang sử dụng',
        assignedTo: 'Đang giao cho',
        assignedSince: 'Được giao từ',
        assignmentHistory: 'Lịch sử phân công',
        noAssignment: 'Chưa được giao',
        notAssigned: 'Chưa được giao thiết bị',
        selectEmployee: 'Chọn nhân viên',
        assignSuccess: 'Giao thiết bị thành công',
        unassignSuccess: 'Thu hồi thiết bị thành công',
        
        // Condition
        condition: 'Tình trạng',
        
        // QR
        qrIdentity: 'Định danh QR',
        qrCode: 'Mã QR',
        qrPayload: 'Nội dung QR',
        scanQr: 'Quét QR',
        regenerateQr: 'Tạo lại QR',
        regenerateQrConfirm: 'Mã QR cũ vẫn hoạt động (để tương thích ngược). Bạn có chắc muốn tạo mã QR mới?',
        qrRegenerated: 'Đã tạo mã QR mới',
        copyPayload: 'Sao chép nội dung QR',
        noQrCode: 'Chưa có mã QR',
        viewAsset: 'Xem thiết bị',
        
        // QR Resolve
        qrLookup: 'Tra cứu QR',
        qrLookupSubtitle: 'Nhập hoặc quét mã QR để xem thông tin thiết bị',
        enterQrPayload: 'Nhập nội dung QR (VD: MESO-xxxx-xxxx-xxxx)',
        resolve: 'Tra cứu',
        assetFound: 'Đã tìm thấy thiết bị!',
        assetNotFound: 'Không tìm thấy thiết bị hoặc đã bị xóa',
        qrEnterHint: 'Nhập mã QR để xem thông tin thiết bị',
        qrHelpTitle: 'Hướng dẫn tra cứu QR',
        qrHelpDesc: 'Quét mã QR trên thiết bị bằng camera điện thoại hoặc ứng dụng quét QR, sau đó dán nội dung (VD: MESO-xxxx-xxxx-xxxx) vào ô nhập liệu phía trên.',
        
        // Table columns
        columns: {
            assetCode: 'Mã thiết bị',
            name: 'Tên thiết bị',
            type: 'Loại',
            status: 'Trạng thái',
            assignee: 'Người sử dụng',
            assignment: 'Phân công',
            qr: 'QR',
            assignedAt: 'Ngày giao',
            actions: 'Thao tác',
        },
        
        // My Assets
        myAssigned: 'Thiết bị được giao',
        myEquipmentTitle: 'Thiết bị của tôi',
        noAssignedYet: 'Bạn chưa được giao thiết bị nào',
        available: 'Có sẵn',
        
        // CRUD
        createSuccess: 'Tạo thiết bị thành công',
        updateSuccess: 'Cập nhật thiết bị thành công',
        deleteSuccess: 'Xóa thiết bị thành công',
        deleteConfirm: 'Bạn có chắc muốn xóa thiết bị "{name}"? Thao tác này không thể hoàn tác.',
        
        // Filters
        searchPlaceholder: 'Tìm theo mã hoặc tên...',
        filterByType: 'Lọc theo loại',
        filterByStatus: 'Lọc theo trạng thái',
        filterByAssignment: 'Lọc theo phân công',
        
        // Empty states
        noAssets: 'Không có thiết bị nào',
        noAssignedAssets: 'Bạn chưa được giao thiết bị nào',
        
        // Form
        assetCodeHint: 'Để trống để tự động tạo mã',
        enterAssetName: 'Nhập tên thiết bị',
        optionalNotes: 'Ghi chú (không bắt buộc)',
        chooseEmployee: 'Chọn nhân viên...',
        
        // Items count
        itemsCount: '{count} thiết bị',

        // Check-in / Check-out (Phase 4)
        checkIn: 'Nhận thiết bị',
        checkOut: 'Trả thiết bị',
        checkinStatus: 'Trạng thái nhận',
        checkedIn: 'Đã nhận',
        notCheckedIn: 'Chưa nhận',
        checkinSuccess: 'Nhận thiết bị thành công',
        checkoutSuccess: 'Trả thiết bị thành công',
        checkedInAt: 'Đã nhận lúc',
        notCheckedInYet: 'Chưa nhận hôm nay',
        currentShift: 'Ca hiện tại',
        noActiveShift: 'Không có ca đang hoạt động',
        viewDetails: 'Xem chi tiết',

        // Modal Tabs
        statusTab: 'Trạng thái',
        instructionsTab: 'Hướng dẫn',
        openInstructions: 'Mở hướng dẫn',
        noInstructions: 'Không có hướng dẫn cho thiết bị này',
        instructionsDesc: 'Thiết bị này có tài liệu hướng dẫn đính kèm. Nhấn nút bên dưới để xem.',
    },

    // ========================================================================
    // Asset Condition / Tình trạng thiết bị
    // ========================================================================
    assetCondition: {
        ok: 'Hoạt động tốt',
        needsCheck: 'Cần kiểm tra',
        needsMaintenance: 'Cần bảo trì',
        broken: 'Bị hỏng',
        offService: 'Tạm ngưng sử dụng',
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
        
        // Roles (dùng chung từ roles section)
        roles: {
            admin: 'Quản trị',
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
    // Profile / Hồ sơ cá nhân
    // ========================================================================
    profile: {
        title: 'Hồ sơ cá nhân',
        personalDetails: 'Thông tin cá nhân',
        personalInfo: 'Thông tin cá nhân',
        security: 'Bảo mật',
        preferences: 'Tùy chọn',
        language: 'Ngôn ngữ',
        changeAvatar: 'Đổi ảnh đại diện',
        updateProfile: 'Cập nhật hồ sơ',
        updateSuccess: 'Đã cập nhật hồ sơ thành công',
        updateError: 'Cập nhật hồ sơ thất bại. Vui lòng thử lại.',
        loadError: 'Không thể tải hồ sơ. Vui lòng thử lại.',
        employeeId: 'Mã nhân viên',
        employeeFullName: 'Họ và tên nhân viên',
        fullName: 'Họ và tên',
        phone: 'Số điện thoại',
        phoneNumber: 'Số điện thoại',
        department: 'Bộ phận',
        position: 'Chức vụ',
        dateOfBirth: 'Ngày sinh',
        gender: 'Giới tính',
        male: 'Nam',
        female: 'Nữ',
        email: 'Email',
        address: 'Địa chỉ',
        emergencyContact: 'Liên hệ khẩn cấp',
        disabledFieldHint: 'Trường này không thể chỉnh sửa',
        unnamed: 'Người dùng chưa đặt tên',
        recentActivity: 'Hoạt động gần đây',
        noRecentActivity: 'Không có hoạt động nào',
        joined: 'Ngày tham gia',
        equipmentAssigned: 'Thiết bị được giao',
        items: 'mục',
        borrowedEquipment: 'Mượn thiết bị',
        returnedEquipment: 'Trả thiết bị',
        maintenanceRequest: 'Yêu cầu bảo trì',
        active: 'đang hoạt động',
        completed: 'hoàn thành',
        pending: 'chờ xử lý',
    },

    // ========================================================================
    // Shifts / Ca làm
    // ========================================================================
    shifts: {
        title: 'Ca làm',
        shift: 'Ca',
        selectShift: 'Chọn ca',
        shiftS1: 'Ca 1',
        shiftS2: 'Ca 2',
        checkin: 'Ghi nhận ca',
        checkedIn: 'Đã ghi nhận',
        notCheckedIn: 'Chưa ghi nhận',
        checkinSuccess: 'Đã ghi nhận ca thành công',
        checkinDuplicate: 'Ca này đã được ghi nhận trước đó',
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
    // Requests / Phiếu yêu cầu (Phase 5)
    // ========================================================================
    requests: {
        title: 'Phiếu yêu cầu',
        subtitle: 'Quản lý phiếu báo sự cố, mượn thiết bị và xin vật tư',
        myRequests: 'Phiếu của tôi',
        allRequests: 'Tất cả phiếu',
        totalRequests: 'Tổng phiếu',
        createRequest: 'Tạo phiếu',
        newRequest: 'Phiếu mới',
        requestDetails: 'Chi tiết phiếu',
        requestCode: 'Mã phiếu',
        requestId: 'Mã phiếu',
        requestDate: 'Ngày tạo phiếu',
        requestType: 'Loại phiếu',
        requestStatus: 'Trạng thái',
        requestItems: 'Nội dung phiếu',
        equipment: 'Thiết bị',
        priority: 'Độ ưu tiên',
        notes: 'Ghi chú',
        requester: 'Người tạo phiếu',
        reviewer: 'Người duyệt',
        reviewNote: 'Ghi chú duyệt',
        reviewedAt: 'Duyệt lúc',
        reviewedBy: 'Người duyệt',

        // Status
        statuses: {
            all: 'Tất cả trạng thái',
            DRAFT: 'Nháp',
            SUBMITTED: 'Chờ duyệt',
            APPROVED: 'Đã duyệt',
            REJECTED: 'Từ chối',
            CANCELLED: 'Đã hủy',
        },
        pending: 'Chờ duyệt',
        submitted: 'Chờ duyệt',
        approved: 'Đã duyệt',
        rejected: 'Từ chối',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy',
        draft: 'Nháp',

        // Types (Phase 5)
        types: {
            all: 'Tất cả loại',
            JUSTIFICATION: 'Báo sự cố thiết bị',
            ASSET_LOAN: 'Mượn thiết bị',
            CONSUMABLE_REQUEST: 'Xin vật tư',
            // Legacy
            borrow: 'Mượn thiết bị',
            return: 'Trả thiết bị',
            maintenance: 'Yêu cầu bảo trì',
        },

        // Severity (Justification)
        severity: 'Mức độ',
        severities: {
            low: 'Nhẹ - Vẫn dùng được',
            medium: 'Bình thường - Ảnh hưởng công việc',
            high: 'Nghiêm trọng - Cần xử lý gấp',
            critical: 'Khẩn - Không thể sử dụng',
        },

        // Justification fields
        incidentAt: 'Thời điểm xảy ra',
        suspectedCause: 'Nguyên nhân nghi ngờ',
        
        // Asset Loan fields
        fromShift: 'Từ ca',
        toShift: 'Đến ca',
        loanReason: 'Mục đích',

        // Consumable fields
        itemName: 'Tên vật tư',
        quantity: 'Số lượng',
        unit: 'Đơn vị',
        units: {
            box: 'Hộp',
            pack: 'Gói',
            piece: 'Cái',
            bottle: 'Chai',
            set: 'Bộ',
        },

        // Priority
        priorities: {
            low: 'Thấp',
            normal: 'Bình thường',
            high: 'Cao',
        },

        // Actions
        view: 'Xem',
        cancel: 'Hủy phiếu',
        cancelRequest: 'Hủy phiếu',
        approve: 'Duyệt',
        reject: 'Từ chối',
        submitRequest: 'Gửi phiếu',
        addItem: 'Thêm dòng',
        removeItem: 'Xóa dòng',

        // Messages
        submitSuccess: 'Đã gửi phiếu',
        cancelSuccess: 'Đã hủy phiếu',
        cannotEditFinal: 'Phiếu đã được xử lý, không thể chỉnh sửa',

        // Review
        reviewQueue: 'Danh sách chờ duyệt',
        viewQueue: 'Xem danh sách chờ duyệt',
        reviewRequest: 'Xử lý phiếu',
        reviewQueueSubtitle: 'Duyệt hoặc từ chối các phiếu đang chờ xử lý',
        approveConfirm: 'Xác nhận duyệt phiếu này?',
        rejectConfirm: 'Xác nhận từ chối phiếu này?',
        approveSuccess: 'Đã duyệt phiếu',
        rejectSuccess: 'Đã từ chối phiếu',
        pendingCount: '{count} chờ duyệt',
        noPendingRequests: 'Không có phiếu chờ duyệt',
        allProcessed: 'Tất cả phiếu đã được xử lý',
        totalMatchingRequests: 'Tổng số phiếu phù hợp',
        highPriority: 'Ưu tiên cao',
        allCaughtUp: 'Không còn phiếu tồn',
        noPendingRequestsHint: 'Hiện không có phiếu nào cần duyệt',
        loadingRequests: 'Đang tải danh sách phiếu...',
        noRequestsFound: 'Không tìm thấy phiếu',
        noRequestsYet: 'Chưa có phiếu nào',
        noItemsAddedYet: 'Chưa có mục nào. Nhấn "Thêm dòng" để bắt đầu.',
        cancelConfirm: 'Bạn có chắc muốn hủy phiếu này không?',
        approveRequestTitle: 'Duyệt phiếu',
        rejectRequestTitle: 'Từ chối phiếu',
        approveRequestConfirm: 'Bạn có chắc muốn duyệt phiếu này không?',
        rejectRequestConfirm: 'Bạn có chắc muốn từ chối phiếu này không?',
        noteLabel: 'Ghi chú',
        approveNotePlaceholder: 'Không bắt buộc: thêm ghi chú cho người yêu cầu...',
        rejectNotePlaceholder: 'Vui lòng nhập lý do từ chối...',
        performedBy: 'bởi {name}',
        shiftLabel: 'Ca',
        severitySuffix: 'mức độ',

        // Empty states
        noRequests: 'Không có phiếu',
        noRequestsHint: 'Bấm "Tạo phiếu" để bắt đầu.',
        searchPlaceholder: 'Tìm theo mã phiếu hoặc người tạo...',
        
        // UI Labels
        requestId: 'Mã phiếu',
        createNewRequest: 'Tạo phiếu mới',
        newRequest: 'Tạo phiếu',
        myRequests: 'Phiếu của tôi',
        myRequestsSubtitle: 'Xem và quản lý các phiếu yêu cầu thiết bị',
        totalRequests: 'Tổng số phiếu',
        pendingReview: 'Chờ duyệt',
        titlePlaceholder: 'Mô tả ngắn gọn về yêu cầu',
        descriptionPlaceholder: 'Cung cấp thông tin chi tiết...',
        submitting: 'Đang gửi...',
        assets: 'Thiết bị',
        consumableItems: 'Vật tư tiêu hao',
        
        // Suspected Causes
        suspectedCauses: {
            unknown: 'Chưa rõ nguyên nhân',
            wear: 'Hao mòn tự nhiên',
            operation: 'Lỗi vận hành',
            electrical: 'Sự cố điện',
            mechanical: 'Hỏng hóc cơ khí',
            software: 'Lỗi phần mềm',
        },
        requestSubmitted: 'Gửi phiếu thành công!',
        addDetails: 'Thêm thông tin chi tiết...',
        cannotCancelFinal: 'Không thể hủy phiếu đã được xử lý',
        notAuthorized: 'Bạn không có quyền thực hiện thao tác này',

        // Form labels
        selectAsset: 'Chọn thiết bị',
        selectShift: 'Chọn ca',
        fromShift: 'Từ ca',
        toShift: 'Đến ca',
        describeIssue: 'Mô tả sự cố...',
        describeReason: 'Mô tả lý do...',
        items: 'Danh sách mục',
        noItems: 'Chưa có mục nào',
        comingSoon: 'Sắp ra mắt',
        requestDetail: 'Chi tiết phiếu',
        requestedBy: 'Người yêu cầu',
        activity: 'Hoạt động',
    },

    // ========================================================================
    // Request Types / Loại phiếu (cho form)
    // ========================================================================
    requestType: {
        justification: 'Báo sự cố thiết bị',
        assetLoan: 'Mượn thiết bị',
        consumableRequest: 'Xin vật tư',
    },

    // ========================================================================
    // Request Status / Trạng thái phiếu (mapping từ enum)
    // ========================================================================
    requestStatus: {
        draft: 'Nháp',
        submitted: 'Chờ duyệt',
        approved: 'Đã duyệt',
        rejected: 'Từ chối',
        cancelled: 'Đã hủy',
    },

    // ========================================================================
    // Justification / Báo sự cố thiết bị
    // ========================================================================
    justification: {
        title: 'Báo sự cố thiết bị',
        selectAsset: 'Chọn thiết bị',
        severity: 'Mức độ',
        incidentDetails: 'Mô tả sự cố',
        addPhoto: 'Thêm ảnh (nếu có)',
    },

    // ========================================================================
    // Severity / Mức độ nghiêm trọng
    // ========================================================================
    severity: {
        low: 'Nhẹ',
        medium: 'Bình thường',
        high: 'Nghiêm trọng',
        urgent: 'Khẩn',
    },

    // ========================================================================
    // Asset Loan / Mượn thiết bị
    // ========================================================================
    assetLoan: {
        title: 'Mượn thiết bị',
        selectAsset: 'Chọn thiết bị cần mượn',
        fromShift: 'Từ ca',
        toShift: 'Đến ca',
        purpose: 'Mục đích',
    },

    // ========================================================================
    // Consumables / Vật tư tiêu hao
    // ========================================================================
    consumables: {
        title: 'Xin vật tư',
        itemName: 'Tên vật tư',
        sku: 'Mã vật tư',
        quantity: 'Số lượng',
        unit: 'Đơn vị',
        unitBox: 'Hộp',
        unitPiece: 'Cái',
        unitPack: 'Gói',
    },

    // ========================================================================
    // Review / Duyệt phiếu
    // ========================================================================
    review: {
        title: 'Duyệt phiếu',
        reviewQueue: 'Danh sách chờ duyệt',
        viewQueue: 'Xem danh sách chờ duyệt',
        reviewRequest: 'Xử lý phiếu',
        approve: 'Duyệt',
        reject: 'Từ chối',
        reviewNote: 'Ghi chú duyệt',
        reviewedBy: 'Người duyệt',
        reviewedAt: 'Duyệt lúc',
        approveSuccess: 'Đã duyệt phiếu',
        rejectSuccess: 'Đã từ chối phiếu',
    },

    // ========================================================================
    // Maintenance / Bảo trì
    // ========================================================================
    maintenance: {
        title: 'Bảo trì & Sửa chữa',
        subtitle: 'Lịch bảo trì, sửa chữa và hồ sơ dịch vụ',
        schedule: 'Lịch bảo trì',
        records: 'Hồ sơ bảo trì',
        totalRecords: 'Tổng hồ sơ',
        upcoming: 'Sắp tới',
        inProgress: 'Đang thực hiện',
        completed: 'Hoàn thành',
        overdue: 'Quá hạn',
        createTicket: 'Tạo phiếu bảo trì',
        // Types
        types: {
            all: 'Tất cả loại',
            scheduled: 'Định kỳ',
            emergency: 'Khẩn cấp',
            preventive: 'Phòng ngừa',
        },
        maintenanceType: 'Hình thức',
        preventive: 'Định kỳ',
        corrective: 'Sửa chữa',
        vendor: 'Đơn vị thực hiện',
        cost: 'Chi phí',
        nextDue: 'Lần tới',
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
    // Off Service / Tạm ngưng sử dụng
    // ========================================================================
    offService: {
        title: 'Tạm ngưng sử dụng',
        lockAsset: 'Tạm ngưng thiết bị',
        unlockAsset: 'Mở lại thiết bị',
        reason: 'Lý do',
        locked: 'Đang tạm ngưng',
        unlocked: 'Đã hoạt động',
    },

    // ========================================================================
    // Inventory / Kho vật tư
    // ========================================================================
    inventory: {
        title: 'Kiểm kê & định giá',
        stock: 'Tồn kho',
        inbound: 'Nhập kho',
        outbound: 'Xuất kho',
        lowStock: 'Sắp hết',
        reorder: 'Đề xuất nhập thêm',
    },

    // ========================================================================
    // Reports / Báo cáo
    // ========================================================================
    reports: {
        title: 'Báo cáo & thống kê',
        overview: 'Tổng hợp',
        assetReport: 'Báo cáo thiết bị',
        assetUsage: 'Tình hình sử dụng thiết bị',
        incidents: 'Sự cố',
        requests: 'Phiếu cấp phát',
        assignmentReport: 'Báo cáo phân công',
        maintenanceReport: 'Tình hình sửa chữa, bảo trì',
        maintenance: 'Bảo trì & Sửa chữa',
        conditionReport: 'Báo cáo tình trạng',
        export: 'Xuất báo cáo',
        exportPdf: 'Xuất PDF',
        exportExcel: 'Xuất Excel',
        comingSoon: 'Sắp ra mắt',
    },

    // ========================================================================
    // Feedback / Phản hồi & Đề xuất
    // ========================================================================
    feedback: {
        title: 'Phản hồi & đề xuất',
        sendFeedback: 'Gửi phản hồi',
        placeholder: 'Nhập nội dung phản hồi hoặc đề xuất...',
        thanks: 'Cảm ơn bạn đã gửi phản hồi',
    },

    // ========================================================================
    // Disposal / Thu hủy
    // ========================================================================
    disposal: {
        title: 'Thu hủy thiết bị',
        subtitle: 'Quản lý thiết bị đủ điều kiện thu hủy (khấu hao ≥ 70%)',
        eligibleForDisposal: 'Đủ điều kiện thu hủy',
        highDepreciation: 'Khấu hao ≥ 90%',
        alreadyRetired: 'Đã thu hủy',
        remainingValue: 'Giá trị còn lại',
        eligibleTab: 'Đủ điều kiện',
        retiredTab: 'Đã thu hủy',
        assetCode: 'Mã thiết bị',
        assetName: 'Tên thiết bị',
        category: 'Danh mục',
        depreciation: 'Khấu hao',
        purchaseCost: 'Giá mua',
        bookValue: 'Giá trị sổ sách',
        reason: 'Lý do thu hủy',
        reasonPlaceholder: 'Nhập lý do thu hủy thiết bị...',
        retiredDate: 'Ngày thu hủy',
        retire: 'Thu hủy',
        retireSuccess: 'Đã thu hủy thiết bị thành công.',
        retireConfirmTitle: 'Xác nhận thu hủy',
        retireConfirmMessage: 'Bạn có chắc muốn thu hủy thiết bị {name} ({code})?',
        confirmRetire: 'Xác nhận thu hủy',
        noEligible: 'Không có thiết bị nào đủ điều kiện thu hủy.',
        noRetired: 'Chưa có thiết bị nào được thu hủy.',
    },

    // ========================================================================
    // Errors / Lỗi
    // ========================================================================
    errors: {
        general: 'Đã xảy ra lỗi. Vui lòng thử lại.',
        network: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối.',
        notFound: 'Không tìm thấy dữ liệu',
        notFoundMessage: 'Trang bạn tìm kiếm không tồn tại.',
        forbidden: 'Bạn không có quyền thực hiện thao tác này',
        serverError: 'Hệ thống đang gặp sự cố, vui lòng thử lại',
        server: 'Hệ thống đang gặp sự cố, vui lòng thử lại',
        validation: 'Vui lòng kiểm tra lại thông tin đã nhập',
        sessionExpired: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        required: 'Vui lòng nhập thông tin bắt buộc',
        goHome: 'Về trang chủ',
        goBack: 'Quay lại',
    },

    // ========================================================================
    // Confirmations / Xác nhận
    // ========================================================================
    confirm: {
        delete: 'Xác nhận xóa',
        deleteMessage: 'Bạn có chắc muốn xóa? Thao tác này không thể hoàn tác.',
        deleteAssetMessage: 'Bạn có chắc muốn xóa thiết bị "{name}"? Thao tác này không thể hoàn tác.',
        unassign: 'Xác nhận thu hồi',
        unassignMessage: 'Bạn có chắc muốn thu hồi thiết bị "{name}" khỏi {assignee}?',
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

    // ========================================================================
    // Admin / Quản trị hệ thống
    // ========================================================================
    admin: {
        title: 'Quản trị Hệ thống',
        subtitle: 'Quản lý người dùng, phân quyền và cài đặt hệ thống',
        
        // Tabs
        users: 'Người dùng',
        rolesPermissions: 'Quyền & Vai trò',
        systemSettings: 'Cài đặt hệ thống',
        auditLog: 'Nhật ký hệ thống',
        
        // User Management
        searchUsers: 'Tìm kiếm người dùng...',
        createUser: 'Tạo tài khoản',
        noUsers: 'Chưa có người dùng nào',
        employeeCode: 'Mã NV',
        userName: 'Họ tên',
        role: 'Vai trò',
        changeRole: 'Đổi quyền',
        currentUser: 'Người dùng hiện tại',
        newRole: 'Vai trò mới',
        selectEmployee: 'Chọn nhân viên',
        selectEmployeePlaceholder: '-- Chọn nhân viên --',
        defaultPassword: 'Mật khẩu mặc định',
        defaultPasswordPlaceholder: 'Nhập mật khẩu mặc định',
        userCreated: 'Tạo tài khoản thành công',
        userDeleted: 'Đã xóa tài khoản',
        roleUpdated: 'Đã cập nhật vai trò',
        deleteConfirm: 'Bạn có chắc muốn xóa tài khoản này?',
        
        // RBAC
        rbacMatrix: 'Ma trận Phân quyền (RBAC)',
        permission: 'Quyền hạn',
        
        // System Settings
        companyProfile: 'Hồ sơ Công ty',
        companyName: 'Tên công ty',
        companyEmail: 'Email',
        companyPhone: 'Điện thoại',
        companyAddress: 'Địa chỉ',
        codeGeneration: 'Quy tắc tạo mã',
        assetCodeFormat: 'Mã thiết bị',
        employeeCodeFormat: 'Mã nhân viên',
        requestCodeFormat: 'Mã phiếu yêu cầu',
        settingsComingSoon: 'Chức năng chỉnh sửa sẽ sớm ra mắt.',
        
        // Audit
        auditComingSoon: 'Nhật ký hệ thống sẽ sớm ra mắt.',
    },

    // ========================================================================
    // QR Scan / Quét QR
    // ========================================================================
    qrScan: {
        title: 'Quét mã QR',
        subtitle: 'Hướng camera vào mã QR thiết bị hoặc nhập thủ công',
        scannerTitle: 'Quét QR thiết bị',
        enterPayload: 'Vui lòng nhập mã QR',
        inputPlaceholder: 'Nhập mã QR (vd: MESOCO|ASSET|v1|uuid)',
        inputHint: 'Quét mã QR trên thiết bị hoặc dán mã vào ô trên',
        expectedFormat: 'Định dạng: MESOCO|ASSET|v1|<uuid>',
        viewfinderHint: 'Hướng camera vào mã QR',
        resolve: 'Tra cứu',
        
        // Camera controls
        useCamera: 'Camera',
        manualInput: 'Thủ công',
        startScanning: 'Bắt đầu quét',
        stopScanning: 'Dừng quét',
        scanning: 'Đang quét...',
        resolving: 'Đang tra cứu...',
        tapToStart: 'Nhấn "Bắt đầu quét" để bắt đầu',
        noCameraAvailable: 'Thiết bị không có camera',
        cameraPermissionDenied: 'Không có quyền truy cập camera. Vui lòng nhập thủ công.',
        
        // Results
        assetFound: 'Đã tìm thấy thiết bị!',
        assetResolved: 'Thiết bị được xác định',
        identified: 'Đã xác định',
        offService: 'Ngừng hoạt động',
        scanAnother: 'Quét mã khác',
        
        // Error messages - matching checklist
        invalidFormat: 'Mã QR không hợp lệ.',
        assetNotFound: 'Không tìm thấy thiết bị.',
        unsupportedVersion: 'Phiên bản QR không được hỗ trợ.',
        resolveFailed: 'Không thể tra cứu mã QR',
        notFound: 'Không tìm thấy',
        
        // Off-service warning
        offServiceWarning: 'Thiết bị này đang ngừng hoạt động. Không sử dụng.',
        offServiceDetail: 'Thiết bị này hiện không khả dụng. Liên hệ kỹ thuật viên để biết thêm thông tin.',
        
        // Check-in blocked reasons
        blockedReason: {
            ASSET_OFF_SERVICE: 'Thiết bị đang ngừng hoạt động',
            ASSET_NOT_ASSIGNED: 'Thiết bị chưa được phân công',
            NO_ACTIVE_SHIFT: 'Không có ca làm việc hiện tại',
            ALREADY_CHECKED_IN: 'Đã ghi nhận hôm nay',
            NOT_ASSIGNEE: 'Bạn không phải người được phân công',
        },
        
        // Instructions
        instructions: 'Hướng dẫn sử dụng',
        viewInstructions: 'Xem hướng dẫn',
        instructionsNotAvailable: 'Không có hướng dẫn cho thiết bị này',
        
        // Actions
        viewAsset: 'Xem thiết bị',
        viewDetails: 'Xem chi tiết',
        assetInfo: 'Thông tin thiết bị',
        checkinFromMyAssets: 'Vui lòng sử dụng trang Thiết bị của tôi để ghi nhận',
        
        // Help
        helpTitle: 'Cách sử dụng',
        helpDesc: 'Quét mã QR trên thiết bị bằng camera điện thoại hoặc nhập mã thủ công.',
        helpStep1: 'Nhấn "Bắt đầu quét" và hướng camera vào mã QR',
        helpStep2: 'Hoặc chuyển sang chế độ Thủ công và dán mã',
        helpStep3: 'Xem thông tin thiết bị và ghi nhận nếu được phân công',
        
        // Legacy keys for backwards compatibility
        tryAgain: 'Thử lại',
        found: 'Đã tìm thấy',
        noResult: 'Không tìm thấy thiết bị',
        noResultMessage: 'Mã QR không hợp lệ hoặc thiết bị không tồn tại trong hệ thống.',
        processing: 'Đang xử lý...',
    },

    // ========================================================================
    // Contracts / Hợp đồng
    // ========================================================================
    contracts: {
        title: 'Quản lý Hợp đồng',
        subtitle: 'Hợp đồng lao động nhân viên',
        create: 'Tạo hợp đồng',
        edit: 'Sửa hợp đồng',
        view: 'Xem hợp đồng',
        delete: 'Xóa hợp đồng',
        noContracts: 'Chưa có hợp đồng',
        noContractsHint: 'Thêm hợp đồng cho nhân viên này',
        noContractsForEmployee: 'Nhân viên này chưa có hợp đồng',
        selectEmployee: 'Chọn nhân viên',
        selectEmployeeFirst: 'Chọn một nhân viên',
        selectEmployeeHint: 'Chọn nhân viên từ danh sách phía trên để xem hợp đồng',
        selectEmployeePlaceholder: '-- Chọn nhân viên --',
        allEmployees: 'Tất cả nhân viên',
        addContract: 'Thêm hợp đồng',
        contractId: 'Mã hợp đồng',
        contractDetails: 'Chi tiết hợp đồng',
        indefinite: 'Không thời hạn',
        department: 'Phòng ban',
        departmentPlaceholder: 'VD: Nha khoa, Hành chính...',
        pdfFile: 'Tệp PDF',
        pdfHint: 'Tải hợp đồng (chỉ PDF, tối đa 10MB)',
        viewPdf: 'Xem PDF',
        pdfNotAvailable: 'Không có tệp PDF',
        startDateRequired: 'Ngày bắt đầu là bắt buộc',
        selectEmployeeFirst: 'Chọn một nhân viên',
        selectEmployeeHint: 'Chọn nhân viên từ danh sách ở trên để xem hợp đồng của họ',
        createSuccess: 'Tạo hợp đồng thành công',
        updateSuccess: 'Cập nhật hợp đồng thành công',
        deleteSuccess: 'Xóa hợp đồng thành công',
        
        // Form fields
        contractType: 'Loại hợp đồng',
        startDate: 'Ngày bắt đầu',
        endDate: 'Ngày kết thúc',
        notes: 'Ghi chú',
        document: 'Tài liệu đính kèm',
        uploadDocument: 'Tải tài liệu lên',
        viewDocument: 'Xem tài liệu',
        downloadDocument: 'Tải xuống',
        noDocument: 'Không có tài liệu',
        
        // Types
        types: {
            probation: 'Thử việc',
            fixed_term: 'Có thời hạn',
            indefinite: 'Không thời hạn',
            seasonal: 'Thời vụ',
            contractor: 'Cộng tác viên',
            fullTime: 'Toàn thời gian',
            partTime: 'Bán thời gian',
            intern: 'Thực tập',
            outsource: 'Thuê ngoài',
            other: 'Khác',
        },
        
        // Statuses
        statuses: {
            active: 'Đang hiệu lực',
            expired: 'Hết hạn',
            terminated: 'Đã chấm dứt',
            pending: 'Chờ duyệt',
        },
        
        // Table headers
        employee: 'Nhân viên',
        type: 'Loại',
        status: 'Trạng thái',
        period: 'Thời hạn',
        actions: 'Thao tác',
        
        // Messages
        created: 'Đã tạo hợp đồng',
        updated: 'Đã cập nhật hợp đồng',
        deleted: 'Đã xóa hợp đồng',
        deleteConfirm: 'Bạn có chắc muốn xóa hợp đồng này?',
        uploadSuccess: 'Đã tải tài liệu lên',
        uploadError: 'Lỗi tải tài liệu',
        invalidFileType: 'Loại tệp không hợp lệ. Chỉ chấp nhận PDF.',
        fileTooLarge: 'Tệp quá lớn. Dung lượng tối đa: 5MB.',
    },

    // ========================================================================
    // Employees / Nhân viên
    // ========================================================================
    employees: {
        title: 'Quản lý Nhân viên',
        subtitle: 'Quản lý hồ sơ nhân viên và hợp đồng',
        addEmployee: 'Thêm nhân viên',
        editEmployee: 'Sửa thông tin nhân viên',
        employeeCode: 'Mã nhân viên',
        fullName: 'Họ và tên',
        position: 'Chức vụ',
        noPosition: 'Chưa có chức vụ',
        dob: 'Ngày sinh',
        gender: 'Giới tính',
        phone: 'Số điện thoại',
        address: 'Địa chỉ',
        userAccount: 'Tài khoản',
        hasUser: 'Có tài khoản',
        noUser: 'Chưa có tài khoản',
        viewContracts: 'Xem hợp đồng',
        codeNotEditable: 'Mã nhân viên không thể thay đổi',
        emailNotEditable: 'Email không thể thay đổi',
        requiredFields: 'Mã nhân viên và họ tên là bắt buộc',
        createSuccess: 'Thêm nhân viên thành công',
        updateSuccess: 'Cập nhật nhân viên thành công',
        deleteSuccess: 'Xóa nhân viên thành công',
        deleteConfirm: 'Bạn có chắc muốn xóa {{name}}?',
        noEmployees: 'Chưa có nhân viên',
        noEmployeesHint: 'Thêm nhân viên đầu tiên để bắt đầu',
        searchPlaceholder: 'Tìm theo mã hoặc tên...',
        selectEmployeeFirst: 'Chọn một nhân viên',
        selectEmployeeHint: 'Nhấn "Xem hợp đồng" trên dòng nhân viên để xem hợp đồng của họ',
        tabs: {
            general: 'Thông tin chung',
            contract: 'Hợp đồng',
        },
        statuses: {
            active: 'Đang làm việc',
            inactive: 'Nghỉ việc',
        },
        genders: {
            male: 'Nam',
            female: 'Nữ',
            other: 'Khác',
        },
    },

    // ========================================================================
    // Topbar / Thanh trên
    // ========================================================================
    topbar: {
        searchPlaceholder: 'Tìm kiếm...',
    },

    // ========================================================================
    // Printable Label / Nhãn in
    // ========================================================================
    printableLabel: {
        title: 'Nhãn thiết bị',
        popupBlocked: 'Vui lòng cho phép cửa sổ bật lên để in nhãn',
        unnamedAsset: 'Thiết bị chưa đặt tên',
        qrAlt: 'Mã QR',
        noQr: 'Không có QR',
        scanInstruction: 'Quét mã QR để xem chi tiết thiết bị',
    },

    // ========================================================================
    // Locations Page / Trang vị trí
    // ========================================================================
    locationsPage: {
        title: 'Vị trí',
        subtitle: 'Quản lý các vị trí vật lý của thiết bị',
        addLocation: 'Thêm vị trí',
        editLocation: 'Sửa vị trí',
        searchPlaceholder: 'Tìm theo tên vị trí...',
        showInactive: 'Hiển thị vị trí ngừng hoạt động',
        noLocations: 'Không tìm thấy vị trí nào',
        locationName: 'Tên vị trí',
        locationNamePlaceholder: 'Ví dụ: Phòng khám tầng 1',
        descriptionPlaceholder: 'Mô tả thêm (không bắt buộc)...',
        address: 'Địa chỉ',
        addressPlaceholder: 'Địa chỉ (không bắt buộc)...',
    },

    // ========================================================================
    // Inventory Page / Trang kho & định giá
    // ========================================================================
    inventoryPage: {
        title: 'Kho & định giá',
        totalAssets: 'Tổng thiết bị',
        assigned: 'Đã phân công',
        totalBookValue: 'Tổng giá trị còn lại',
        warrantyExpiringSoon: '{count} thiết bị sắp hết hạn bảo hành',
        withinDays: 'Trong vòng {count} ngày',
        expiredCount: '{count} thiết bị đã hết hạn',
        showAll: 'Hiện tất cả',
        showExpiring: 'Chỉ hiện sắp hết hạn',
        equipmentInventory: 'Tồn kho thiết bị',
        assetValuationReport: 'Báo cáo định giá thiết bị',
        totalItems: '{count} mục',
        warrantyFilterSuffix: ' (sắp hết hạn bảo hành)',
        inventoryTab: 'Tồn kho',
        valuationTab: 'Định giá',
        exportCsv: 'Xuất CSV',
        exporting: 'Đang xuất...',
        noAssetsFound: 'Không tìm thấy thiết bị',
        adjustFilters: 'Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.',
        code: 'Mã',
        equipment: 'Thiết bị',
        bookValue: 'Giá trị còn lại',
        fullyDepreciated: 'Khấu hao hết',
        detailTitle: 'Chi tiết thiết bị',
        purchaseDate: 'Ngày mua',
        warrantyExpiry: 'Hết hạn bảo hành',
        purchaseCost: 'Giá mua',
        currentBookValue: 'Giá trị còn lại hiện tại',
        printLabel: 'In nhãn',
        exportSuccess: 'Đã tải tệp xuất dữ liệu',
    },

    // ========================================================================
    // My Equipment Page / Trang thiết bị của tôi
    // ========================================================================
    myEquipmentPage: {
        title: 'Thiết bị của tôi',
        subtitle: '{count} mục đang được phân công cho bạn',
        totalAssigned: 'Tổng thiết bị được giao',
        inMaintenance: 'Đang bảo trì',
        requestEquipment: 'Yêu cầu thiết bị',
        searchPlaceholder: 'Tìm theo tên hoặc mã...',
        filterByStatus: 'Lọc theo trạng thái',
        noEquipment: 'Chưa có thiết bị nào được giao',
        noEquipmentHint: 'Hãy bắt đầu bằng cách gửi yêu cầu thiết bị.',
        openRequestForm: 'Đang mở biểu mẫu yêu cầu thiết bị...',
        view: 'Xem',
        return: 'Trả lại',
        viewing: 'Đang xem {name}',
        requestReturn: 'Yêu cầu trả lại {name}',
        columns: {
            equipment: 'Thiết bị',
            category: 'Nhóm',
            assignedDate: 'Ngày giao',
            condition: 'Tình trạng',
            status: 'Trạng thái',
            nextMaintenance: 'Bảo trì tiếp theo',
            actions: 'Thao tác',
        },
        conditions: {
            excellent: 'Rất tốt',
            good: 'Tốt',
            fair: 'Tạm ổn',
        },
        statusFilters: {
            all: 'Tất cả trạng thái',
            active: 'Hoạt động',
            maintenance: 'Đang bảo trì',
            pending: 'Chờ trả lại',
        },
    },

    // ========================================================================
    // My Asset History Page / Lịch sử thiết bị của tôi
    // ========================================================================
    myAssetHistoryPage: {
        title: 'Lịch sử thiết bị của tôi',
        subtitle: 'Dòng thời gian các lần được phân công và ghi nhận thiết bị',
        currentAssignments: 'Đang được phân công',
        totalAssignments: 'Tổng số lần phân công',
        totalCheckIns: 'Tổng số lần ghi nhận',
        checkInsThisMonth: 'Ghi nhận trong tháng này',
        clearFilters: 'Xóa bộ lọc',
        fromDate: 'Từ ngày',
        toDate: 'Đến ngày',
        noHistoryFound: 'Không tìm thấy lịch sử',
        adjustFilters: 'Hãy thử điều chỉnh bộ lọc.',
        historyWillAppear: 'Lịch sử thiết bị của bạn sẽ hiển thị ở đây.',
        allEvents: 'Tất cả sự kiện',
        performedBy: 'bởi {name}',
        eventTypes: {
            assigned: 'Được giao',
            unassigned: 'Thu hồi',
            checkin: 'Nhận thiết bị',
            checkout: 'Trả thiết bị',
        },
    },

    // ========================================================================
    // Placeholder Pages / Trang chờ triển khai
    // ========================================================================
    placeholderPages: {
        equipmentTitle: 'Quản lý thiết bị',
        equipmentDescription: 'Quản lý toàn bộ thiết bị và máy móc nha khoa.',
        usersTitle: 'Quản lý người dùng',
        usersDescription: 'Quản lý người dùng và quyền truy cập hệ thống.',
        settingsTitle: 'Cài đặt hệ thống',
        settingsDescription: 'Cấu hình các tùy chọn của ứng dụng.',
        comingSoon: 'Sẽ ra mắt trong giai đoạn 1',
    },

    // ========================================================================
    // Not Found / Không tìm thấy
    // ========================================================================
    notFound: {
        title: 'Không tìm thấy trang',
        message: 'Trang bạn đang tìm không tồn tại hoặc đã được di chuyển.',
        backToDashboard: 'Quay lại tổng quan',
    },

    // ========================================================================
    // Validation Messages / Thông báo xác thực
    // ========================================================================
    validation: {
        required: 'Trường này là bắt buộc',
        email: 'Vui lòng nhập email hợp lệ',
        phone: 'Vui lòng nhập số điện thoại hợp lệ',
        date: 'Vui lòng nhập ngày hợp lệ',
        minLength: 'Phải có ít nhất {min} ký tự',
        maxLength: 'Không được vượt quá {max} ký tự',
    },
};
