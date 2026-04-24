-- SQLite schema generated from Laravel migrations.
-- Source: php artisan migrate:fresh on a temporary SQLite database.

PRAGMA foreign_keys=OFF;

CREATE TABLE "account_roles" ("user_id" integer not null, "role_id" integer not null, "assigned_at" datetime, "status" varchar not null default 'active', "note" text, "created_at" datetime, "updated_at" datetime, foreign key("user_id") references "users"("id") on delete cascade, foreign key("role_id") references "roles"("id") on delete cascade, primary key ("user_id", "role_id"));

CREATE TABLE "approvals" ("id" integer primary key autoincrement not null, "approvable_type" varchar not null, "approvable_id" integer not null, "reviewer_user_id" integer, "status" varchar not null, "note" text, "acted_at" datetime, "created_at" datetime, "updated_at" datetime, foreign key("reviewer_user_id") references "users"("id") on delete set null);

CREATE TABLE "asset_assignments" ("id" integer primary key autoincrement not null, "asset_id" integer not null, "employee_id" integer, "assigned_by" integer not null, "assigned_at" datetime not null, "unassigned_at" datetime, "created_at" datetime, "updated_at" datetime, "department_name" varchar, foreign key("assigned_by") references users("id") on delete restrict on update no action, foreign key("employee_id") references employees("id") on delete cascade on update no action, foreign key("asset_id") references assets("id") on delete cascade on update no action);

CREATE TABLE "asset_checkins" ("id" integer primary key autoincrement not null, "asset_id" integer not null, "employee_id" integer not null, "shift_id" integer not null, "shift_date" date not null, "checked_in_at" datetime not null, "checked_out_at" datetime, "source" varchar check ("source" in ('qr', 'manual')) not null default 'manual', "notes" text, "created_at" datetime, "updated_at" datetime, foreign key("asset_id") references "assets"("id") on delete cascade, foreign key("employee_id") references "users"("id") on delete cascade, foreign key("shift_id") references "shifts"("id") on delete cascade);

CREATE TABLE "asset_code_sequences" ("id" integer primary key autoincrement not null, "prefix" varchar not null, "year_month" varchar not null, "last_number" integer not null default '0', "created_at" datetime, "updated_at" datetime);

CREATE TABLE "asset_qr_identities" ("id" integer primary key autoincrement not null, "qr_uid" varchar not null, "asset_id" integer not null, "payload_version" varchar not null default 'v1', "printed_at" datetime, "created_at" datetime, "updated_at" datetime, foreign key("asset_id") references "assets"("id") on delete cascade);

CREATE TABLE "assets" ("id" integer primary key autoincrement not null, "asset_code" varchar, "name" varchar not null, "type" varchar not null default ('equipment'), "status" varchar not null default ('active'), "notes" text, "created_at" datetime, "updated_at" datetime, "deleted_at" datetime, "instructions_url" text, "purchase_date" date, "purchase_cost" numeric, "useful_life_months" integer, "salvage_value" numeric not null default ('0'), "depreciation_method" varchar not null default ('TIME'), "category" varchar, "location" varchar, "warranty_expiry" date, "off_service_reason" varchar, "off_service_from" datetime, "off_service_until" datetime, "off_service_set_by" integer, "category_id" integer, "supplier_id" integer, "warranty_period_months" integer, "depreciation_rate" numeric, "qr_value" varchar, "qr_image_path" varchar, foreign key("off_service_set_by") references users("id") on delete set null on update no action, foreign key("category_id") references "categories"("id") on delete set null, foreign key("supplier_id") references "suppliers"("id") on delete set null);

CREATE TABLE "cache" ("key" varchar not null, "value" text not null, "expiration" integer not null, primary key ("key"));

CREATE TABLE "cache_locks" ("key" varchar not null, "owner" varchar not null, "expiration" integer not null, primary key ("key"));

CREATE TABLE "categories" ("id" integer primary key autoincrement not null, "code" varchar not null, "name" varchar not null, "description" text, "created_at" datetime, "updated_at" datetime);

CREATE TABLE "disposal_details" ("id" integer primary key autoincrement not null, "disposal_id" integer not null, "asset_id" integer not null, "condition_summary" varchar, "asset_book_value" numeric, "proceeds_amount" numeric, "processed_at" datetime, "note" text, "created_at" datetime, "updated_at" datetime, foreign key("disposal_id") references "disposals"("id") on delete cascade, foreign key("asset_id") references "assets"("id") on delete cascade);

