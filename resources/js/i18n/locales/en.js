/**
 * English Translations
 * Mesoco Dental Asset Management
 */
export default {
    // ========================================================================
    // Common
    // ========================================================================
    common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        add: 'Add',
        remove: 'Remove',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        clear: 'Clear',
        reset: 'Reset',
        submit: 'Submit',
        confirm: 'Confirm',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        loading: 'Loading...',
        noData: 'No data',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Info',
        yes: 'Yes',
        no: 'No',
        all: 'All',
        none: 'None',
        actions: 'Actions',
        status: 'Status',
        type: 'Type',
        name: 'Name',
        description: 'Description',
        note: 'Note',
        notes: 'Notes',
        date: 'Date',
        time: 'Time',
        from: 'From',
        to: 'To',
        createdAt: 'Created at',
        updatedAt: 'Updated at',
        details: 'Details',
        view: 'View',
        copy: 'Copy',
        copied: 'Copied',
        download: 'Download',
        upload: 'Upload',
        refresh: 'Refresh',
        retry: 'Retry',
        optional: 'Optional',
        required: 'Required',
        items: 'items',
        assign: 'Assign',
        unassign: 'Unassign',
        regenerate: 'Regenerate',
    },

    // ========================================================================
    // Navigation
    // ========================================================================
    nav: {
        dashboard: 'Dashboard',
        profile: 'Profile',
        employees: 'Employees',
        assets: 'Assets',
        equipmentCatalog: 'Equipment Catalog',
        myEquipment: 'My Equipment',
        myAssets: 'My Equipment',
        equipment: 'Equipment',
        shifts: 'Shifts',
        checkin: 'Shift Check-in',
        requests: 'Requests',
        reviewRequests: 'Review Requests',
        inventory: 'Inventory',
        inventoryValuation: 'Inventory & Valuation',
        maintenance: 'Maintenance',
        offService: 'Off Service',
        feedback: 'Feedback',
        reports: 'Reports',
        settings: 'Settings',
        admin: 'Admin',
        users: 'Users',
        locations: 'Locations',
        myAssetHistory: 'My Asset History',
        equipmentLookup: 'Equipment Lookup',
        logout: 'Logout',
        collapse: 'Collapse',
        expand: 'Expand',
    },

    // ========================================================================
    // Auth
    // ========================================================================
    auth: {
        login: 'Login',
        logout: 'Logout',
        register: 'Register',
        forgotPassword: 'Forgot Password',
        resetPassword: 'Reset Password',
        changePassword: 'Change Password',
        employeeCode: 'Employee Code',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        rememberMe: 'Remember me',
        loginSuccess: 'Login successful',
        logoutSuccess: 'Logged out successfully',
        invalidCredentials: 'Invalid credentials',
        sessionExpired: 'Session expired',
        unauthorized: 'You are not authorized to access this resource',
        verificationCode: 'Verification Code',
        sendCode: 'Send Code',
        resendCode: 'Resend Code',
        codeExpired: 'Code expired',
        codeSent: 'Verification code sent to your email',
        passwordChanged: 'Password changed successfully',
        mustChangePassword: 'You must change your password to continue',
        welcomeBack: 'Welcome back',
        signInToContinue: 'Sign in to continue',
        // Login page
        employeeId: 'Employee ID',
        enterEmployeeId: 'Enter your employee ID',
        enterPassword: 'Enter your password',
        signingIn: 'Signing in...',
        continue: 'Continue',
        loginFailed: 'Login failed. Please check your credentials.',
        // Forgot password page
        forgotPasswordDesc: "Enter your email address and we'll send you a verification code to reset your password.",
        emailAddress: 'Email Address',
        enterEmail: 'Enter your email',
        sending: 'Sending...',
        sendVerificationCode: 'Send Verification Code',
        backToLogin: 'Back to Login',
        backToEmail: 'Back to Email',
        resetPasswordDesc: 'Enter the 6-digit verification code sent to your email and your new password.',
        enterVerificationCode: 'Enter verification code',
        resendCodeIn: 'Resend code in {seconds}s',
        resendVerificationCode: 'Resend verification code',
        enterNewPassword: 'Enter new password',
        confirmNewPassword: 'Confirm new password',
        passwordRequirements: 'Must be at least 8 characters with uppercase, lowercase, number, and symbol',
        resetting: 'Resetting...',
        resetPasswordBtn: 'Reset Password',
        verificationCodeResent: 'Verification code resent successfully.',
        failedToSendCode: 'Failed to send verification code. Please try again.',
        failedToResetPassword: 'Failed to reset password. Please try again.',
        failedToResendCode: 'Failed to resend code. Please try again.',
    },

    // ========================================================================
    // Roles
    // ========================================================================
    roles: {
        staff: 'Staff',
        doctor: 'Doctor',
        nurse: 'Nurse',
        technician: 'Technician',
        receptionist: 'Receptionist',
        manager: 'Manager',
        admin: 'Admin',
        owner: 'Owner',
        hr: 'HR',
    },

    // ========================================================================
    // Dashboard
    // ========================================================================
    dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome back, {name}!',
        welcomeSubtitle: "Here's what's happening with your equipment today.",
        welcomeSubtitleAdmin: 'Overview of dental equipment management system.',
        welcomeSubtitleUser: 'View your assigned equipment and manage requests.',
        welcomeSubtitleTechnician: 'Track maintenance schedules and manage equipment.',
        
        // Admin/HR Cards
        totalEquipment: 'Total Equipment',
        totalAssets: 'Total Assets',
        pendingApprovals: 'Pending Approvals',
        activeRequests: 'Active Requests',
        maintenanceDue: 'Maintenance Due',
        
        // Technician Cards
        maintenanceInProgress: 'In Progress',
        scheduledMaintenance: 'Scheduled Maintenance',
        scheduled: '{count} scheduled',
        upcomingTasks: 'Upcoming tasks',
        noScheduled: 'No scheduled tasks',
        
        // Doctor/Staff Cards
        myEquipmentCount: 'My Equipment',
        myActiveRequests: 'My Active Requests',
        alerts: 'Alerts',
        lockedCount: '{count} locked',
        pendingCount: '{count} pending',
        allAvailable: 'All available',
        equipmentLocked: 'Equipment locked',
        noAlerts: 'No alerts',
        
        // Card Subtitles
        activeCount: '{count} active',
        needsReview: 'Needs review',
        allClear: 'All clear',
        onSchedule: 'On schedule',
        
        // Legacy keys (keep for backward compatibility)
        assignedAssets: 'Assigned',
        availableAssets: 'Available',
        maintenanceAssets: 'Under Maintenance',
        recentActivity: 'Recent Activity',
        recentEquipment: 'Recent Equipment',
        myRecentEquipment: 'My Recent Equipment',
        
        // Quick Actions
        quickActions: 'Quick Actions',
        addEquipment: 'Add Equipment',
        newRequest: 'New Request',
        scanQrCode: 'Scan QR Code',
        viewReports: 'View Reports',
        myEquipment: 'My Equipment',
        myRequests: 'My Requests',
        reviewRequests: 'Review Requests',
        maintenance: 'Maintenance',
        inventory: 'Inventory',
        
        // Table
        viewAll: 'View All',
        loading: 'Loading...',
        fetchError: 'Failed to load data. Please try again.',
        noEquipmentFound: 'No Equipment Found',
        noEquipmentHint: 'Start by adding your first piece of equipment.',
        equipmentName: 'Equipment Name',
        code: 'Code',
        assignedTo: 'Assigned To',
        lastMaintenance: 'Last Maintenance',
        lockStatus: 'Lock Status',
        locked: 'Locked',
        available: 'Available',
        createRequest: 'Create Request',
        
        // Legacy keys
        myAssignedAssets: 'My Assigned Assets',
        pendingRequests: 'Pending Requests',
        pendingApproval: '{count} pending approval',
        overdue: '{count} overdue',
        thisMonth: '+{count} this month',
    },

    // ========================================================================
    // Assets
    // ========================================================================
    assets: {
        title: 'Assets',
        subtitle: 'Manage master data and assignments',
        myAssets: 'My Equipment',
        myAssetsSubtitle: 'View your assigned equipment and lookup QR codes',
        allAssets: 'All Equipment',
        createAsset: 'Create New Equipment',
        editAsset: 'Edit Equipment',
        deleteAsset: 'Delete Equipment',
        assetDetails: 'Equipment Details',
        assetCode: 'Equipment Code',
        assetName: 'Equipment Name',
        assetType: 'Equipment Type',
        assetStatus: 'Status',
        serialNumber: 'Serial Number',
        model: 'Model',
        category: 'Category',
        location: 'Location',
        movable: 'Movable',
        fixed: 'Fixed',
        
        // Types
        types: {
            all: 'All Types',
            tray: 'Tray',
            machine: 'Machine',
            tool: 'Tool',
            equipment: 'Equipment',
            other: 'Other',
        },
        
        // Statuses
        statuses: {
            all: 'All Status',
            active: 'Active',
            off_service: 'Off Service',
            maintenance: 'Under Maintenance',
            retired: 'Retired',
        },
        
        // Assignment
        assignment: 'Assignment',
        assigned: 'Assigned',
        unassigned: 'Unassigned',
        assignTo: 'Assign to',
        assignAsset: 'Assign Equipment',
        unassignAsset: 'Unassign Equipment',
        currentAssignee: 'Current Assignee',
        assignedTo: 'Assigned To',
        assignedSince: 'Assigned since',
        assignmentHistory: 'Assignment History',
        noAssignment: 'Currently unassigned',
        notAssigned: 'No equipment assigned',
        selectEmployee: 'Select Employee',
        assignSuccess: 'Equipment assigned successfully',
        unassignSuccess: 'Equipment unassigned successfully',
        
        // Condition
        condition: 'Condition',
        
        // QR
        qrIdentity: 'QR Identity',
        qrCode: 'QR Code',
        qrPayload: 'QR Payload',
        scanQr: 'Scan QR',
        regenerateQr: 'Regenerate QR',
        regenerateQrConfirm: 'The old QR code will still work (for backward compatibility). Are you sure you want to generate a new QR code?',
        qrRegenerated: 'QR code regenerated successfully',
        copyPayload: 'Copy Payload',
        noQrCode: 'No QR code generated',
        viewAsset: 'View Equipment',
        
        // QR Resolve
        qrLookup: 'QR Code Lookup',
        qrLookupSubtitle: 'Enter or scan a QR payload to find equipment details',
        enterQrPayload: 'Enter QR payload (e.g., MESO-xxxx-xxxx-xxxx)',
        resolve: 'Resolve',
        assetFound: 'Equipment found!',
        assetNotFound: 'Equipment not found or has been deleted',
        qrEnterHint: 'Enter a QR payload to see equipment details',
        qrHelpTitle: 'How to use QR Lookup',
        qrHelpDesc: 'Scan the QR code on equipment using your phone camera or any QR scanner app, then paste the payload (e.g., MESO-xxxx-xxxx-xxxx) in the input field above.',
        
        // Table columns
        columns: {
            assetCode: 'Code',
            name: 'Name',
            type: 'Type',
            status: 'Status',
            assignee: 'Assignee',
            assignment: 'Assignment',
            qr: 'QR',
            assignedAt: 'Assigned At',
            actions: 'Actions',
        },
        
        // My Assets
        myAssigned: 'My Assigned Equipment',
        myEquipmentTitle: 'My Equipment',
        noAssignedYet: "You don't have any assigned equipment yet",
        available: 'Available',
        
        // CRUD
        createSuccess: 'Equipment created successfully',
        updateSuccess: 'Equipment updated successfully',
        deleteSuccess: 'Equipment deleted successfully',
        deleteConfirm: 'Are you sure you want to delete "{name}"? This action cannot be undone.',
        
        // Filters
        searchPlaceholder: 'Search by code or name...',
        filterByType: 'Filter by type',
        filterByStatus: 'Filter by status',
        filterByAssignment: 'Filter by assignment',
        
        // Empty states
        noAssets: 'No equipment found',
        noAssignedAssets: 'You don\'t have any assigned equipment yet',
        
        // Form
        assetCodeHint: 'Leave blank for auto-generate',
        enterAssetName: 'Enter equipment name',
        optionalNotes: 'Optional notes',
        chooseEmployee: 'Choose an employee...',
        
        // Items count
        itemsCount: '{count} items',

        // Check-in / Check-out (Phase 4)
        checkIn: 'Check In',
        checkOut: 'Check Out',
        checkinStatus: 'Check-in Status',
        checkedIn: 'Checked In',
        notCheckedIn: 'Not Checked In',
        checkinSuccess: 'Checked in successfully',
        checkoutSuccess: 'Checked out successfully',
        checkedInAt: 'Checked in at',
        notCheckedInYet: 'Not checked in yet',
        currentShift: 'Current Shift',
        noActiveShift: 'No active shift',
        viewDetails: 'View Details',

        // Modal Tabs
        statusTab: 'Status',
        instructionsTab: 'Instructions',
        openInstructions: 'Open Instructions',
        noInstructions: 'No instructions available for this equipment',
        instructionsDesc: 'This equipment has attached instructions. Click the button below to view them.',
    },

    // ========================================================================
    // Asset Condition
    // ========================================================================
    assetCondition: {
        ok: 'Working Well',
        needsCheck: 'Needs Check',
        needsMaintenance: 'Needs Maintenance',
        broken: 'Broken',
        offService: 'Off Service',
    },

    // ========================================================================
    // Users
    // ========================================================================
    users: {
        title: 'User Management',
        allUsers: 'All Users',
        createUser: 'Create User',
        editUser: 'Edit User',
        deleteUser: 'Delete User',
        userDetails: 'User Details',
        fullName: 'Full Name',
        employeeCode: 'Employee Code',
        email: 'Email',
        role: 'Role',
        status: 'Status',
        
        // Roles
        roles: {
            admin: 'Administrator',
            hr: 'HR',
            doctor: 'Doctor',
            technician: 'Technician',
            staff: 'Staff',
        },
        
        // Statuses
        statuses: {
            active: 'Active',
            inactive: 'Inactive',
        },
    },

    // ========================================================================
    // Profile
    // ========================================================================
    profile: {
        title: 'My Profile',
        personalInfo: 'Personal Information',
        security: 'Security',
        preferences: 'Preferences',
        language: 'Language',
        changeAvatar: 'Change Avatar',
        updateProfile: 'Update Profile',
        updateSuccess: 'Profile updated successfully',
        employeeId: 'Employee ID',
        fullName: 'Full Name',
        phone: 'Phone',
        department: 'Department',
        position: 'Position',
        email: 'Email',
        address: 'Address',
        emergencyContact: 'Emergency Contact',
        disabledFieldHint: 'This field cannot be edited',
        recentActivity: 'Recent Activity',
        noRecentActivity: 'No recent activity',
        joined: 'Joined',
        equipmentAssigned: 'Equipment Assigned',
        items: 'items',
        borrowedEquipment: 'Borrowed equipment',
        returnedEquipment: 'Returned equipment',
        maintenanceRequest: 'Maintenance request',
        active: 'active',
        completed: 'completed',
        pending: 'pending',
    },

    // ========================================================================
    // Shifts
    // ========================================================================
    shifts: {
        title: 'Shifts',
        shift: 'Shift',
        selectShift: 'Select shift',
        shiftS1: 'Shift 1',
        shiftS2: 'Shift 2',
        checkin: 'Shift Check-in',
        checkedIn: 'Checked In',
        notCheckedIn: 'Not Checked In',
        checkinSuccess: 'Shift checked in successfully',
        checkinDuplicate: 'This shift was already checked in',
    },

    // ========================================================================
    // Settings
    // ========================================================================
    settings: {
        title: 'Settings',
        general: 'General',
        appearance: 'Appearance',
        language: 'Language',
        notifications: 'Notifications',
        selectLanguage: 'Select Language',
        theme: 'Theme',
        lightMode: 'Light',
        darkMode: 'Dark',
        systemDefault: 'System Default',
    },

    // ========================================================================
    // Requests (Phase 5)
    // ========================================================================
    requests: {
        title: 'Requests',
        subtitle: 'Manage equipment issue reports, loans, and consumable requests',
        myRequests: 'My Requests',
        allRequests: 'All Requests',
        totalRequests: 'Total Requests',
        createRequest: 'Create Request',
        newRequest: 'New Request',
        requestDetails: 'Request Details',
        requestCode: 'Request Code',
        requestId: 'Request ID',
        requestDate: 'Request Date',
        requestType: 'Request Type',
        requestStatus: 'Status',
        requestItems: 'Request Items',
        equipment: 'Equipment',
        priority: 'Priority',
        notes: 'Notes',
        requester: 'Requester',
        reviewer: 'Reviewer',
        reviewNote: 'Review Note',
        reviewedAt: 'Reviewed At',
        reviewedBy: 'Reviewed By',

        // Status
        statuses: {
            all: 'All Statuses',
            DRAFT: 'Draft',
            SUBMITTED: 'Pending',
            APPROVED: 'Approved',
            REJECTED: 'Rejected',
            CANCELLED: 'Cancelled',
        },
        pending: 'Pending',
        submitted: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        completed: 'Completed',
        cancelled: 'Cancelled',
        draft: 'Draft',

        // Types (Phase 5)
        types: {
            all: 'All Types',
            JUSTIFICATION: 'Equipment Issue Report',
            ASSET_LOAN: 'Equipment Loan',
            CONSUMABLE_REQUEST: 'Consumable Request',
            // Legacy
            borrow: 'Borrow Equipment',
            return: 'Return Equipment',
            maintenance: 'Request Maintenance',
        },

        // Severity (Justification)
        severity: 'Severity',
        severities: {
            low: 'Low - Still usable',
            medium: 'Medium - Affects work',
            high: 'High - Needs urgent fix',
            critical: 'Critical - Cannot use',
        },

        // Justification fields
        incidentAt: 'Incident Time',
        suspectedCause: 'Suspected Cause',
        
        // Asset Loan fields
        fromShift: 'From Shift',
        toShift: 'To Shift',
        loanReason: 'Purpose',

        // Consumable fields
        itemName: 'Item Name',
        quantity: 'Quantity',
        unit: 'Unit',
        units: {
            box: 'Box',
            pack: 'Pack',
            piece: 'Piece',
            bottle: 'Bottle',
            set: 'Set',
        },

        // Priority
        priorities: {
            low: 'Low',
            normal: 'Normal',
            high: 'High',
        },

        // Actions
        view: 'View',
        cancel: 'Cancel Request',
        cancelRequest: 'Cancel Request',
        approve: 'Approve',
        reject: 'Reject',
        submitRequest: 'Submit Request',
        addItem: 'Add Item',
        removeItem: 'Remove Item',

        // Messages
        submitSuccess: 'Request submitted',
        cancelSuccess: 'Request cancelled',
        cannotEditFinal: 'Request has been processed and cannot be edited',

        // Review
        reviewQueue: 'Review Queue',
        viewQueue: 'View Review Queue',
        reviewRequest: 'Review Request',
        approveConfirm: 'Confirm approval of this request?',
        rejectConfirm: 'Confirm rejection of this request?',
        approveSuccess: 'Request approved successfully',
        rejectSuccess: 'Request rejected successfully',
        pendingCount: '{count} pending',
        noPendingRequests: 'No pending requests',
        allProcessed: 'All requests have been processed',

        // Empty states
        noRequests: 'No requests',
        noRequestsHint: 'Get started by creating a new request.',
        searchPlaceholder: 'Search by request code or requester...',
        requestSubmitted: 'Request submitted successfully!',
        addDetails: 'Add any additional details...',
        cannotCancelFinal: 'Cannot cancel a finalized request',
        notAuthorized: 'You are not authorized to perform this action',

        // Form labels
        selectAsset: 'Select Equipment',
        selectShift: 'Select Shift',
        describeIssue: 'Describe the issue...',
        describeReason: 'Describe the reason...',
        items: 'Items',
        noItems: 'No items added',
        comingSoon: 'Coming Soon',
    },

    // ========================================================================
    // Request Types (for forms)
    // ========================================================================
    requestType: {
        justification: 'Equipment Issue Report',
        assetLoan: 'Equipment Loan',
        consumableRequest: 'Consumable Request',
    },

    // ========================================================================
    // Request Status (enum mapping)
    // ========================================================================
    requestStatus: {
        draft: 'Draft',
        submitted: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        cancelled: 'Cancelled',
    },

    // ========================================================================
    // Justification / Equipment Issue Report
    // ========================================================================
    justification: {
        title: 'Equipment Issue Report',
        selectAsset: 'Select equipment',
        severity: 'Severity',
        incidentDetails: 'Incident details',
        addPhoto: 'Add photo (optional)',
    },

    // ========================================================================
    // Severity
    // ========================================================================
    severity: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        urgent: 'Urgent',
    },

    // ========================================================================
    // Asset Loan
    // ========================================================================
    assetLoan: {
        title: 'Equipment Loan',
        selectAsset: 'Select equipment to loan',
        fromShift: 'From shift',
        toShift: 'To shift',
        purpose: 'Purpose',
    },

    // ========================================================================
    // Consumables
    // ========================================================================
    consumables: {
        title: 'Consumable Request',
        itemName: 'Item name',
        sku: 'SKU',
        quantity: 'Quantity',
        unit: 'Unit',
        unitBox: 'Box',
        unitPiece: 'Piece',
        unitPack: 'Pack',
    },

    // ========================================================================
    // Review
    // ========================================================================
    review: {
        title: 'Review Requests',
        reviewQueue: 'Review Queue',
        viewQueue: 'View Review Queue',
        reviewRequest: 'Review Request',
        approve: 'Approve',
        reject: 'Reject',
        reviewNote: 'Review Note',
        reviewedBy: 'Reviewed By',
        reviewedAt: 'Reviewed At',
        approveSuccess: 'Request approved',
        rejectSuccess: 'Request rejected',
    },

    // ========================================================================
    // Maintenance
    // ========================================================================
    maintenance: {
        title: 'Maintenance',
        subtitle: 'Maintenance schedules and service records',
        schedule: 'Maintenance Schedule',
        records: 'Maintenance Records',
        totalRecords: 'Total Records',
        upcoming: 'Upcoming',
        inProgress: 'In Progress',
        completed: 'Completed',
        overdue: 'Overdue',
        // Types
        types: {
            all: 'All Types',
            scheduled: 'Scheduled',
            emergency: 'Emergency',
            preventive: 'Preventive',
        },
        // Fields
        maintenanceId: 'Maintenance ID',
        equipmentCode: 'Equipment Code',
        scheduledDate: 'Scheduled Date',
        assignedTo: 'Assigned To',
        description: 'Description',
        // Views
        listView: 'List View',
        calendarView: 'Calendar View',
        // Actions
        createSchedule: 'Create Schedule',
        markComplete: 'Mark Complete',
        reschedule: 'Reschedule',
        // Messages
        noRecords: 'No maintenance records',
        noRecordsHint: 'Maintenance schedules will appear here.',
        searchPlaceholder: 'Search by equipment or maintenance ID...',
        history: 'Maintenance History',
        comingSoon: 'Coming Soon',
        createTicket: 'Create Maintenance Ticket',
        maintenanceType: 'Type',
        preventive: 'Preventive',
        corrective: 'Corrective',
        vendor: 'Vendor',
        cost: 'Cost',
        nextDue: 'Next Due',
    },

    // ========================================================================
    // Off Service
    // ========================================================================
    offService: {
        title: 'Off Service',
        lockAsset: 'Lock Asset',
        unlockAsset: 'Unlock Asset',
        reason: 'Reason',
        locked: 'Locked',
        unlocked: 'Unlocked',
    },

    // ========================================================================
    // Inventory
    // ========================================================================
    inventory: {
        title: 'Inventory',
        stock: 'Stock',
        inbound: 'Inbound',
        outbound: 'Outbound',
        lowStock: 'Low Stock',
        reorder: 'Reorder Suggestion',
    },

    // ========================================================================
    // Reports
    // ========================================================================
    reports: {
        title: 'Reports',
        overview: 'Overview',
        assetReport: 'Asset Report',
        assetUsage: 'Asset Usage',
        incidents: 'Incidents',
        requests: 'Requests',
        assignmentReport: 'Assignment Report',
        maintenanceReport: 'Maintenance Report',
        maintenance: 'Maintenance',
        export: 'Export',
        exportPdf: 'Export PDF',
        exportExcel: 'Export Excel',
        comingSoon: 'Coming Soon',
    },

    // ========================================================================
    // Feedback
    // ========================================================================
    feedback: {
        title: 'Feedback',
        sendFeedback: 'Send Feedback',
        placeholder: 'Enter your feedback...',
        thanks: 'Thank you for your feedback',
    },

    // ========================================================================
    // Errors
    // ========================================================================
    errors: {
        general: 'An error occurred. Please try again.',
        network: 'Network error. Please check your connection.',
        notFound: 'Not Found',
        notFoundMessage: 'The page you are looking for does not exist.',
        forbidden: 'You do not have permission to perform this action',
        serverError: 'Server error. Please try again later.',
        server: 'Server error. Please try again later.',
        validation: 'Please check your input',
        sessionExpired: 'Session expired. Please login again.',
        required: 'Please fill in required fields',
        goHome: 'Go Home',
        goBack: 'Go Back',
    },

    // ========================================================================
    // Confirmations
    // ========================================================================
    confirm: {
        delete: 'Confirm Delete',
        deleteMessage: 'Are you sure you want to delete? This action cannot be undone.',
        deleteAssetMessage: 'Are you sure you want to delete "{name}"? This action cannot be undone.',
        unassign: 'Confirm Unassign',
        unassignMessage: 'Are you sure you want to unassign "{name}" from {assignee}?',
        regenerateQr: 'Confirm Regenerate QR',
        logout: 'Confirm Logout',
        logoutMessage: 'Are you sure you want to logout?',
    },

    // ========================================================================
    // Time
    // ========================================================================
    time: {
        today: 'Today',
        yesterday: 'Yesterday',
        tomorrow: 'Tomorrow',
        thisWeek: 'This week',
        lastWeek: 'Last week',
        thisMonth: 'This month',
        lastMonth: 'Last month',
        daysAgo: '{count} days ago',
        hoursAgo: '{count} hours ago',
        minutesAgo: '{count} minutes ago',
        justNow: 'Just now',
        current: 'Current',
    },

    // ========================================================================
    // Pagination
    // ========================================================================
    pagination: {
        showing: 'Showing {from} - {to} of {total}',
        page: 'Page {page} of {total}',
        itemsPerPage: 'Items per page',
        goToPage: 'Go to page',
        first: 'First',
        last: 'Last',
    },

    // ========================================================================
    // Admin / System Administration
    // ========================================================================
    admin: {
        title: 'System Administration',
        subtitle: 'Manage users, permissions and system settings',
        
        // Tabs
        users: 'Users',
        rolesPermissions: 'Roles & Permissions',
        systemSettings: 'System Settings',
        auditLog: 'Audit Log',
        
        // User Management
        searchUsers: 'Search users...',
        createUser: 'Create Account',
        noUsers: 'No users found',
        employeeCode: 'Employee ID',
        userName: 'Name',
        role: 'Role',
        changeRole: 'Change Role',
        currentUser: 'Current User',
        newRole: 'New Role',
        selectEmployee: 'Select Employee',
        selectEmployeePlaceholder: '-- Select Employee --',
        defaultPassword: 'Default Password',
        defaultPasswordPlaceholder: 'Enter default password',
        userCreated: 'Account created successfully',
        userDeleted: 'Account deleted',
        roleUpdated: 'Role updated successfully',
        deleteConfirm: 'Are you sure you want to delete this account?',
        
        // RBAC
        rbacMatrix: 'Permissions Matrix (RBAC)',
        permission: 'Permission',
        
        // System Settings
        companyProfile: 'Company Profile',
        companyName: 'Company Name',
        companyEmail: 'Email',
        companyPhone: 'Phone',
        companyAddress: 'Address',
        codeGeneration: 'Code Generation Rules',
        assetCodeFormat: 'Asset Code Format',
        employeeCodeFormat: 'Employee Code Format',
        requestCodeFormat: 'Request Code Format',
        settingsComingSoon: 'Edit functionality coming soon.',
        
        // Audit
        auditComingSoon: 'Audit log coming soon.',
    },
};
