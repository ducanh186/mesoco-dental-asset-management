/**
 * English Translations
 * Mesoco IT Asset Management
 */
export default {
    // ========================================================================
    // Common
    // ========================================================================
    common: {
        save: 'Save',
        saving: 'Saving...',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        update: 'Update',
        add: 'Add',
        remove: 'Remove',
        search: 'Search',
        searchPlaceholder: 'Search...',
        selectOption: 'Select an option...',
        filter: 'Filter',
        sort: 'Sort',
        clear: 'Clear',
        reset: 'Reset',
        submit: 'Submit',
        confirm: 'Confirm',
        close: 'Close',
        closeSidebar: 'Close sidebar',
        closeModal: 'Close modal',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        loading: 'Loading...',
        processing: 'Processing...',
        noData: 'No data',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Info',
        unknown: 'Unknown',
        yes: 'Yes',
        no: 'No',
        all: 'All',
        none: 'None',
        actions: 'Actions',
        openMenu: 'Open menu',
        user: 'User',
        print: 'Print',
        status: {
            label: 'Status',
            active: 'Active',
            inactive: 'Inactive',
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected',
            submitted: 'Submitted',
            cancelled: 'Cancelled',
            maintenance: 'Maintenance',
            inProgress: 'In Progress',
            in_progress: 'In Progress',
            offService: 'Off Service',
            off_service: 'Off Service',
            available: 'Available',
            assigned: 'Assigned',
            overdue: 'Overdue',
            expired: 'Expired',
            terminated: 'Terminated',
            retired: 'Retired',
            draft: 'Draft',
            preparing: 'Preparing',
            shipping: 'Shipping',
            delivered: 'Delivered'
        },
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
        catalogRecords: 'Catalog & Records',
        allocationManagement: 'Allocation Management',
        employees: 'Employee Profiles',
        assets: 'Asset Catalog',
        equipmentCatalog: 'Asset Catalog',
        myEquipment: 'Department Equipment',
        equipment: 'Equipment',
        shifts: 'Shifts',
        checkin: 'Shift Check-in',
        requests: 'IT Incident & Supply Forms',
        reviewRequests: 'Review Requests',
        inventory: 'Periodic Inventory',
        inventoryValuation: 'Inventory & Valuation',
        maintenance: 'Maintenance & Repair',
        offService: 'Off Service',
        feedback: 'Feedback & Suggestions',
        reports: 'Reports & Statistics',
        settings: 'Settings',
        users: 'Users',
        locations: 'Location Catalog',
        equipmentLookup: 'Equipment Lookup',
        disposal: 'Disposal',
        incidents: 'Incident Management',
        disposalForms: 'Disposal Forms',
        suppliers: 'Suppliers',
        purchaseOrders: 'Purchase Orders',
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
        verificationCodeResent: 'A new verification code has been sent.',
        invalidVerificationCode: 'The verification code is invalid.',
        failedToSendCode: 'Failed to send verification code. Please try again.',
        failedToResetPassword: 'Failed to reset password. Please try again.',
        failedToResendCode: 'Failed to resend code. Please try again.',
        // New validation messages
        employeeIdRequired: 'Employee ID is required.',
        passwordRequired: 'Password is required.',
        emailRequired: 'Email address is required.',
        emailInvalid: 'Please enter a valid email address.',
        codeRequired: 'Verification code is required.',
        passwordTooShort: 'Password must be at least 8 characters.',
        confirmPasswordRequired: 'Please confirm your password.',
        passwordMismatch: 'Passwords do not match.',
        // Generic error messages (security)
        invalidCredentialsGeneric: 'Invalid employee ID or password.',
        codeSentGeneric: 'If the email is registered, we\'ve sent a verification code to your inbox. Please check your email.',
        passwordResetSuccess: 'Password reset successful. Redirecting to login...',
        // Password visibility
        showPassword: 'Show password',
        hidePassword: 'Hide password',
    },

    // ========================================================================
    // Change Password Page
    // ========================================================================
    changePassword: {
        currentPasswordRequired: 'Current password is required.',
        newPasswordRequired: 'New password is required.',
        confirmPasswordRequired: 'Confirm new password is required.',
        currentPasswordIncorrect: 'Current password is incorrect.',
        passwordsDoNotMatch: 'Passwords do not match.',
        newPasswordSameAsCurrent: 'New password must be different from current password.',
        enterCurrentPassword: 'Enter your current password',
        success: 'Your password has been changed successfully.',
        genericError: 'Failed to change password.',
        changing: 'Changing...',
    },

    // ========================================================================
    // Roles
    // ========================================================================
    roles: {
        staff: 'Staff',
        employee: 'Staff', // DB value 'employee' displays as 'Staff'
        technician: 'Technician',
        manager: 'Manager',
        owner: 'Owner',
        hr: 'Technician',
        supplier: 'Supplier',
    },

    // ========================================================================
    // Dashboard
    // ========================================================================
    dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome back, {name}!',
        welcomeSubtitle: "Here's what's happening with your equipment today.",
        welcomeSubtitleAdmin: 'Overview of the IT asset management system.',
        welcomeSubtitleUser: 'View your assigned equipment and manage requests.',
        welcomeSubtitleTechnician: 'Track maintenance schedules and manage equipment.',
        welcomeSubtitleSupplier: 'Track purchase orders and update delivery progress for your supplier account.',
        
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
        
        // Employee cards
        myEquipmentCount: 'Department Equipment',
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
        viewReports: 'View Reports',
        myEquipment: 'My Equipment',
        myRequests: 'My Requests',
        reviewRequests: 'Review Requests',
        maintenance: 'Maintenance & Repair',
        inventory: 'Inventory & Valuation',
        totalOrders: 'Total Orders',
        ordersShipping: 'Orders Shipping',
        ordersDelivered: 'Delivered Orders',
        preparingCount: '{count} preparing',
        shippingInProgress: 'Orders are currently shipping',
        noShippingOrders: 'No orders are shipping',
        deliveredCount: '{count} delivered successfully',
        awaitingDelivery: 'No orders delivered yet',
        recentOrders: 'Recent Orders',
        recentOrdersHint: 'Latest purchase orders that need progress tracking',
        noOrdersFound: 'No purchase orders found',

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
        subtitle: 'Manage IT asset records and department handovers',
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
        supplier: 'Supplier',
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
        currentAssignee: 'Current Handover Unit',
        assignedTo: 'Assigned To',
        handoverDepartment: 'Handover Department',
        assignedSince: 'Assigned since',
        assignmentHistory: 'Assignment History',
        noAssignment: 'Currently unassigned',
        notAssigned: 'No equipment assigned',
        selectEmployee: 'Select Employee',
        assignSuccess: 'Equipment assigned successfully',
        unassignSuccess: 'Equipment unassigned successfully',
        
        // Condition
        condition: 'Condition',
        
        viewAsset: 'View Equipment',
        
        // Table columns
        columns: {
            assetCode: 'Code',
            name: 'Name',
            type: 'Type',
            status: 'Status',
            assignee: 'Assignee',
            assignment: 'Assignment',
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
        chooseSupplier: 'Choose a supplier...',
        noSupplier: 'No supplier linked',
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
            hr: 'Technician',
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
        personalDetails: 'Personal Details',
        personalInfo: 'Personal Information',
        security: 'Security',
        preferences: 'Preferences',
        language: 'Language',
        changeAvatar: 'Change Avatar',
        updateProfile: 'Update Profile',
        updateSuccess: 'Profile updated successfully',
        updateError: 'Failed to update profile. Please try again.',
        loadError: 'Failed to load profile. Please try again.',
        employeeId: 'Employee ID',
        employeeFullName: 'Employee Full Name',
        supplierCode: 'Supplier Code',
        supplierName: 'Supplier Name',
        contactPerson: 'Contact Person',
        supplierNote: 'Supplier Note',
        fullName: 'Full Name',
        phone: 'Phone',
        phoneNumber: 'Phone Number',
        department: 'Department',
        position: 'Position',
        dateOfBirth: 'Date of Birth',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        email: 'Email',
        address: 'Address',
        emergencyContact: 'Emergency Contact',
        disabledFieldHint: 'This field cannot be edited',
        unnamed: 'Unnamed User',
        recentActivity: 'Recent Activity',
        noRecentActivity: 'No recent activity',
        joined: 'Joined',
        equipmentAssigned: 'Equipment Assigned',
        items: 'items',
        maintenanceRequest: 'Maintenance request',
        active: 'active',
        completed: 'completed',
        pending: 'pending',
    },

    // ========================================================================
    // Purchase Orders
    // ========================================================================
    purchaseOrders: {
        orderCode: 'Order Code',
        orderDate: 'Order Date',
        totalAmount: 'Total Amount',
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
        subtitle: 'Manage IT equipment incident reports and IT consumable requests',
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
            CONSUMABLE_REQUEST: 'Consumable Request',
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
        
        // Legacy scheduling fields
        fromShift: 'From Shift',
        toShift: 'To Shift',
        handlingPurpose: 'Handling purpose',

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
        reviewQueueSubtitle: 'Approve or reject pending requests',
        approveConfirm: 'Confirm approval of this request?',
        rejectConfirm: 'Confirm rejection of this request?',
        approveSuccess: 'Request approved successfully',
        rejectSuccess: 'Request rejected successfully',
        pendingCount: '{count} pending',
        noPendingRequests: 'No pending requests',
        allProcessed: 'All requests have been processed',
        totalMatchingRequests: 'Total Matching Requests',
        highPriority: 'High Priority',
        allCaughtUp: 'All caught up!',
        noPendingRequestsHint: 'No pending requests to review',
        loadingRequests: 'Loading requests...',
        noRequestsFound: 'No requests found',
        noRequestsYet: 'No requests yet',
        noItemsAddedYet: 'No items added yet. Click "Add Item" to start.',
        cancelConfirm: 'Are you sure you want to cancel this request?',
        approveRequestTitle: 'Approve Request',
        rejectRequestTitle: 'Reject Request',
        approveRequestConfirm: 'Are you sure you want to approve this request?',
        rejectRequestConfirm: 'Are you sure you want to reject this request?',
        noteLabel: 'Note',
        approveNotePlaceholder: 'Optional: Add a note for the requester...',
        rejectNotePlaceholder: 'Please provide a reason for rejection...',
        performedBy: 'by {name}',
        shiftLabel: 'Shift',
        severitySuffix: 'severity',

        // Empty states
        noRequests: 'No requests',
        noRequestsHint: 'Get started by creating a new request.',
        searchPlaceholder: 'Search by request code or requester...',
        createNewRequest: 'Create New Request',
        myRequestsSubtitle: 'View and manage your equipment requests',
        pendingReview: 'Pending Review',
        titlePlaceholder: 'Briefly describe your request',
        descriptionPlaceholder: 'Provide additional details...',
        submitting: 'Submitting...',
        assets: 'Assets',
        consumableItems: 'Consumable Items',
        requestDetail: 'Request Detail',
        requestedBy: 'Requested By',
        activity: 'Activity',
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
        suspectedCauses: {
            unknown: 'Unknown cause',
            wear: 'Natural wear and tear',
            operation: 'Operational error',
            electrical: 'Electrical issue',
            mechanical: 'Mechanical issue',
            software: 'Software issue',
        },
    },

    // ========================================================================
    // Request Types (for forms)
    // ========================================================================
    requestType: {
        justification: 'Equipment Issue Report',
        retiredCirculation: 'Retired circulation flow',
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
        title: 'Maintenance & Repair',
        subtitle: 'Maintenance schedules, repairs and service records',
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
        title: 'Inventory & Valuation',
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
        title: 'Reports & Statistics',
        overview: 'Overview',
        assetReport: 'Asset Report',
        assetUsage: 'Equipment Usage Report',
        incidents: 'Incidents',
        requests: 'Distribution Forms',
        assignmentReport: 'Assignment Report',
        maintenanceReport: 'Maintenance & Repair Report',
        maintenance: 'Maintenance & Repair',
        conditionReport: 'Condition Report',
        export: 'Export',
        exportPdf: 'Export PDF',
        exportExcel: 'Export Excel',
        comingSoon: 'Coming Soon',
    },

    // ========================================================================
    // Feedback
    // ========================================================================
    feedback: {
        title: 'Feedback & Suggestions',
        sendFeedback: 'Send Feedback',
        placeholder: 'Enter your feedback or suggestion...',
        thanks: 'Thank you for your feedback',
    },

    // ========================================================================
    // Disposal
    // ========================================================================
    disposal: {
        title: 'Equipment Disposal',
        subtitle: 'Manage equipment eligible for disposal (depreciation >= 70%)',
        eligibleForDisposal: 'Eligible for Disposal',
        highDepreciation: 'Depreciation >= 90%',
        alreadyRetired: 'Already Disposed',
        remainingValue: 'Remaining Value',
        eligibleTab: 'Eligible',
        retiredTab: 'Disposed',
        assetCode: 'Asset Code',
        assetName: 'Asset Name',
        category: 'Category',
        depreciation: 'Depreciation',
        purchaseCost: 'Purchase Cost',
        bookValue: 'Book Value',
        reason: 'Disposal Reason',
        reasonPlaceholder: 'Enter reason for disposing this asset...',
        retiredDate: 'Disposal Date',
        retire: 'Dispose',
        retireSuccess: 'Asset disposed successfully.',
        retireConfirmTitle: 'Confirm Disposal',
        retireConfirmMessage: 'Are you sure you want to dispose {name} ({code})?',
        confirmRetire: 'Confirm Disposal',
        noEligible: 'No assets eligible for disposal.',
        noRetired: 'No disposed assets yet.',
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
        regenerateIdentifier: 'Regenerate identifier',
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
    // Topbar
    // ========================================================================
    topbar: {
        searchPlaceholder: 'Search...',
    },

    // ========================================================================
    // Printable Label
    // ========================================================================
    printableLabel: {
        title: 'Asset Label',
        popupBlocked: 'Please allow popups to print the label',
        unnamedAsset: 'Unnamed Asset',
        scanInstruction: 'Use this label for inventory reconciliation',
        handoverNote: 'IT asset handed over by department',
    },

    // ========================================================================
    // Locations Page
    // ========================================================================
    locationsPage: {
        title: 'Locations',
        subtitle: 'Manage physical locations for assets',
        addLocation: 'Add Location',
        editLocation: 'Edit Location',
        searchPlaceholder: 'Search by location name...',
        showInactive: 'Show inactive locations',
        noLocations: 'No locations found',
        locationName: 'Location Name',
        locationNamePlaceholder: 'e.g., Server Room or Office Floor 1',
        descriptionPlaceholder: 'Optional description...',
        address: 'Address',
        addressPlaceholder: 'Optional address...',
    },

    // ========================================================================
    // Inventory Page
    // ========================================================================
    inventoryPage: {
        title: 'Inventory & Valuation',
        totalAssets: 'Total Assets',
        assigned: 'Assigned',
        totalBookValue: 'Total Book Value',
        warrantyExpiringSoon: '{count} assets with warranty expiring soon',
        withinDays: 'Within {count} days',
        expiredCount: '{count} expired',
        showAll: 'Show All',
        showExpiring: 'Show Expiring',
        equipmentInventory: 'Equipment Inventory',
        assetValuationReport: 'Asset Valuation Report',
        totalItems: '{count} total items',
        warrantyFilterSuffix: ' (warranty expiring soon)',
        inventoryTab: 'Inventory',
        valuationTab: 'Valuation',
        exportCsv: 'Export CSV',
        exporting: 'Exporting...',
        noAssetsFound: 'No assets found',
        adjustFilters: 'Try adjusting your search or filters.',
        code: 'Code',
        equipment: 'Equipment',
        bookValue: 'Book Value',
        fullyDepreciated: 'Fully Depr.',
        detailTitle: 'Asset Details',
        purchaseDate: 'Purchase Date',
        warrantyExpiry: 'Warranty Expiry',
        purchaseCost: 'Purchase Cost',
        currentBookValue: 'Current Book Value',
        printLabel: 'Print Label',
        exportSuccess: 'Export downloaded successfully',
    },

    // ========================================================================
    // Placeholder Pages
    // ========================================================================
    placeholderPages: {
        equipmentTitle: 'Equipment Management',
        equipmentDescription: 'Manage company IT equipment.',
        usersTitle: 'User Management',
        usersDescription: 'Manage users and access permissions.',
        settingsTitle: 'System Settings',
        settingsDescription: 'Configure application preferences.',
        comingSoon: 'Coming in Phase 1',
    },

    // ========================================================================
    // Not Found
    // ========================================================================
    notFound: {
        title: 'Page Not Found',
        message: "The page you're looking for doesn't exist or has been moved.",
        backToDashboard: 'Back to Dashboard',
    },

    // ========================================================================
    // Validation Messages
    // ========================================================================
    validation: {
        required: 'This field is required',
        email: 'Please enter a valid email address',
        phone: 'Please enter a valid phone number',
        date: 'Please enter a valid date',
        minLength: 'Must be at least {min} characters',
        maxLength: 'Must not exceed {max} characters',
    },
};