CREATE TABLE "disposals" ("id" integer primary key autoincrement not null, "code" varchar not null, "asset_id" integer not null, "method" varchar not null default 'destroy', "reason" text not null, "disposed_by_user_id" integer, "approved_by_user_id" integer, "disposed_at" datetime not null, "asset_book_value" numeric, "proceeds_amount" numeric, "note" text, "created_at" datetime, "updated_at" datetime, foreign key("asset_id") references "assets"("id") on delete cascade, foreign key("disposed_by_user_id") references "users"("id") on delete set null, foreign key("approved_by_user_id") references "users"("id") on delete set null);

CREATE TABLE "employee_contracts" ("id" integer primary key autoincrement not null, "employee_id" integer not null, "department" varchar, "contract_type" varchar not null, "start_date" date not null, "end_date" date, "status" varchar not null default 'ACTIVE', "pdf_path" varchar, "created_by" integer, "created_at" datetime, "updated_at" datetime, foreign key("employee_id") references "employees"("id") on delete cascade, foreign key("created_by") references "users"("id") on delete set null);

CREATE TABLE "employees" ("id" integer primary key autoincrement not null, "employee_code" varchar not null, "full_name" varchar not null, "position" varchar, "dob" date, "gender" varchar check ("gender" in ('male', 'female', 'other')), "phone" varchar, "email" varchar not null, "address" text, "status" varchar check ("status" in ('active', 'inactive')) not null default 'active', "created_at" datetime, "updated_at" datetime, "department" varchar);

CREATE TABLE "failed_jobs" ("id" integer primary key autoincrement not null, "uuid" varchar not null, "connection" text not null, "queue" text not null, "payload" text not null, "exception" text not null, "failed_at" datetime not null default CURRENT_TIMESTAMP);

CREATE TABLE "feedbacks" ("id" integer primary key autoincrement not null, "code" varchar not null, "user_id" integer not null, "asset_id" integer, "maintenance_event_id" integer, "content" text not null, "rating" integer, "status" varchar check ("status" in ('new', 'in_progress', 'resolved')) not null default 'new', "type" varchar check ("type" in ('issue', 'suggestion', 'praise', 'other')) not null default 'other', "response" text, "resolved_by" integer, "resolved_at" datetime, "created_at" datetime, "updated_at" datetime, "deleted_at" datetime, foreign key("user_id") references "users"("id") on delete cascade, foreign key("asset_id") references "assets"("id") on delete set null, foreign key("maintenance_event_id") references "maintenance_events"("id") on delete set null, foreign key("resolved_by") references "users"("id") on delete set null);

CREATE TABLE "inventory_check_items" ("id" integer primary key autoincrement not null, "inventory_check_id" integer not null, "asset_id" integer not null, "expected_status" varchar, "actual_status" varchar, "expected_location" varchar, "actual_location" varchar, "result" varchar not null default 'pending', "condition_note" text, "counted_by_user_id" integer, "checked_at" datetime, "note" text, "created_at" datetime, "updated_at" datetime, foreign key("inventory_check_id") references "inventory_checks"("id") on delete cascade, foreign key("asset_id") references "assets"("id") on delete cascade, foreign key("counted_by_user_id") references "users"("id") on delete set null);

CREATE TABLE "inventory_checks" ("id" integer primary key autoincrement not null, "code" varchar not null, "title" varchar, "check_date" date not null, "status" varchar not null default 'in_progress', "created_by_user_id" integer, "completed_by_user_id" integer, "completed_at" datetime, "location" varchar, "note" text, "created_at" datetime, "updated_at" datetime, foreign key("created_by_user_id") references "users"("id") on delete set null, foreign key("completed_by_user_id") references "users"("id") on delete set null);

CREATE TABLE "job_batches" ("id" varchar not null, "name" varchar not null, "total_jobs" integer not null, "pending_jobs" integer not null, "failed_jobs" integer not null, "failed_job_ids" text not null, "options" text, "cancelled_at" integer, "created_at" integer not null, "finished_at" integer, primary key ("id"));

CREATE TABLE "jobs" ("id" integer primary key autoincrement not null, "queue" varchar not null, "payload" text not null, "attempts" integer not null, "reserved_at" integer, "available_at" integer not null, "created_at" integer not null);

CREATE TABLE "locations" ("id" integer primary key autoincrement not null, "name" varchar not null, "description" text, "address" varchar, "is_active" tinyint(1) not null default '1', "created_at" datetime, "updated_at" datetime);

