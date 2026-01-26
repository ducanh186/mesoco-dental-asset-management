/**
 * English Translations
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
        notes: 'Notes',
        date: 'Date',
        time: 'Time',
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
        myAssets: 'My Assets',
        assets: 'Asset Management',
        equipment: 'Equipment',
        requests: 'Requests',
        maintenance: 'Maintenance',
        reports: 'Reports',
        users: 'Users',
        settings: 'Settings',
        profile: 'Profile',
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
    },

    // ========================================================================
    // Dashboard
    // ========================================================================
    dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome back, {name}!',
        welcomeSubtitle: "Here's what's happening with your equipment today.",
        totalEquipment: 'Total Equipment',
        totalAssets: 'Total Assets',
        activeRequests: 'Active Requests',
        maintenanceDue: 'Maintenance Due',
        assignedAssets: 'Assigned',
        availableAssets: 'Available',
        maintenanceAssets: 'Under Maintenance',
        recentActivity: 'Recent Activity',
        recentEquipment: 'Recent Equipment',
        quickActions: 'Quick Actions',
        myAssignedAssets: 'My Assigned Assets',
        pendingRequests: 'Pending Requests',
        pendingApproval: '{count} pending approval',
        overdue: '{count} overdue',
        thisMonth: '+{count} this month',
        addEquipment: 'Add Equipment',
        newRequest: 'New Request',
        scanQrCode: 'Scan QR Code',
        viewReports: 'View Reports',
        viewAll: 'View All',
        loading: 'Loading...',
        noEquipmentFound: 'No Equipment Found',
        noEquipmentHint: 'Start by adding your first piece of equipment.',
        equipmentName: 'Equipment Name',
        code: 'Code',
        assignedTo: 'Assigned To',
        lastMaintenance: 'Last Maintenance',
    },

    // ========================================================================
    // Assets
    // ========================================================================
    assets: {
        title: 'Asset Management',
        subtitle: 'Manage master data and assignments',
        myAssets: 'My Assets',
        myAssetsSubtitle: 'View your assigned assets and lookup QR codes',
        allAssets: 'All Assets',
        createAsset: 'Create New Asset',
        editAsset: 'Edit Asset',
        deleteAsset: 'Delete Asset',
        assetDetails: 'Asset Details',
        assetCode: 'Asset Code',
        assetName: 'Asset Name',
        assetType: 'Asset Type',
        assetStatus: 'Status',
        
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
            maintenance: 'Maintenance',
            retired: 'Retired',
        },
        
        // Assignment
        assignment: 'Assignment',
        assigned: 'Assigned',
        unassigned: 'Unassigned',
        assignTo: 'Assign to',
        assignAsset: 'Assign Asset',
        unassignAsset: 'Unassign Asset',
        currentAssignee: 'Current Assignee',
        assignedSince: 'Assigned since',
        assignmentHistory: 'Assignment History',
        noAssignment: 'Currently unassigned',
        selectEmployee: 'Select Employee',
        assignSuccess: 'Asset assigned successfully',
        unassignSuccess: 'Asset unassigned successfully',
        
        // QR
        qrIdentity: 'QR Identity',
        qrCode: 'QR Code',
        qrPayload: 'QR Payload',
        regenerateQr: 'Regenerate QR',
        regenerateQrConfirm: 'The old QR code will still work (for backward compatibility). Are you sure you want to generate a new QR code?',
        qrRegenerated: 'QR code regenerated successfully',
        copyPayload: 'Copy Payload',
        noQrCode: 'No QR code generated',
        
        // QR Resolve
        qrLookup: 'QR Code Lookup',
        qrLookupSubtitle: 'Enter or scan a QR payload to find asset details',
        enterQrPayload: 'Enter QR payload (e.g., MESO-xxxx-xxxx-xxxx)',
        resolve: 'Resolve',
        assetFound: 'Asset found!',
        assetNotFound: 'Asset not found or has been deleted',
        qrEnterHint: 'Enter a QR payload to see asset details',
        qrHelpTitle: 'How to use QR Lookup',
        qrHelpDesc: 'Scan the QR code on an asset using your phone camera or any QR scanner app, then paste the payload (e.g., MESO-xxxx-xxxx-xxxx) in the input field above.',
        
        // Table columns
        columns: {
            assetCode: 'Asset Code',
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
        myAssigned: 'My Assigned Assets',
        noAssignedYet: "You don't have any assigned assets yet",
        available: 'Available',
        
        // CRUD
        createSuccess: 'Asset created successfully',
        updateSuccess: 'Asset updated successfully',
        deleteSuccess: 'Asset deleted successfully',
        deleteConfirm: 'Are you sure you want to delete "{name}"? This action cannot be undone.',
        
        // Filters
        searchPlaceholder: 'Search by code or name...',
        filterByType: 'Filter by type',
        filterByStatus: 'Filter by status',
        filterByAssignment: 'Filter by assignment',
        
        // Empty states
        noAssets: 'No assets found',
        noAssignedAssets: 'You don\'t have any assigned assets yet',
        
        // Form
        assetCodeHint: 'Leave blank for auto-generate',
        enterAssetName: 'Enter asset name',
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
        noInstructions: 'No instructions available for this asset',
        instructionsDesc: 'This asset has attached instructions. Click the button below to view them.',
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
    // Requests
    // ========================================================================
    requests: {
        title: 'Requests',
        subtitle: 'Manage equipment borrow, return, and maintenance requests',
        myRequests: 'My Requests',
        allRequests: 'All Requests',
        totalRequests: 'Total Requests',
        createRequest: 'Create Request',
        newRequest: 'New Request',
        requestDetails: 'Request Details',
        requestId: 'Request ID',
        requestDate: 'Request Date',
        requestType: 'Request Type',
        equipment: 'Equipment',
        priority: 'Priority',
        notes: 'Notes',
        requester: 'Requester',
        // Status
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        completed: 'Completed',
        cancelled: 'Cancelled',
        // Types
        types: {
            all: 'All Types',
            borrow: 'Borrow Equipment',
            return: 'Return Equipment',
            maintenance: 'Request Maintenance',
        },
        // Priority
        priorities: {
            low: 'Low',
            normal: 'Normal',
            high: 'High',
        },
        // Actions
        view: 'View',
        cancel: 'Cancel',
        approve: 'Approve',
        reject: 'Reject',
        submitRequest: 'Submit Request',
        // Messages
        noRequests: 'No requests',
        noRequestsHint: 'Get started by creating a new request.',
        searchPlaceholder: 'Search by equipment or request ID...',
        requestSubmitted: 'Request submitted successfully!',
        addDetails: 'Add any additional details...',
        comingSoon: 'Coming Soon',
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
    },

    // ========================================================================
    // Reports
    // ========================================================================
    reports: {
        title: 'Reports',
        assetReport: 'Asset Report',
        assignmentReport: 'Assignment Report',
        maintenanceReport: 'Maintenance Report',
        exportPdf: 'Export PDF',
        exportExcel: 'Export Excel',
        comingSoon: 'Coming Soon',
    },

    // ========================================================================
    // Errors
    // ========================================================================
    errors: {
        general: 'An error occurred. Please try again.',
        network: 'Network error. Please check your connection.',
        notFound: 'Page Not Found',
        notFoundMessage: 'The page you are looking for does not exist.',
        forbidden: 'You do not have permission to access this page',
        serverError: 'Server error. Please try again later.',
        validation: 'Invalid data. Please check your input.',
        sessionExpired: 'Session expired. Please login again.',
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
};
