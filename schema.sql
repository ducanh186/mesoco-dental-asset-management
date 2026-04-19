-- schema.sql
-- MySQL schema extracted from Laravel migrations, Eloquent models, and DB docs.
-- Target: MySQL / InnoDB / utf8mb4.

CREATE TABLE `cache` (
  `key` VARCHAR(255) NOT NULL,
  `value` MEDIUMTEXT NOT NULL,
  `expiration` INT NOT NULL,
  PRIMARY KEY (`key`),
  KEY `idx_cache_expiration` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cache_locks` (
  `key` VARCHAR(255) NOT NULL,
  `owner` VARCHAR(255) NOT NULL,
  `expiration` INT NOT NULL,
  PRIMARY KEY (`key`),
  KEY `idx_cache_locks_expiration` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `jobs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` VARCHAR(255) NOT NULL,
  `payload` LONGTEXT NOT NULL,
  `attempts` TINYINT UNSIGNED NOT NULL,
  `reserved_at` INT UNSIGNED NULL DEFAULT NULL,
  `available_at` INT UNSIGNED NOT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_jobs_queue` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `job_batches` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `total_jobs` INT NOT NULL,
  `pending_jobs` INT NOT NULL,
  `failed_jobs` INT NOT NULL,
  `failed_job_ids` LONGTEXT NOT NULL,
  `options` MEDIUMTEXT NULL,
  `cancelled_at` INT NULL DEFAULT NULL,
  `created_at` INT NOT NULL,
  `finished_at` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `failed_jobs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(255) NOT NULL,
  `connection` TEXT NOT NULL,
  `queue` TEXT NOT NULL,
  `payload` LONGTEXT NOT NULL,
  `exception` LONGTEXT NOT NULL,
  `failed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_failed_jobs_uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `locations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `address` VARCHAR(255) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_locations_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `employees` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_code` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `position` VARCHAR(255) NULL,
  `department` VARCHAR(100) NULL,
  `dob` DATE NULL,
  `gender` ENUM('male', 'female', 'other') NULL,
  `phone` VARCHAR(255) NULL,
  `email` VARCHAR(255) NOT NULL,
  `address` TEXT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_employees_employee_code` (`employee_code`),
  UNIQUE KEY `uniq_employees_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `roles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_roles_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `suppliers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NULL,
  `name` VARCHAR(150) NOT NULL,
  `contact_person` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `email` VARCHAR(255) NULL,
  `address` TEXT NULL,
  `note` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_suppliers_code` (`code`),
  UNIQUE KEY `uniq_suppliers_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NULL,
  `supplier_id` BIGINT UNSIGNED NULL,
  `employee_code` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `role` VARCHAR(255) NOT NULL DEFAULT 'employee',
  `role_id` BIGINT UNSIGNED NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'active',
  `must_change_password` TINYINT(1) NOT NULL DEFAULT 0,
  `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `remember_token` VARCHAR(100) NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_users_employee_code` (`employee_code`),
  UNIQUE KEY `uniq_users_email` (`email`),
  UNIQUE KEY `uniq_users_supplier_id` (`supplier_id`),
  KEY `idx_users_employee_id` (`employee_id`),
  KEY `idx_users_role_id` (`role_id`),
  CONSTRAINT `fk_users_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_users_supplier_id` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_users_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `password_reset_tokens` (
  `email` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sessions` (
  `id` VARCHAR(255) NOT NULL,
  `user_id` BIGINT UNSIGNED NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `payload` LONGTEXT NOT NULL,
  `last_activity` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sessions_user_id` (`user_id`),
  KEY `idx_sessions_last_activity` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `personal_access_tokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` VARCHAR(255) NOT NULL,
  `tokenable_id` BIGINT UNSIGNED NOT NULL,
  `name` TEXT NOT NULL,
  `token` VARCHAR(64) NOT NULL,
  `abilities` TEXT NULL,
  `last_used_at` TIMESTAMP NULL DEFAULT NULL,
  `expires_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_personal_access_tokens_token` (`token`),
  KEY `idx_personal_access_tokens_tokenable` (`tokenable_type`, `tokenable_id`),
  KEY `idx_personal_access_tokens_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `password_reset_codes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `code_hash` VARCHAR(255) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `used_at` TIMESTAMP NULL DEFAULT NULL,
  `resend_available_at` TIMESTAMP NULL DEFAULT NULL,
  `last_sent_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_password_reset_codes_email` (`email`),
  KEY `idx_password_reset_codes_email_expires_at` (`email`, `expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `shifts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(10) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_shifts_code` (`code`),
  KEY `idx_shifts_is_active` (`is_active`),
  KEY `idx_shifts_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `asset_code_sequences` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `prefix` VARCHAR(20) NOT NULL,
  `year_month` VARCHAR(6) NOT NULL,
  `last_number` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `asset_code_seq_prefix_ym_unique` (`prefix`, `year_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(100) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_categories_code` (`code`),
  UNIQUE KEY `uniq_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `assets` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `asset_code` VARCHAR(50) NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('tray', 'machine', 'tool', 'equipment', 'other') NOT NULL DEFAULT 'equipment',
  `category` VARCHAR(100) NULL,
  `category_id` BIGINT UNSIGNED NULL,
  `supplier_id` BIGINT UNSIGNED NULL,
  `location` VARCHAR(100) NULL,
  `warranty_expiry` DATE NULL,
  `warranty_period_months` INT UNSIGNED NULL,
  `status` ENUM('active', 'off_service', 'maintenance', 'retired') NOT NULL DEFAULT 'active',
  `off_service_reason` VARCHAR(255) NULL,
  `off_service_from` TIMESTAMP NULL DEFAULT NULL,
  `off_service_until` TIMESTAMP NULL DEFAULT NULL,
  `off_service_set_by` BIGINT UNSIGNED NULL,
  `notes` TEXT NULL,
  `instructions_url` TEXT NULL,
  `qr_value` VARCHAR(255) NULL,
  `qr_image_path` VARCHAR(255) NULL,
  `purchase_date` DATE NULL,
  `purchase_cost` DECIMAL(12, 2) NULL,
  `useful_life_months` INT UNSIGNED NULL,
  `salvage_value` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `depreciation_method` ENUM('TIME', 'USAGE') NOT NULL DEFAULT 'TIME',
  `depreciation_rate` DECIMAL(8, 4) NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_assets_asset_code` (`asset_code`),
  KEY `idx_assets_type` (`type`),
  KEY `idx_assets_status` (`status`),
  KEY `idx_assets_deleted_at` (`deleted_at`),
  KEY `idx_assets_purchase_date` (`purchase_date`),
  KEY `idx_assets_category` (`category`),
  KEY `idx_assets_location` (`location`),
  KEY `idx_assets_status_off_service_from` (`status`, `off_service_from`),
  KEY `idx_assets_category_id` (`category_id`),
  KEY `idx_assets_supplier_id` (`supplier_id`),
  KEY `idx_assets_off_service_set_by` (`off_service_set_by`),
  CONSTRAINT `fk_assets_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_assets_supplier_id` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_assets_off_service_set_by` FOREIGN KEY (`off_service_set_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `asset_assignments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `asset_id` BIGINT UNSIGNED NOT NULL,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `assigned_by` BIGINT UNSIGNED NOT NULL,
  `assigned_at` TIMESTAMP NOT NULL,
  `unassigned_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_asset_assignments_asset_unassigned` (`asset_id`, `unassigned_at`),
  KEY `idx_asset_assignments_employee_unassigned` (`employee_id`, `unassigned_at`),
  KEY `idx_asset_assignments_assigned_by` (`assigned_by`),
  CONSTRAINT `fk_asset_assignments_asset_id` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_asset_assignments_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_asset_assignments_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `asset_qr_identities` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `qr_uid` CHAR(36) NOT NULL,
  `asset_id` BIGINT UNSIGNED NOT NULL,
  `payload_version` VARCHAR(255) NOT NULL DEFAULT 'v1',
  `printed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_asset_qr_identities_qr_uid` (`qr_uid`),
  KEY `idx_asset_qr_identities_asset_id` (`asset_id`),
  CONSTRAINT `fk_asset_qr_identities_asset_id` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `asset_checkins` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `asset_id` BIGINT UNSIGNED NOT NULL,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `shift_id` BIGINT UNSIGNED NOT NULL,
  `shift_date` DATE NOT NULL,
  `checked_in_at` TIMESTAMP NOT NULL,
  `checked_out_at` TIMESTAMP NULL DEFAULT NULL,
  `source` ENUM('qr', 'manual') NOT NULL DEFAULT 'manual',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_asset_shift_date` (`asset_id`, `shift_id`, `shift_date`),
  KEY `idx_asset_checkins_employee_shift_date` (`employee_id`, `shift_date`),
  KEY `idx_asset_checkins_shift_date_shift` (`shift_date`, `shift_id`),
  KEY `idx_asset_checkins_checked_in_at` (`checked_in_at`),
  KEY `idx_asset_checkins_shift_id` (`shift_id`),
  CONSTRAINT `fk_asset_checkins_asset_id` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_asset_checkins_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_asset_checkins_shift_id` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `maintenance_events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL,
  `asset_id` BIGINT UNSIGNED NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `status` ENUM('scheduled', 'in_progress', 'completed', 'canceled') NOT NULL DEFAULT 'scheduled',
  `planned_at` TIMESTAMP NOT NULL,
  `priority` VARCHAR(20) NOT NULL DEFAULT 'normal',
  `started_at` TIMESTAMP NULL DEFAULT NULL,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `note` TEXT NULL,
  `result_note` TEXT NULL,
  `estimated_duration_minutes` INT UNSIGNED NULL,
  `actual_duration_minutes` INT UNSIGNED NULL,
  `cost` DECIMAL(12, 2) NULL,
  `assigned_to` VARCHAR(100) NULL,
  `assigned_to_user_id` BIGINT UNSIGNED NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_maintenance_events_code` (`code`),
  KEY `idx_maintenance_events_asset_status` (`asset_id`, `status`),
  KEY `idx_maintenance_events_status_planned` (`status`, `planned_at`),
  KEY `idx_maintenance_events_planned_at` (`planned_at`),
  KEY `idx_maintenance_events_type` (`type`),
  KEY `idx_maintenance_events_assigned_to_user_id` (`assigned_to_user_id`),
  KEY `idx_maintenance_events_created_by` (`created_by`),
  KEY `idx_maintenance_events_updated_by` (`updated_by`),
  CONSTRAINT `fk_maintenance_events_asset_id` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_maintenance_events_assigned_to_user_id` FOREIGN KEY (`assigned_to_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_maintenance_events_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_maintenance_events_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `feedbacks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `asset_id` BIGINT UNSIGNED NULL,
  `maintenance_event_id` BIGINT UNSIGNED NULL,
  `content` TEXT NOT NULL,
  `rating` TINYINT UNSIGNED NULL,
  `status` ENUM('new', 'in_progress', 'resolved') NOT NULL DEFAULT 'new',
  `type` ENUM('issue', 'suggestion', 'praise', 'other') NOT NULL DEFAULT 'other',
  `response` TEXT NULL,
  `resolved_by` BIGINT UNSIGNED NULL,
  `resolved_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_feedbacks_code` (`code`),
  KEY `idx_feedbacks_status` (`status`),
  KEY `idx_feedbacks_type` (`type`),
  KEY `idx_feedbacks_user_created` (`user_id`, `created_at`),
  KEY `idx_feedbacks_asset_id` (`asset_id`),
  KEY `idx_feedbacks_maintenance_event_id` (`maintenance_event_id`),
  KEY `idx_feedbacks_resolved_by` (`resolved_by`),
  CONSTRAINT `fk_feedbacks_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_feedbacks_asset_id` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_feedbacks_maintenance_event_id` FOREIGN KEY (`maintenance_event_id`) REFERENCES `maintenance_events` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_feedbacks_resolved_by` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `employee_contracts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `department` VARCHAR(255) NULL,
  `contract_type` VARCHAR(255) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'ACTIVE',
  `pdf_path` VARCHAR(255) NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_employee_contracts_employee_id` (`employee_id`),
  KEY `idx_employee_contracts_status` (`status`),
  KEY `idx_employee_contracts_start_date` (`start_date`),
  KEY `idx_employee_contracts_employee_status` (`employee_id`, `status`),
  KEY `idx_employee_contracts_created_by` (`created_by`),
  CONSTRAINT `fk_employee_contracts_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_employee_contracts_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `purchase_orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_code` VARCHAR(50) NOT NULL,
  `supplier_id` BIGINT UNSIGNED NULL,
  `requested_by_user_id` BIGINT UNSIGNED NULL,
  `approved_by_user_id` BIGINT UNSIGNED NULL,
  `order_date` DATE NULL,
  `expected_delivery_date` DATE NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'draft',
  `total_amount` DECIMAL(14, 2) NULL,
  `payment_method` VARCHAR(100) NULL,
  `note` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_purchase_orders_order_code` (`order_code`),
  KEY `idx_purchase_orders_status_order_date` (`status`, `order_date`),
  KEY `idx_purchase_orders_supplier_id` (`supplier_id`),
  KEY `idx_purchase_orders_requested_by_user_id` (`requested_by_user_id`),
  KEY `idx_purchase_orders_approved_by_user_id` (`approved_by_user_id`),
  CONSTRAINT `fk_purchase_orders_supplier_id` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_purchase_orders_requested_by_user_id` FOREIGN KEY (`requested_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_purchase_orders_approved_by_user_id` FOREIGN KEY (`approved_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `purchase_order_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `purchase_order_id` BIGINT UNSIGNED NOT NULL,
  `asset_id` BIGINT UNSIGNED NULL,
  `category_id` BIGINT UNSIGNED NULL,
  `item_name` VARCHAR(255) NOT NULL,
  `qty` DECIMAL(12, 2) NOT NULL DEFAULT 1.00,
  `unit` VARCHAR(30) NULL,
  `unit_price` DECIMAL(14, 2) NULL,
  `line_total` DECIMAL(14, 2) NULL,
  `note` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_purchase_order_items_purchase_order_id` (`purchase_order_id`),
  KEY `idx_purchase_order_items_asset_id` (`asset_id`),
  KEY `idx_purchase_order_items_category_id` (`category_id`),
  CONSTRAINT `fk_purchase_order_items_purchase_order_id` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_purchase_order_items_asset_id` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_purchase_order_items_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `approvals` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `approvable_type` VARCHAR(255) NOT NULL,
  `approvable_id` BIGINT UNSIGNED NOT NULL,
  `reviewer_user_id` BIGINT UNSIGNED NULL,
  `status` VARCHAR(30) NOT NULL,
  `note` TEXT NULL,
  `acted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `approvals_approvable_idx` (`approvable_type`, `approvable_id`),
  KEY `idx_approvals_status_acted_at` (`status`, `acted_at`),
  KEY `idx_approvals_reviewer_user_id` (`reviewer_user_id`),
  CONSTRAINT `fk_approvals_reviewer_user_id` FOREIGN KEY (`reviewer_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `repair_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `asset_id` BIGINT UNSIGNED NOT NULL,
  `maintenance_event_id` BIGINT UNSIGNED NULL,
  `technician_user_id` BIGINT UNSIGNED NULL,
  `supplier_id` BIGINT UNSIGNED NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'scheduled',
  `issue_description` TEXT NULL,
  `action_taken` TEXT NULL,
  `cost` DECIMAL(14, 2) NULL,
  `started_at` TIMESTAMP NULL DEFAULT NULL,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `logged_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_repair_logs_asset_status` (`asset_id`, `status`),
  KEY `idx_repair_logs_maintenance_event_id` (`maintenance_event_id`),
  KEY `idx_repair_logs_technician_user_id` (`technician_user_id`),
  KEY `idx_repair_logs_supplier_id` (`supplier_id`),
  CONSTRAINT `fk_repair_logs_asset_id` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_repair_logs_maintenance_event_id` FOREIGN KEY (`maintenance_event_id`) REFERENCES `maintenance_events` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_repair_logs_technician_user_id` FOREIGN KEY (`technician_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_repair_logs_supplier_id` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `disposals` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `asset_id` BIGINT UNSIGNED NOT NULL,
  `method` VARCHAR(30) NOT NULL DEFAULT 'destroy',
  `reason` TEXT NOT NULL,
  `disposed_by_user_id` BIGINT UNSIGNED NULL,
  `approved_by_user_id` BIGINT UNSIGNED NULL,
  `disposed_at` TIMESTAMP NOT NULL,
  `asset_book_value` DECIMAL(14, 2) NULL,
  `proceeds_amount` DECIMAL(14, 2) NULL,
  `note` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_disposals_code` (`code`),
  KEY `idx_disposals_method_disposed_at` (`method`, `disposed_at`),
  KEY `idx_disposals_asset_id` (`asset_id`),
  KEY `idx_disposals_disposed_by_user_id` (`disposed_by_user_id`),
  KEY `idx_disposals_approved_by_user_id` (`approved_by_user_id`),
  CONSTRAINT `fk_disposals_asset_id` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_disposals_disposed_by_user_id` FOREIGN KEY (`disposed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_disposals_approved_by_user_id` FOREIGN KEY (`approved_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `permissions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(100) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_permissions_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `role_permissions` (
  `role_id` BIGINT UNSIGNED NOT NULL,
  `permission_id` BIGINT UNSIGNED NOT NULL,
  `granted_at` TIMESTAMP NULL DEFAULT NULL,
  `note` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  KEY `idx_role_permissions_permission_id` (`permission_id`),
  CONSTRAINT `fk_role_permissions_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_permissions_permission_id` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `account_roles` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `role_id` BIGINT UNSIGNED NOT NULL,
  `assigned_at` TIMESTAMP NULL DEFAULT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'active',
  `note` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  KEY `idx_account_roles_role_status` (`role_id`, `status`),
  CONSTRAINT `fk_account_roles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_account_roles_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `maintenance_details` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `maintenance_event_id` BIGINT UNSIGNED NOT NULL,
  `asset_id` BIGINT UNSIGNED NOT NULL,
  `technician_user_id` BIGINT UNSIGNED NULL,
  `supplier_id` BIGINT UNSIGNED NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'scheduled',
  `issue_description` TEXT NULL,
  `action_taken` TEXT NULL,
  `cost` DECIMAL(14, 2) NULL,
  `started_at` TIMESTAMP NULL DEFAULT NULL,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `logged_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_maintenance_details_maintenance_event_id` (`maintenance_event_id`),
  KEY `idx_maintenance_details_asset_status` (`asset_id`, `status`),
  KEY `idx_maintenance_details_technician_user_id` (`technician_user_id`),
  KEY `idx_maintenance_details_supplier_id` (`supplier_id`),
  CONSTRAINT `fk_maintenance_details_maintenance_event_id` FOREIGN KEY (`maintenance_event_id`) REFERENCES `maintenance_events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_maintenance_details_asset_id` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_maintenance_details_technician_user_id` FOREIGN KEY (`technician_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_maintenance_details_supplier_id` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `disposal_details` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `disposal_id` BIGINT UNSIGNED NOT NULL,
  `asset_id` BIGINT UNSIGNED NOT NULL,
  `condition_summary` VARCHAR(255) NULL,
  `asset_book_value` DECIMAL(14, 2) NULL,
  `proceeds_amount` DECIMAL(14, 2) NULL,
  `processed_at` TIMESTAMP NULL DEFAULT NULL,
  `note` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_disposal_details_asset_processed` (`asset_id`, `processed_at`),
  KEY `idx_disposal_details_disposal_id` (`disposal_id`),
  CONSTRAINT `fk_disposal_details_disposal_id` FOREIGN KEY (`disposal_id`) REFERENCES `disposals` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_disposal_details_asset_id` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `inventory_checks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NULL,
  `check_date` DATE NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'in_progress',
  `created_by_user_id` BIGINT UNSIGNED NULL,
  `completed_by_user_id` BIGINT UNSIGNED NULL,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `location` VARCHAR(255) NULL,
  `note` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_inventory_checks_code` (`code`),
  KEY `idx_inventory_checks_status_check_date` (`status`, `check_date`),
  KEY `idx_inventory_checks_created_by_user_id` (`created_by_user_id`),
  KEY `idx_inventory_checks_completed_by_user_id` (`completed_by_user_id`),
  CONSTRAINT `fk_inventory_checks_created_by_user_id` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_inventory_checks_completed_by_user_id` FOREIGN KEY (`completed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `inventory_check_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `inventory_check_id` BIGINT UNSIGNED NOT NULL,
  `asset_id` BIGINT UNSIGNED NOT NULL,
  `expected_status` VARCHAR(30) NULL,
  `actual_status` VARCHAR(30) NULL,
  `expected_location` VARCHAR(255) NULL,
  `actual_location` VARCHAR(255) NULL,
  `result` VARCHAR(30) NOT NULL DEFAULT 'pending',
  `condition_note` TEXT NULL,
  `counted_by_user_id` BIGINT UNSIGNED NULL,
  `checked_at` TIMESTAMP NULL DEFAULT NULL,
  `note` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventory_check_asset_unique` (`inventory_check_id`, `asset_id`),
  KEY `idx_inventory_check_items_asset_result` (`asset_id`, `result`),
  KEY `idx_inventory_check_items_counted_by_user_id` (`counted_by_user_id`),
  CONSTRAINT `fk_inventory_check_items_inventory_check_id` FOREIGN KEY (`inventory_check_id`) REFERENCES `inventory_checks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inventory_check_items_asset_id` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inventory_check_items_counted_by_user_id` FOREIGN KEY (`counted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