CREATE TABLE "maintenance_details" ("id" integer primary key autoincrement not null, "maintenance_event_id" integer not null, "asset_id" integer not null, "technician_user_id" integer, "supplier_id" integer, "status" varchar not null default 'scheduled', "issue_description" text, "action_taken" text, "cost" numeric, "started_at" datetime, "completed_at" datetime, "logged_at" datetime, "created_at" datetime, "updated_at" datetime, "qty" integer not null default '1', foreign key("maintenance_event_id") references "maintenance_events"("id") on delete cascade, foreign key("asset_id") references "assets"("id") on delete cascade, foreign key("technician_user_id") references "users"("id") on delete set null, foreign key("supplier_id") references "suppliers"("id") on delete set null);

CREATE TABLE "maintenance_events" ("id" integer primary key autoincrement not null, "code" varchar not null, "asset_id" integer not null, "type" varchar not null, "status" varchar not null default ('scheduled'), "planned_at" datetime not null, "priority" varchar not null default ('normal'), "started_at" datetime, "completed_at" datetime, "note" text, "result_note" text, "estimated_duration_minutes" integer, "actual_duration_minutes" integer, "cost" numeric, "assigned_to" varchar, "created_by" integer, "updated_by" integer, "created_at" datetime, "updated_at" datetime, "deleted_at" datetime, "assigned_to_user_id" integer, foreign key("updated_by") references users("id") on delete set null on update no action, foreign key("created_by") references users("id") on delete set null on update no action, foreign key("asset_id") references assets("id") on delete cascade on update no action, foreign key("assigned_to_user_id") references "users"("id") on delete set null);

CREATE TABLE "migrations" ("id" integer primary key autoincrement not null, "migration" varchar not null, "batch" integer not null);

CREATE TABLE "password_reset_codes" ("id" integer primary key autoincrement not null, "email" varchar not null, "code_hash" varchar not null, "expires_at" datetime not null, "used_at" datetime, "resend_available_at" datetime, "last_sent_at" datetime, "created_at" datetime, "updated_at" datetime);

CREATE TABLE "password_reset_tokens" ("email" varchar not null, "token" varchar not null, "created_at" datetime, primary key ("email"));

CREATE TABLE "permissions" ("id" integer primary key autoincrement not null, "code" varchar not null, "name" varchar not null, "description" text, "created_at" datetime, "updated_at" datetime);

CREATE TABLE "personal_access_tokens" ("id" integer primary key autoincrement not null, "tokenable_type" varchar not null, "tokenable_id" integer not null, "name" text not null, "token" varchar not null, "abilities" text, "last_used_at" datetime, "expires_at" datetime, "created_at" datetime, "updated_at" datetime);

CREATE TABLE "purchase_order_items" ("id" integer primary key autoincrement not null, "purchase_order_id" integer not null, "asset_id" integer, "category_id" integer, "item_name" varchar not null, "qty" numeric not null default '1', "unit" varchar, "unit_price" numeric, "line_total" numeric, "note" text, "created_at" datetime, "updated_at" datetime, foreign key("purchase_order_id") references "purchase_orders"("id") on delete cascade, foreign key("asset_id") references "assets"("id") on delete set null, foreign key("category_id") references "categories"("id") on delete set null);

CREATE TABLE "purchase_orders" ("id" integer primary key autoincrement not null, "order_code" varchar not null, "supplier_id" integer, "requested_by_user_id" integer, "approved_by_user_id" integer, "order_date" date, "expected_delivery_date" date, "status" varchar not null default 'draft', "total_amount" numeric, "note" text, "created_at" datetime, "updated_at" datetime, "payment_method" varchar, foreign key("supplier_id") references "suppliers"("id") on delete set null, foreign key("requested_by_user_id") references "users"("id") on delete set null, foreign key("approved_by_user_id") references "users"("id") on delete set null);

CREATE TABLE "repair_logs" ("id" integer primary key autoincrement not null, "asset_id" integer not null, "maintenance_event_id" integer, "technician_user_id" integer, "supplier_id" integer, "status" varchar not null default 'scheduled', "issue_description" text, "action_taken" text, "cost" numeric, "started_at" datetime, "completed_at" datetime, "logged_at" datetime, "created_at" datetime, "updated_at" datetime, foreign key("asset_id") references "assets"("id") on delete cascade, foreign key("maintenance_event_id") references "maintenance_events"("id") on delete set null, foreign key("technician_user_id") references "users"("id") on delete set null, foreign key("supplier_id") references "suppliers"("id") on delete set null);

CREATE TABLE "role_permissions" ("role_id" integer not null, "permission_id" integer not null, "granted_at" datetime, "note" text, "created_at" datetime, "updated_at" datetime, foreign key("role_id") references "roles"("id") on delete cascade, foreign key("permission_id") references "permissions"("id") on delete cascade, primary key ("role_id", "permission_id"));

