# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2026_04_28_120000) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "abonents", force: :cascade do |t|
    t.string "phone", null: false
    t.string "email", default: ""
    t.string "unconfirmed_email"
    t.string "confirmation_token"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "bonus_rate", default: 2
    t.check_constraint "length((phone)::text) > 0", name: "abonents_phone_check"
  end

  create_table "agreement_documents", force: :cascade do |t|
    t.string "title"
    t.string "doc_type"
    t.string "status", default: "created"
    t.integer "agrm_id"
    t.string "doc_url"
    t.string "external_uid"
    t.string "doc_token"
    t.string "guid"
    t.string "file_url"
    t.string "doc_error"
    t.boolean "archive", default: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.datetime "url_expired"
    t.string "file_status", default: "file_none"
  end

  create_table "agreements", force: :cascade do |t|
    t.integer "external_id"
    t.string "number"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "articles", force: :cascade do |t|
    t.string "title"
    t.text "content"
    t.string "poster"
    t.string "video_url"
    t.string "video_poster"
    t.json "meta", default: {}
    t.json "tags", default: []
    t.boolean "active", default: true
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "asterisk_calls", force: :cascade do |t|
    t.bigint "asterisk_id"
    t.datetime "start_time"
    t.datetime "start_time_last"
    t.datetime "end_time"
    t.string "linkedid"
    t.string "from_num"
    t.string "to_num"
    t.string "from_chan"
    t.string "to_chan"
    t.string "recordingfile"
    t.string "status"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "auto_payment_methods", force: :cascade do |t|
    t.decimal "amount", null: false
    t.datetime "date", null: false
    t.bigint "abonent_id", null: false
    t.bigint "agrm_id", null: false
    t.string "service", default: "sberbank", null: false
    t.string "status", default: "created", null: false
    t.string "pay_token"
    t.string "merchant_order_id"
    t.jsonb "card", default: {}
    t.jsonb "payer_data", default: {}
    t.boolean "active", default: false, null: false
    t.datetime "deleted_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["abonent_id"], name: "index_auto_payment_methods_on_abonent_id"
    t.index ["agrm_id", "abonent_id"], name: "auto_payment_unique_idx", unique: true, where: "((active = true) AND (deleted_at IS NULL))"
  end

  create_table "available_services", force: :cascade do |t|
    t.integer "building_id"
    t.integer "tar_id"
    t.integer "tar_id_free"
    t.string "service_type"
    t.string "service_name"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "blocking_services", force: :cascade do |t|
    t.bigint "agrm_id", null: false
    t.bigint "abonent_id", null: false
    t.datetime "from_date", null: false
    t.datetime "to_date", null: false
    t.string "status", default: "created", null: false
    t.boolean "active", default: true, null: false
    t.integer "request_ids", default: [], array: true
    t.datetime "deleted_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["abonent_id"], name: "index_blocking_services_on_abonent_id"
  end

  create_table "bonus_charges", force: :cascade do |t|
    t.integer "agrm_id"
    t.integer "lb_payment_id"
    t.integer "lk_payment_id"
    t.decimal "amount"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "comment"
    t.index ["lk_payment_id"], name: "index_bonus_charges_on_lk_payment_id", unique: true
  end

  create_table "bonuses", force: :cascade do |t|
    t.integer "agrm_id"
    t.decimal "amount"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["agrm_id"], name: "index_bonuses_on_agrm_id", unique: true
  end

  create_table "call_reasons", force: :cascade do |t|
    t.string "name", null: false
    t.integer "position"
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "group"
  end

  create_table "calls", force: :cascade do |t|
    t.bigint "lb_manager_id", null: false
    t.bigint "lb_account_id", null: false
    t.bigint "call_reason_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["call_reason_id"], name: "index_calls_on_call_reason_id"
    t.index ["lb_account_id"], name: "index_calls_on_lb_account_id"
    t.index ["lb_manager_id"], name: "index_calls_on_lb_manager_id"
  end

  create_table "camera_agreements", force: :cascade do |t|
    t.integer "camera_id"
    t.integer "agrm_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "cameras", force: :cascade do |t|
    t.string "token", null: false
    t.string "name", null: false
    t.string "camera_type"
    t.string "secure_token"
    t.boolean "is_private", default: false
    t.boolean "is_archive", default: false
    t.string "street"
    t.string "building"
    t.float "longitude"
    t.float "latitude"
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "slug", default: -> { "(gen_random_uuid())::text" }
    t.string "model"
    t.string "serial"
    t.string "mac"
    t.string "ip"
    t.string "description"
    t.string "screenshot"
    t.integer "archive_depth"
    t.string "rtsp_url"
    t.integer "server_id", default: 1
    t.index ["slug"], name: "index_cameras_on_slug", unique: true
  end

  create_table "cameras_boards", force: :cascade do |t|
    t.integer "abonent_id"
    t.integer "camera_id"
    t.integer "position"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "channels", force: :cascade do |t|
    t.string "name"
    t.string "number"
    t.string "frequency"
    t.string "site_url"
    t.jsonb "tags", default: []
    t.string "icon"
    t.string "video_poster"
    t.string "video_url"
    t.boolean "active", default: true
    t.integer "category_id", default: 0
    t.text "description"
    t.text "video_html"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["category_id"], name: "index_channels_on_category_id"
  end

  create_table "debtors", force: :cascade do |t|
    t.integer "agrm_id"
    t.integer "balance"
    t.integer "fee"
    t.string "status"
    t.bigint "request_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "agrm_type"
    t.string "tar_ids", array: true
    t.index ["request_id"], name: "index_debtors_on_request_id"
  end

  create_table "departments", force: :cascade do |t|
    t.string "name", null: false
    t.string "description"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "devices", force: :cascade do |t|
    t.integer "external_id"
    t.string "name"
    t.string "ip"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "documents", force: :cascade do |t|
    t.string "related_obj_type"
    t.bigint "related_obj_id"
    t.string "title"
    t.string "file"
    t.boolean "active", default: true
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.datetime "deleted_at"
    t.bigint "parent_id"
    t.string "doc_type", default: "file"
    t.index ["deleted_at"], name: "index_documents_on_deleted_at"
    t.index ["parent_id"], name: "index_documents_on_parent_id"
    t.index ["related_obj_type", "related_obj_id"], name: "index_documents_on_related_obj"
  end

  create_table "dogovors", force: :cascade do |t|
    t.bigint "abonent_id"
    t.boolean "confirmed", default: false
    t.boolean "default", default: false
    t.string "street"
    t.string "building"
    t.string "flat"
    t.integer "agrm_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.datetime "blocked_at"
    t.index ["abonent_id"], name: "index_dogovors_on_abonent_id"
  end

  create_table "equipment", force: :cascade do |t|
    t.string "identifier"
    t.string "model"
    t.string "brand"
    t.string "serial_number"
    t.bigint "equipment_type_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "comment"
    t.index ["equipment_type_id"], name: "index_equipment_on_equipment_type_id"
  end

  create_table "equipment_locations", force: :cascade do |t|
    t.bigint "equipment_id"
    t.string "location_type"
    t.bigint "location_id"
    t.string "status"
    t.integer "changed_by"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "deleted_at"
    t.jsonb "coords", default: {}
    t.index ["equipment_id"], name: "index_equipment_locations_on_equipment_id"
    t.index ["location_type", "location_id"], name: "index_type_and_location_id"
  end

  create_table "equipment_types", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "expense_companies", force: :cascade do |t|
    t.string "name", null: false
    t.boolean "active", default: true
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "short_chain", default: false
  end

  create_table "expense_counterparties", force: :cascade do |t|
    t.string "name", null: false
    t.string "inn", null: false
    t.boolean "active", default: true
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "expense_purposes", force: :cascade do |t|
    t.string "name", null: false
    t.boolean "active", default: true
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "expense_type_id"
    t.index ["expense_type_id"], name: "index_expense_purposes_on_expense_type_id"
  end

  create_table "expense_stages", force: :cascade do |t|
    t.string "name", null: false
    t.integer "alert_timer"
    t.bigint "expense_type_id", null: false
    t.boolean "active", default: true
    t.integer "priority"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "user_id"
    t.boolean "required", default: true
    t.index ["expense_type_id"], name: "index_expense_stages_on_expense_type_id"
    t.index ["user_id"], name: "index_expense_stages_on_user_id"
  end

  create_table "expense_templates", force: :cascade do |t|
    t.integer "quantity", null: false
    t.string "unit", null: false
    t.bigint "expense_id"
    t.datetime "expense_date"
    t.datetime "deleted_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["expense_id"], name: "index_expense_templates_on_expense_id"
  end

  create_table "expense_types", force: :cascade do |t|
    t.string "name", null: false
    t.boolean "active", default: true
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "expenses", force: :cascade do |t|
    t.string "name", null: false
    t.string "description"
    t.string "comment"
    t.float "amount", default: 0.0
    t.bigint "author_id"
    t.bigint "expense_type_id", null: false
    t.bigint "expense_stage_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "pay_type", default: "noncash"
    t.string "counterparty"
    t.datetime "date_payment"
    t.datetime "plan_date_payment"
    t.bigint "expense_purpose_id"
    t.string "flow_rate", default: "opex"
    t.bigint "expense_company_id"
    t.string "status", default: "at_work", null: false
    t.boolean "repeatable", default: false
    t.bigint "expense_counterparty_id"
    t.datetime "checked_at"
    t.index ["author_id"], name: "index_expenses_on_author_id"
    t.index ["expense_company_id"], name: "index_expenses_on_expense_company_id"
    t.index ["expense_counterparty_id"], name: "index_expenses_on_expense_counterparty_id"
    t.index ["expense_purpose_id"], name: "index_expenses_on_expense_purpose_id"
    t.index ["expense_stage_id"], name: "index_expenses_on_expense_stage_id"
    t.index ["expense_type_id"], name: "index_expenses_on_expense_type_id"
  end

  create_table "faqs", force: :cascade do |t|
    t.string "title", null: false
    t.text "content"
    t.boolean "enabled"
    t.integer "parent_id"
    t.integer "lft", null: false
    t.integer "rgt", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["lft"], name: "index_faqs_on_lft"
    t.index ["parent_id"], name: "index_faqs_on_parent_id"
    t.index ["rgt"], name: "index_faqs_on_rgt"
  end

  create_table "irc_account_saldos", force: :cascade do |t|
    t.string "agrm_number"
    t.decimal "fee"
    t.decimal "saldo"
    t.date "date"
    t.string "address"
    t.jsonb "details", default: {}
    t.integer "agrm_id"
    t.decimal "billing_fee"
    t.decimal "billing_saldo"
    t.decimal "billing_address"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "irc_payments", force: :cascade do |t|
    t.integer "irc_id"
    t.string "account_number", null: false
    t.decimal "amount"
    t.date "paid_at"
    t.date "added_at"
    t.integer "status", default: 0
    t.integer "lanbilling_id"
    t.string "lanbilling_error"
    t.json "data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["added_at"], name: "index_irc_payments_on_added_at"
    t.index ["irc_id"], name: "index_irc_payments_on_irc_id"
    t.index ["paid_at"], name: "index_irc_payments_on_paid_at"
    t.index ["status"], name: "index_irc_payments_on_status"
  end

  create_table "lk_payment_users", id: :serial, force: :cascade do |t|
    t.integer "abonent_id"
    t.integer "lk_payment_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "lk_payments", force: :cascade do |t|
    t.integer "agrm_id"
    t.string "invoice_number", null: false
    t.decimal "amount", null: false
    t.integer "status", default: 0
    t.integer "ofd_status", default: 0
    t.integer "lb_status", default: 0
    t.json "response"
    t.json "ofd_response"
    t.json "lb_response"
    t.string "order_id"
    t.string "session_id"
    t.string "customer_name"
    t.string "customer_email"
    t.string "customer_phone"
    t.string "customer_address"
    t.string "description"
    t.boolean "charge_bonus", default: false
    t.string "provider"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "abonent_id"
    t.string "source"
    t.bigint "auto_payment_method_id"
    t.index ["auto_payment_method_id"], name: "index_lk_payments_on_auto_payment_method_id"
    t.index ["order_id", "session_id"], name: "index_lk_payments_on_order_id_and_session_id", unique: true
    t.check_constraint "(provider)::text = ANY (ARRAY[('sberbank'::character varying)::text, ('yookassa'::character varying)::text, ('minbank'::character varying)::text, ('yookassa_sbp'::character varying)::text])", name: "provider_check"
  end

  create_table "notification_rules", force: :cascade do |t|
    t.bigint "user_id"
    t.string "target_type"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "searcheble_types", default: [], array: true
    t.string "searcheble_fields", default: [], array: true
    t.string "dislay_fields", default: [], array: true
    t.index ["user_id"], name: "index_notification_rules_on_user_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.string "notification_type", null: false
    t.integer "status"
    t.json "data"
    t.integer "recipient_id"
    t.string "recipient_type"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["recipient_id", "recipient_type"], name: "index_notifications_on_recipient_id_and_recipient_type"
  end

  create_table "page_parts", force: :cascade do |t|
    t.string "name"
    t.string "content_type"
    t.text "content"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["name"], name: "index_page_parts_on_name"
  end

  create_table "payment_methods", force: :cascade do |t|
    t.integer "abonent_id", null: false
    t.string "service", default: "sberbank", null: false
    t.string "status", default: "created", null: false
    t.string "pay_token"
    t.jsonb "card", default: {}
    t.jsonb "auto_payment", default: {}
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.datetime "deleted_at"
    t.check_constraint "(status)::text = 'sberbank'::text", name: "service_check"
    t.check_constraint "(status)::text = ANY (ARRAY[('created'::character varying)::text, ('canceled'::character varying)::text, ('error'::character varying)::text, ('processing'::character varying)::text, ('ready'::character varying)::text])", name: "status_check"
  end

  create_table "payments", force: :cascade do |t|
    t.string "source_id"
    t.string "source_type"
    t.string "source_address"
    t.string "account_number", null: false
    t.decimal "amount"
    t.date "paid_at"
    t.date "added_at"
    t.integer "status", default: 0
    t.integer "lanbilling_id"
    t.string "lanbilling_error"
    t.json "data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "ofd_status", default: 0
    t.index ["added_at"], name: "index_payments_on_added_at"
    t.index ["paid_at"], name: "index_payments_on_paid_at"
    t.index ["source_id", "source_type"], name: "index_payments_on_source_id_and_source_type", unique: true
    t.index ["status"], name: "index_payments_on_status"
  end

  create_table "phone_confirmations", force: :cascade do |t|
    t.string "phone", null: false
    t.string "code", null: false
    t.integer "action", default: 1
    t.datetime "expire_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "abonent_id"
    t.integer "service_type", default: 1
    t.index ["abonent_id"], name: "index_phone_confirmations_on_abonent_id"
  end

  create_table "phone_devices", force: :cascade do |t|
    t.string "device_token", null: false
    t.integer "platform"
    t.boolean "active", default: true
    t.integer "abonent_id"
    t.boolean "permission_infos", default: true
    t.boolean "permission_bills", default: true
    t.boolean "permission_lotto", default: true
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["abonent_id"], name: "index_phone_devices_on_abonent_id"
  end

  create_table "ports", force: :cascade do |t|
    t.integer "external_id"
    t.integer "number"
    t.string "state", default: "unknown"
    t.boolean "active", default: true
    t.bigint "device_id"
    t.bigint "vgroup_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.datetime "checked_at"
    t.index ["device_id"], name: "index_ports_on_device_id"
    t.index ["vgroup_id"], name: "index_ports_on_vgroup_id"
  end

  create_table "products", force: :cascade do |t|
    t.string "title", null: false
    t.text "description"
    t.string "poster"
    t.string "file"
    t.decimal "price"
    t.boolean "active", default: true
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "project_statuses", force: :cascade do |t|
    t.string "name", null: false
    t.boolean "active", default: true
    t.bigint "project_type_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["project_type_id"], name: "index_project_statuses_on_project_type_id"
  end

  create_table "project_types", force: :cascade do |t|
    t.string "name", null: false
    t.boolean "active", default: true
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "projects", force: :cascade do |t|
    t.string "name"
    t.string "description"
    t.bigint "project_type_id", null: false
    t.bigint "responsible_user_id"
    t.datetime "plan_started_at"
    t.datetime "plan_finished_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "project_managers_ids", default: [], array: true
    t.string "status", default: "at_work", null: false
    t.index ["project_type_id"], name: "index_projects_on_project_type_id"
    t.index ["responsible_user_id"], name: "index_projects_on_responsible_user_id"
  end

  create_table "request_first_reasons", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "active", default: true
    t.bigint "request_type_id"
    t.index ["request_type_id"], name: "index_request_first_reasons_on_request_type_id"
  end

  create_table "request_reasons", force: :cascade do |t|
    t.text "description", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "service_type"
    t.string "service_location"
    t.boolean "active", default: true
    t.bigint "request_type_id"
    t.index ["request_type_id"], name: "index_request_reasons_on_request_type_id"
  end

  create_table "request_statuses", force: :cascade do |t|
    t.bigint "request_type_id", null: false
    t.integer "priority"
    t.string "name", null: false
    t.integer "alert_timer"
    t.boolean "after_finish"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "active", default: true
    t.index ["request_type_id"], name: "index_request_statuses_on_request_type_id"
  end

  create_table "request_subtypes", force: :cascade do |t|
    t.bigint "request_type_id", null: false
    t.string "name", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["request_type_id"], name: "index_request_subtypes_on_request_type_id"
  end

  create_table "request_types", force: :cascade do |t|
    t.string "name"
    t.integer "alert_timer"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "active", default: true
  end

  create_table "requests", force: :cascade do |t|
    t.bigint "request_type_id", null: false
    t.bigint "request_status_id", null: false
    t.string "resource_type"
    t.bigint "resource_id"
    t.bigint "request_reason_id"
    t.bigint "responsible_user_id"
    t.bigint "executor_user_id"
    t.string "description"
    t.text "comment"
    t.datetime "plan_started_at"
    t.datetime "plan_finished_at"
    t.datetime "status_updated_at"
    t.datetime "status_notified_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "request_subtype_id"
    t.bigint "request_first_reason_id"
    t.bigint "project_id"
    t.bigint "car_id"
    t.bigint "helper_user_id"
    t.bigint "parent_id"
    t.index ["car_id"], name: "index_requests_on_car_id"
    t.index ["executor_user_id"], name: "index_requests_on_executor_user_id"
    t.index ["helper_user_id"], name: "index_requests_on_helper_user_id"
    t.index ["parent_id"], name: "index_requests_on_parent_id"
    t.index ["project_id"], name: "index_requests_on_project_id"
    t.index ["request_first_reason_id"], name: "index_requests_on_request_first_reason_id"
    t.index ["request_reason_id"], name: "index_requests_on_request_reason_id"
    t.index ["request_status_id"], name: "index_requests_on_request_status_id"
    t.index ["request_subtype_id"], name: "index_requests_on_request_subtype_id"
    t.index ["request_type_id"], name: "index_requests_on_request_type_id"
    t.index ["resource_type", "resource_id"], name: "index_requests_on_resource"
    t.index ["responsible_user_id"], name: "index_requests_on_responsible_user_id"
  end

  create_table "reserve_spends", force: :cascade do |t|
    t.integer "reserve_id", null: false
    t.integer "saldo_id", null: false
    t.date "fee_date", null: false
    t.decimal "amount", default: "0.0"
    t.string "operation_type", default: "spend"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "status", default: "created"
  end

  create_table "reserves", force: :cascade do |t|
    t.integer "agrm_id", null: false
    t.date "date", null: false
    t.decimal "amount", default: "0.0"
    t.decimal "balance", default: "0.0"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "rpush_apps", force: :cascade do |t|
    t.string "name", null: false
    t.string "environment"
    t.text "certificate"
    t.string "password"
    t.integer "connections", default: 1, null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "type", null: false
    t.string "auth_key"
    t.string "client_id"
    t.string "client_secret"
    t.string "access_token"
    t.datetime "access_token_expiration"
    t.text "apn_key"
    t.string "apn_key_id"
    t.string "team_id"
    t.string "bundle_id"
    t.boolean "feedback_enabled", default: true
    t.string "firebase_project_id"
    t.text "json_key"
  end

  create_table "rpush_feedback", force: :cascade do |t|
    t.string "device_token"
    t.datetime "failed_at", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "app_id"
    t.index ["device_token"], name: "index_rpush_feedback_on_device_token"
  end

  create_table "rpush_notifications", force: :cascade do |t|
    t.integer "badge"
    t.string "device_token"
    t.string "sound"
    t.text "alert"
    t.text "data"
    t.integer "expiry", default: 86400
    t.boolean "delivered", default: false, null: false
    t.datetime "delivered_at"
    t.boolean "failed", default: false, null: false
    t.datetime "failed_at"
    t.integer "error_code"
    t.text "error_description"
    t.datetime "deliver_after"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "alert_is_json", default: false, null: false
    t.string "type", null: false
    t.string "collapse_key"
    t.boolean "delay_while_idle", default: false, null: false
    t.text "registration_ids"
    t.integer "app_id", null: false
    t.integer "retries", default: 0
    t.string "uri"
    t.datetime "fail_after"
    t.boolean "processing", default: false, null: false
    t.integer "priority"
    t.text "url_args"
    t.string "category"
    t.boolean "content_available", default: false, null: false
    t.text "notification"
    t.boolean "mutable_content", default: false, null: false
    t.string "external_device_id"
    t.string "thread_id"
    t.boolean "dry_run", default: false, null: false
    t.boolean "sound_is_json", default: false
    t.integer "external_notification_id"
    t.integer "external_phone_device_id"
    t.index ["delivered", "failed", "processing", "deliver_after", "created_at"], name: "index_rpush_notifications_multi", where: "((NOT delivered) AND (NOT failed))"
  end

  create_table "saldos", force: :cascade do |t|
    t.integer "agrm_id"
    t.integer "service"
    t.date "date"
    t.decimal "amount"
    t.decimal "fee_amount"
    t.decimal "payments_amount"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "search_templates", force: :cascade do |t|
    t.string "name", null: false
    t.bigint "user_id"
    t.jsonb "search_params", default: {}
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "color", default: "green"
    t.string "searchable_type", default: "expense"
    t.index ["user_id"], name: "index_search_templates_on_user_id"
  end

  create_table "site_documents", id: :bigint, default: -> { "nextval('documents_id_seq'::regclass)" }, force: :cascade do |t|
    t.string "title"
    t.string "file"
    t.boolean "active", default: true
    t.integer "position"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "sorm_accounts", force: :cascade do |t|
    t.string "row"
    t.string "md5"
    t.datetime "last_export_at", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["md5"], name: "index_sorm_accounts_on_md5"
  end

  create_table "sorm_exports", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "last_export_at", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "support_requests", force: :cascade do |t|
    t.string "phone"
    t.text "message"
    t.boolean "sent", default: false
    t.string "source_type"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "teledom_requests", force: :cascade do |t|
    t.string "status"
    t.string "subject"
    t.text "description"
    t.string "phone"
    t.bigint "user_id"
    t.bigint "agrm_id"
    t.integer "request_ids", default: [], array: true
    t.date "deleted_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["user_id"], name: "index_teledom_requests_on_user_id"
  end

  create_table "user_notifications", force: :cascade do |t|
    t.string "status", default: "created"
    t.bigint "user_id"
    t.bigint "version_id"
    t.jsonb "data"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["user_id"], name: "index_user_notifications_on_user_id"
    t.index ["version_id"], name: "index_user_notifications_on_version_id"
  end

  create_table "user_requests", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "phone"
    t.string "address"
    t.boolean "sent", default: false
    t.string "source_type"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet "current_sign_in_ip"
    t.inet "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "role"
    t.string "name"
    t.integer "lb_manager_id"
    t.string "chat_id"
    t.bigint "department_id"
    t.boolean "active", default: true
    t.date "pass_changed_at", default: "2024-09-03"
    t.index ["department_id"], name: "index_users_on_department_id"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "versions", force: :cascade do |t|
    t.string "item_type", null: false
    t.bigint "item_id", null: false
    t.string "event", null: false
    t.string "whodunnit"
    t.jsonb "object"
    t.jsonb "object_changes"
    t.datetime "created_at"
    t.index ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id"
  end

  create_table "vgroups", force: :cascade do |t|
    t.integer "external_id"
    t.bigint "agreement_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "blocked"
    t.index ["agreement_id"], name: "index_vgroups_on_agreement_id"
  end

  create_table "warehouse_material_categories", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "warehouse_material_moves", force: :cascade do |t|
    t.bigint "warehouse_material_id"
    t.integer "operation_type"
    t.decimal "quantity"
    t.bigint "user_id"
    t.bigint "created_by_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_by_id"], name: "index_warehouse_material_moves_on_created_by_id"
    t.index ["user_id"], name: "index_warehouse_material_moves_on_user_id"
    t.index ["warehouse_material_id"], name: "index_warehouse_material_moves_on_warehouse_material_id"
  end

  create_table "warehouse_materials", force: :cascade do |t|
    t.string "name", null: false
    t.string "code"
    t.string "unit", default: "piece"
    t.bigint "quantity", default: 0, null: false
    t.bigint "warehouse_material_category_id"
    t.jsonb "coords", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "unique_name", unique: true
    t.index ["warehouse_material_category_id"], name: "index_warehouse_materials_on_warehouse_material_category_id"
    t.check_constraint "quantity >= 0", name: "only_positive"
  end

  create_table "warehouses", force: :cascade do |t|
    t.string "name"
  end

  create_table "white_ip_addresses", force: :cascade do |t|
    t.string "ip", null: false
    t.string "description"
    t.string "comment", default: ""
    t.bigint "agrm_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "working_days", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.datetime "date", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["user_id"], name: "index_working_days_on_user_id"
  end

  add_foreign_key "bonus_charges", "lk_payments"
  add_foreign_key "camera_agreements", "cameras"
  add_foreign_key "cameras_boards", "abonents"
  add_foreign_key "cameras_boards", "cameras"
  add_foreign_key "documents", "documents", column: "parent_id"
  add_foreign_key "dogovors", "abonents"
  add_foreign_key "equipment", "equipment_types"
  add_foreign_key "equipment_locations", "equipment", on_delete: :cascade
  add_foreign_key "expense_purposes", "expense_types"
  add_foreign_key "expense_stages", "users"
  add_foreign_key "expense_templates", "expenses"
  add_foreign_key "expenses", "expense_companies"
  add_foreign_key "expenses", "expense_counterparties"
  add_foreign_key "expenses", "expense_purposes"
  add_foreign_key "expenses", "users", column: "author_id"
  add_foreign_key "lk_payment_users", "abonents"
  add_foreign_key "lk_payment_users", "lk_payments"
  add_foreign_key "lk_payments", "auto_payment_methods"
  add_foreign_key "phone_confirmations", "abonents"
  add_foreign_key "ports", "devices"
  add_foreign_key "ports", "vgroups"
  add_foreign_key "project_statuses", "project_types"
  add_foreign_key "projects", "project_types"
  add_foreign_key "projects", "users", column: "responsible_user_id"
  add_foreign_key "request_first_reasons", "request_types"
  add_foreign_key "request_reasons", "request_types"
  add_foreign_key "request_statuses", "request_types"
  add_foreign_key "request_subtypes", "request_types"
  add_foreign_key "requests", "projects"
  add_foreign_key "requests", "request_first_reasons"
  add_foreign_key "requests", "request_reasons"
  add_foreign_key "requests", "request_statuses"
  add_foreign_key "requests", "request_subtypes"
  add_foreign_key "requests", "request_types"
  add_foreign_key "requests", "requests", column: "parent_id"
  add_foreign_key "requests", "users", column: "car_id"
  add_foreign_key "requests", "users", column: "executor_user_id"
  add_foreign_key "requests", "users", column: "helper_user_id"
  add_foreign_key "requests", "users", column: "responsible_user_id"
  add_foreign_key "users", "departments"
  add_foreign_key "vgroups", "agreements"
  add_foreign_key "warehouse_material_moves", "users"
  add_foreign_key "warehouse_material_moves", "users", column: "created_by_id"
  add_foreign_key "warehouse_material_moves", "warehouse_materials"
  add_foreign_key "warehouse_materials", "warehouse_material_categories"
  add_foreign_key "working_days", "users"
end