CREATE TABLE "roles" ("id" integer primary key autoincrement not null, "code" varchar not null, "name" varchar not null, "description" text, "is_active" tinyint(1) not null default '1', "created_at" datetime, "updated_at" datetime);

CREATE TABLE "sessions" ("id" varchar not null, "user_id" integer, "ip_address" varchar, "user_agent" text, "payload" text not null, "last_activity" integer not null, primary key ("id"));

CREATE TABLE "shifts" ("id" integer primary key autoincrement not null, "code" varchar not null, "name" varchar not null, "start_time" time not null, "end_time" time not null, "is_active" tinyint(1) not null default '1', "sort_order" integer not null default '0', "created_at" datetime, "updated_at" datetime);

CREATE TABLE "suppliers" ("id" integer primary key autoincrement not null, "code" varchar, "name" varchar not null, "contact_person" varchar, "phone" varchar, "email" varchar, "address" text, "note" text, "created_at" datetime, "updated_at" datetime);

CREATE TABLE "users" ("id" integer primary key autoincrement not null, "name" varchar not null, "email" varchar not null, "email_verified_at" datetime, "password" varchar not null, "remember_token" varchar, "created_at" datetime, "updated_at" datetime, "employee_code" varchar not null, "role" varchar not null default ('employee'), "status" varchar not null default ('active'), "employee_id" integer, "must_change_password" tinyint(1) not null default ('0'), "role_id" integer, "supplier_id" integer, foreign key("role_id") references roles("id") on delete set null on update no action, foreign key("employee_id") references employees("id") on delete cascade on update no action, foreign key("supplier_id") references "suppliers"("id") on delete set null);

CREATE INDEX "account_roles_role_id_status_index" on "account_roles" ("role_id", "status");

CREATE INDEX "approvals_approvable_idx" on "approvals" ("approvable_type", "approvable_id");

CREATE INDEX "approvals_status_acted_at_index" on "approvals" ("status", "acted_at");

CREATE INDEX "asset_assignments_asset_id_unassigned_at_index" on "asset_assignments" ("asset_id", "unassigned_at");

CREATE INDEX "asset_assignments_department_active_idx" on "asset_assignments" ("department_name", "unassigned_at");

CREATE INDEX "asset_assignments_employee_id_unassigned_at_index" on "asset_assignments" ("employee_id", "unassigned_at");

CREATE INDEX "asset_checkins_checked_in_at_index" on "asset_checkins" ("checked_in_at");

CREATE INDEX "asset_checkins_employee_id_shift_date_index" on "asset_checkins" ("employee_id", "shift_date");

CREATE INDEX "asset_checkins_shift_date_shift_id_index" on "asset_checkins" ("shift_date", "shift_id");

CREATE UNIQUE INDEX "asset_code_seq_prefix_ym_unique" on "asset_code_sequences" ("prefix", "year_month");

CREATE INDEX "asset_qr_identities_qr_uid_index" on "asset_qr_identities" ("qr_uid");

CREATE UNIQUE INDEX "asset_qr_identities_qr_uid_unique" on "asset_qr_identities" ("qr_uid");

CREATE UNIQUE INDEX "assets_asset_code_unique" on "assets" ("asset_code");

CREATE INDEX "assets_category_index" on "assets" ("category");

CREATE INDEX "assets_deleted_at_index" on "assets" ("deleted_at");

CREATE INDEX "assets_location_index" on "assets" ("location");

CREATE INDEX "assets_purchase_date_index" on "assets" ("purchase_date");

CREATE INDEX "assets_status_index" on "assets" ("status");

CREATE INDEX "assets_status_off_service_from_index" on "assets" ("status", "off_service_from");

CREATE INDEX "assets_type_index" on "assets" ("type");

CREATE INDEX "cache_expiration_index" on "cache" ("expiration");

CREATE INDEX "cache_locks_expiration_index" on "cache_locks" ("expiration");

CREATE UNIQUE INDEX "categories_code_unique" on "categories" ("code");

CREATE UNIQUE INDEX "categories_name_unique" on "categories" ("name");

CREATE INDEX "disposal_details_asset_id_processed_at_index" on "disposal_details" ("asset_id", "processed_at");

CREATE UNIQUE INDEX "disposals_code_unique" on "disposals" ("code");

CREATE INDEX "disposals_method_disposed_at_index" on "disposals" ("method", "disposed_at");

CREATE INDEX "employee_contracts_employee_id_index" on "employee_contracts" ("employee_id");

CREATE INDEX "employee_contracts_employee_id_status_index" on "employee_contracts" ("employee_id", "status");

CREATE INDEX "employee_contracts_start_date_index" on "employee_contracts" ("start_date");

CREATE INDEX "employee_contracts_status_index" on "employee_contracts" ("status");

CREATE UNIQUE INDEX "employees_email_unique" on "employees" ("email");

CREATE UNIQUE INDEX "employees_employee_code_unique" on "employees" ("employee_code");

CREATE UNIQUE INDEX "failed_jobs_uuid_unique" on "failed_jobs" ("uuid");

CREATE UNIQUE INDEX "feedbacks_code_unique" on "feedbacks" ("code");

CREATE INDEX "feedbacks_status_index" on "feedbacks" ("status");

CREATE INDEX "feedbacks_type_index" on "feedbacks" ("type");

CREATE INDEX "feedbacks_user_id_created_at_index" on "feedbacks" ("user_id", "created_at");

CREATE UNIQUE INDEX "inventory_check_asset_unique" on "inventory_check_items" ("inventory_check_id", "asset_id");

CREATE INDEX "inventory_check_items_asset_id_result_index" on "inventory_check_items" ("asset_id", "result");

CREATE UNIQUE INDEX "inventory_checks_code_unique" on "inventory_checks" ("code");

CREATE INDEX "inventory_checks_status_check_date_index" on "inventory_checks" ("status", "check_date");

CREATE INDEX "jobs_queue_index" on "jobs" ("queue");

CREATE UNIQUE INDEX "locations_name_unique" on "locations" ("name");

CREATE INDEX "maintenance_details_asset_id_status_index" on "maintenance_details" ("asset_id", "status");

CREATE UNIQUE INDEX "maintenance_details_event_asset_unique" on "maintenance_details" ("maintenance_event_id", "asset_id");

CREATE INDEX "maintenance_events_asset_id_status_index" on "maintenance_events" ("asset_id", "status");

CREATE UNIQUE INDEX "maintenance_events_code_unique" on "maintenance_events" ("code");

CREATE INDEX "maintenance_events_planned_at_index" on "maintenance_events" ("planned_at");

CREATE INDEX "maintenance_events_status_planned_at_index" on "maintenance_events" ("status", "planned_at");

CREATE INDEX "maintenance_events_type_index" on "maintenance_events" ("type");

CREATE INDEX "password_reset_codes_email_expires_at_index" on "password_reset_codes" ("email", "expires_at");

CREATE INDEX "password_reset_codes_email_index" on "password_reset_codes" ("email");

CREATE UNIQUE INDEX "permissions_code_unique" on "permissions" ("code");

CREATE INDEX "personal_access_tokens_expires_at_index" on "personal_access_tokens" ("expires_at");

CREATE UNIQUE INDEX "personal_access_tokens_token_unique" on "personal_access_tokens" ("token");

CREATE INDEX "personal_access_tokens_tokenable_type_tokenable_id_index" on "personal_access_tokens" ("tokenable_type", "tokenable_id");

CREATE UNIQUE INDEX "purchase_orders_order_code_unique" on "purchase_orders" ("order_code");

CREATE INDEX "purchase_orders_status_order_date_index" on "purchase_orders" ("status", "order_date");

CREATE INDEX "repair_logs_asset_id_status_index" on "repair_logs" ("asset_id", "status");

CREATE INDEX "role_permissions_permission_id_index" on "role_permissions" ("permission_id");

CREATE UNIQUE INDEX "roles_code_unique" on "roles" ("code");

CREATE INDEX "sessions_last_activity_index" on "sessions" ("last_activity");

CREATE INDEX "sessions_user_id_index" on "sessions" ("user_id");

CREATE UNIQUE INDEX "shifts_code_unique" on "shifts" ("code");

CREATE INDEX "shifts_is_active_index" on "shifts" ("is_active");

CREATE INDEX "shifts_sort_order_index" on "shifts" ("sort_order");

CREATE UNIQUE INDEX "suppliers_code_unique" on "suppliers" ("code");

CREATE UNIQUE INDEX "suppliers_name_unique" on "suppliers" ("name");

CREATE UNIQUE INDEX "unique_asset_shift_date" on "asset_checkins" ("asset_id", "shift_id", "shift_date");

CREATE UNIQUE INDEX "users_email_unique" on "users" ("email");

CREATE UNIQUE INDEX "users_employee_code_unique" on "users" ("employee_code");

CREATE UNIQUE INDEX "users_supplier_id_unique" on "users" ("supplier_id");
