# frozen_string_literal: true
#
# Сидирующая миграция для дипломного проекта.
# Заполняет демонстрационными данными основные блоки системы:
#   - Должники (debtors) — связаны с Agreements через agrm_id
#   - Договора (agreements) — собственная таблица + ссылка на LanBilling по external_id
#   - Проекты (projects, project_types)
#   - Задачи (requests + связанные справочники: types/statuses/reasons)
#   - График сотрудников (working_days)
#   - Тайм-слоты (хранятся в requests.plan_started_at / plan_finished_at)
#
# Все демо-записи имеют ОЧЕНЬ БОЛЬШИЕ id, чтобы их нельзя было спутать
# с боевыми данными:
#   - primary keys (bigint)         → 9_000_xxx_xxx
#   - external_id / agrm_id (int32) → 999_000_xxx     (max int32 = 2_147_483_647)
#
# Миграция идемпотентна: повторный запуск ничего не сломает —
# каждая запись ищется по id, потом по «натуральному ключу», и только
# затем создаётся.
#
class SeedDemoData < ActiveRecord::Migration[6.1]
  disable_ddl_transaction!

  # ─── Базовые ID-смещения для демо-данных ────────────────────────────
  # ВАЖНО: в проде многие FK-колонки старого типа (integer / int4),
  # лимит int4 = 2_147_483_647. Поэтому ВСЕ demo-id < 2_000_000_000.
  ID_DEPARTMENTS           = 1_900_001_000
  ID_USERS                 = 1_900_002_000
  ID_PROJECT_TYPES         = 1_900_003_000
  ID_PROJECTS              = 1_900_004_000
  ID_REQUEST_TYPES         = 1_900_005_000
  ID_REQUEST_STATUSES      = 1_900_006_000
  ID_REQUEST_REASONS       = 1_900_007_000
  ID_REQUEST_FIRST_REASONS = 1_900_008_000
  ID_WORKING_DAYS          = 1_900_009_000
  ID_REQUESTS              = 1_900_010_000
  ID_AGREEMENTS            = 1_900_011_000
  ID_DEBTORS               = 1_900_012_000

  # external_id / agrm_id — int32, тоже до 2_147_483_647
  EXT_AGREEMENTS_BASE      = 1_999_000_000

  def up
    say_with_time "Сидирование демо-данных" do
      PaperTrail.enabled = false if defined?(PaperTrail)

      # Сбрасываем кэш колонок, чтобы column_names соответствовал реальной схеме
      [Department, User, ProjectType, Project, RequestType, RequestStatus,
       RequestReason, RequestFirstReason, WorkingDay, Request,
       Agreement, Debtor].each(&:reset_column_information)

      ActiveRecord::Base.transaction do
        departments       = seed_departments!
        users             = seed_users!(departments)
        project_types     = seed_project_types!
        projects          = seed_projects!(project_types, users)
        request_types     = seed_request_types!
        request_statuses  = seed_request_statuses!(request_types)
        request_reasons   = seed_request_reasons!(request_types)
        first_reasons     = seed_request_first_reasons!(request_types)
        seed_working_days!(users)
        seed_requests!(
          users:            users,
          projects:         projects,
          request_types:    request_types,
          request_statuses: request_statuses,
          request_reasons:  request_reasons,
          first_reasons:    first_reasons
        )
        agreements = seed_agreements!
        seed_debtors!(agreements)
      end

      PaperTrail.enabled = true if defined?(PaperTrail)
    end
  end

  def down
    say_with_time "Откат демо-данных" do
      ActiveRecord::Base.transaction do
        Debtor.where("id >= ?",        ID_DEBTORS).delete_all
        Agreement.where("id >= ?",     ID_AGREEMENTS).delete_all
        Request.where("id >= ?",       ID_REQUESTS).delete_all
        WorkingDay.where("id >= ?",    ID_WORKING_DAYS).delete_all
        Project.where("id >= ?",       ID_PROJECTS).delete_all
        ProjectType.where("id >= ?",   ID_PROJECT_TYPES).delete_all
        RequestStatus.where("id >= ?", ID_REQUEST_STATUSES).delete_all
        RequestReason.where("id >= ?", ID_REQUEST_REASONS).delete_all
        RequestFirstReason.where("id >= ?", ID_REQUEST_FIRST_REASONS).delete_all
        RequestType.where("id >= ?",   ID_REQUEST_TYPES).delete_all
        User.where("id >= ?",          ID_USERS).delete_all
        Department.where("id >= ?",    ID_DEPARTMENTS).delete_all
      end
    end
  end

  # ────────────────────────────────────────────────────────────────────
  # Универсальный helper: явный demo-id + поиск по натуральному ключу
  # ────────────────────────────────────────────────────────────────────

  def upsert_demo!(klass, id:, lookup: {}, validate: true)
    record = klass.find_by(id: id)
    record ||= klass.find_by(lookup) if lookup.any?
    if record.nil?
      record = klass.new
      record.id = id
      yield(record)
      validate ? record.save! : record.save!(validate: false)
    end
    record
  end

  # ────────────────────────────────────────────────────────────────────
  # СПРАВОЧНИКИ
  # ────────────────────────────────────────────────────────────────────

  def seed_departments!
    # ВАЖНО: имена department.name должны точно совпадать с тем, что ищут
    # контроллеры (working_days_controller, time_slots_controller):
    # 'connection_department', 'service_department', 'administrative_department'.
    rows = [
      "administrative_department",
      "connection_department",
      "service_department"
    ]
    rows.each_with_object({}).with_index do |(name, acc), idx|
      acc[name] = upsert_demo!(Department, id: ID_DEPARTMENTS + idx + 1, lookup: { name: name }) do |d|
        d.name        = name
        d.description = "Демо-отдел: #{name}"
      end
    end
  end

  def seed_users!(departments)
    # Роли подобраны так, чтобы юзеры попали в фильтры контроллеров:
    #   working_days_controller: roles ∈ %w[main_engineer main_video_engineer
    #     video_engineer connect_engineer service_engineer technical_engineer
    #     car lead_engineer]
    #   time_slots_controller (personal):
    #     %w[service_engineer technical_engineer builder_engineer]
    rows = [
      { email: "admin@demo.local",     name: "Админ Демов",       role: 1,  dep: "administrative_department", phone: "79000000001" },
      { email: "pm@demo.local",        name: "Пётр Менеджеров",   role: 20, dep: "administrative_department", phone: "79000000002" },
      { email: "connect1@demo.local",  name: "Иван Инженеров",    role: 8,  dep: "connection_department",     phone: "79000000003" }, # connect_engineer
      { email: "connect2@demo.local",  name: "Сергей Кабелин",    role: 8,  dep: "connection_department",     phone: "79000000004" }, # connect_engineer
      { email: "service@demo.local",   name: "Алексей Сервисов",  role: 9,  dep: "service_department",        phone: "79000000005" }, # service_engineer
      { email: "service2@demo.local",  name: "Мария Поддержкина", role: 9,  dep: "service_department",        phone: "79000000006" }  # service_engineer
    ]

    has_phone      = User.column_names.include?("phone")
    has_active     = User.column_names.include?("active")
    has_department = User.column_names.include?("department_id")

    rows.each_with_object({}).with_index do |(row, acc), idx|
      user = upsert_demo!(User, id: ID_USERS + idx + 1, lookup: { email: row[:email] }, validate: false) do |u|
        u.email                 = row[:email]
        u.name                  = row[:name]
        u.role                  = row[:role]
        u.department_id         = departments[row[:dep]].id if has_department
        u.phone                 = row[:phone]               if has_phone
        u.active                = true                       if has_active
        u.password              = "Demo12345!"
        u.password_confirmation = "Demo12345!"
      end
      acc[row[:email]] = user
    end
  end

  def seed_project_types!
    rows = ["Подключение домов", "Модернизация сети", "Развитие услуг"]
    has_active = ProjectType.column_names.include?("active")
    rows.each_with_object({}).with_index do |(name, acc), idx|
      acc[name] = upsert_demo!(ProjectType, id: ID_PROJECT_TYPES + idx + 1, lookup: { name: name }) do |t|
        t.name   = name
        t.active = true if has_active
      end
    end
  end

  def seed_request_types!
    rows = ["Сервис", "Подключение", "Служебная"]
    has_active      = RequestType.column_names.include?("active")
    has_alert_timer = RequestType.column_names.include?("alert_timer")
    rows.each_with_object({}).with_index do |(name, acc), idx|
      acc[name] = upsert_demo!(RequestType, id: ID_REQUEST_TYPES + idx + 1, lookup: { name: name }) do |t|
        t.name        = name
        t.alert_timer = 60   if has_alert_timer
        t.active      = true if has_active
      end
    end
  end

  def seed_request_statuses!(request_types)
    rows = [
      { type: "Сервис",      name: "Новая",          priority: 1, after_finish: false },
      { type: "Сервис",      name: "В работе",       priority: 2, after_finish: false },
      { type: "Сервис",      name: "Выполнена",      priority: 3, after_finish: true },
      { type: "Подключение", name: "Запланирована",  priority: 1, after_finish: false },
      { type: "Подключение", name: "Подключён",      priority: 2, after_finish: true },
      { type: "Служебная",   name: "Открыта",        priority: 1, after_finish: false },
      { type: "Служебная",   name: "Закрыта",        priority: 2, after_finish: true }
    ]

    statuses        = {}
    has_active      = RequestStatus.column_names.include?("active")
    has_alert_timer = RequestStatus.column_names.include?("alert_timer")
    rows.each_with_index do |row, idx|
      rt = request_types[row[:type]]
      key = "#{row[:type]}::#{row[:name]}"
      statuses[key] = upsert_demo!(
        RequestStatus,
        id: ID_REQUEST_STATUSES + idx + 1,
        lookup: { request_type_id: rt.id, name: row[:name] }
      ) do |s|
        s.request_type_id = rt.id
        s.name            = row[:name]
        s.priority        = row[:priority]
        s.after_finish    = row[:after_finish]
        s.alert_timer     = 60   if has_alert_timer
        s.active          = true if has_active
      end
    end
    statuses
  end

  def seed_request_reasons!(request_types)
    rows = [
      { type: "Сервис",      description: "Не работает интернет" },
      { type: "Сервис",      description: "Низкая скорость" },
      { type: "Подключение", description: "Новое подключение интернета" },
      { type: "Служебная",   description: "Внутренние работы по узлу" }
    ]
    has_active       = RequestReason.column_names.include?("active")
    has_service_type = RequestReason.column_names.include?("service_type")
    rows.each_with_object({}).with_index do |(row, acc), idx|
      rt = request_types[row[:type]]
      acc[row[:description]] = upsert_demo!(
        RequestReason,
        id: ID_REQUEST_REASONS + idx + 1,
        lookup: { description: row[:description], request_type_id: rt.id }
      ) do |r|
        r.description     = row[:description]
        r.request_type_id = rt.id
        r.service_type    = "internet" if has_service_type
        r.active          = true       if has_active
      end
    end
  end

  def seed_request_first_reasons!(request_types)
    rows = [
      { type: "Сервис",      name: "Жалоба от абонента" },
      { type: "Подключение", name: "Заявка с сайта" },
      { type: "Служебная",   name: "Плановые работы" }
    ]
    has_active = RequestFirstReason.column_names.include?("active")
    rows.each_with_object({}).with_index do |(row, acc), idx|
      rt = request_types[row[:type]]
      acc[row[:name]] = upsert_demo!(
        RequestFirstReason,
        id: ID_REQUEST_FIRST_REASONS + idx + 1,
        lookup: { name: row[:name], request_type_id: rt.id }
      ) do |r|
        r.name            = row[:name]
        r.request_type_id = rt.id
        r.active          = true if has_active
      end
    end
  end

  # ────────────────────────────────────────────────────────────────────
  # БИЗНЕС-СУЩНОСТИ
  # ────────────────────────────────────────────────────────────────────

  def seed_projects!(project_types, users)
    rows = [
      { name: "Подключение ЖК «Берёзовая роща»", type: "Подключение домов",  responsible: "pm@demo.local",       desc: "Магистраль + домовые узлы", days_offset: -10, duration_days: 60, status: "at_work" },
      { name: "Модернизация узла №14",            type: "Модернизация сети", responsible: "connect1@demo.local", desc: "Замена коммутаторов",       days_offset: -5,  duration_days: 14, status: "at_work" },
      { name: "Запуск услуги Видеонаблюдение",    type: "Развитие услуг",    responsible: "admin@demo.local",    desc: "Выкатка нового тарифа",     days_offset: -30, duration_days: 90, status: "archive" }
    ]

    has_status     = Project.column_names.include?("status")
    has_managers   = Project.column_names.include?("project_managers_ids")
    has_old_status = Project.column_names.include?("project_status_id")

    # В projects_controller#index видимость проекта урезана для не-админов:
    # пользователь видит проект только если он responsible или входит в
    # project_managers_ids. Поэтому в managers кладём ID ВСЕХ демо-юзеров —
    # тогда проекты отображаются под любым демо-аккаунтом.
    all_manager_ids = users.values.map { |u| u.id.to_s }

    rows.each_with_object({}).with_index do |(row, acc), idx|
      pt = project_types[row[:type]]
      acc[row[:name]] = upsert_demo!(Project, id: ID_PROJECTS + idx + 1, lookup: { name: row[:name] }) do |p|
        p.name                  = row[:name]
        p.description           = row[:desc]
        p.project_type_id       = pt.id
        p.responsible_user_id   = users[row[:responsible]].id
        p.plan_started_at       = Time.current + row[:days_offset].days
        p.plan_finished_at      = Time.current + row[:days_offset].days + row[:duration_days].days
        p.status                = row[:status]            if has_status
        p.project_managers_ids  = all_manager_ids         if has_managers
        # На старой схеме у проектов было обязательное project_status_id —
        # обнулим/оставим NULL, тут демо-данные без жёсткого статуса.
        p.project_status_id     = nil if has_old_status && p.respond_to?(:project_status_id=)
      end
    end
  end

  def seed_working_days!(users)
    target_users = %w[connect1@demo.local connect2@demo.local service@demo.local service2@demo.local].map { |e| users[e] }
    # Берём диапазон [сегодня-7, сегодня+13], чтобы текущая неделя календаря
    # графика и тайм-слотов сразу была заполнена.
    today = Date.current
    counter = 0

    target_users.each do |u|
      (-7).upto(13).each do |delta|
        date = today + delta.days
        next if date.saturday? || date.sunday?
        counter += 1
        upsert_demo!(WorkingDay, id: ID_WORKING_DAYS + counter, lookup: { user_id: u.id, date: date.to_datetime }) do |w|
          w.user_id = u.id
          w.date    = date.to_datetime
        end
      end
    end
  end

  def seed_requests!(users:, projects:, request_types:, request_statuses:, request_reasons:, first_reasons:)
    # Все задачи привязываем к СЕГОДНЯШНЕМУ дню (с разными часовыми слотами),
    # чтобы они сразу появились на странице тайм-слотов и в "Сделать сегодня".
    today_start = Date.current.to_time.change(hour: 9)

    rows = [
      { type: "Сервис",      status: "Сервис::Новая",            reason: "Не работает интернет",        first: "Жалоба от абонента", responsible: "service@demo.local",  executor: "service@demo.local",  project: nil,
        description: "Демо-задача: вызов на адрес ул. Ленина, 10",
        plan_started_at: today_start + 1.hour,        plan_finished_at: today_start + 2.hours },
      { type: "Сервис",      status: "Сервис::В работе",         reason: "Низкая скорость",             first: "Жалоба от абонента", responsible: "service2@demo.local", executor: "service2@demo.local", project: nil,
        description: "Демо-задача: диагностика скорости у абонента",
        plan_started_at: today_start + 3.hours,       plan_finished_at: today_start + 5.hours },
      { type: "Подключение", status: "Подключение::Запланирована", reason: "Новое подключение интернета", first: "Заявка с сайта",     responsible: "connect1@demo.local", executor: "connect1@demo.local", project: "Подключение ЖК «Берёзовая роща»",
        description: "Демо-задача: подключение квартиры в новом ЖК",
        plan_started_at: today_start + 1.hour,        plan_finished_at: today_start + 4.hours },
      { type: "Подключение", status: "Подключение::Запланирована", reason: "Новое подключение интернета", first: "Заявка с сайта",     responsible: "connect2@demo.local", executor: "connect2@demo.local", project: "Подключение ЖК «Берёзовая роща»",
        description: "Демо-задача: монтаж абонентской линии",
        plan_started_at: today_start + 5.hours,       plan_finished_at: today_start + 7.hours },
      { type: "Сервис",      status: "Сервис::Новая",            reason: "Низкая скорость",             first: "Жалоба от абонента", responsible: "service@demo.local",  executor: "service@demo.local",  project: "Модернизация узла №14",
        description: "Демо-задача: повторная диагностика на узле №14",
        plan_started_at: today_start + 6.hours,       plan_finished_at: today_start + 8.hours }
    ]

    rows.each_with_index do |row, idx|
      rt = request_types[row[:type]]
      st = request_statuses[row[:status]]
      rr = request_reasons[row[:reason]]
      fr = first_reasons[row[:first]]
      pr = row[:project] ? projects[row[:project]] : nil

      upsert_demo!(Request, id: ID_REQUESTS + idx + 1, lookup: { description: row[:description] }, validate: false) do |r|
        r.request_type_id          = rt.id
        r.request_status_id        = st.id
        r.request_reason_id        = rr.id
        r.request_first_reason_id  = fr.id
        r.responsible_user_id      = users[row[:responsible]].id
        r.executor_user_id         = users[row[:executor]].id
        r.project_id               = pr&.id
        r.description              = row[:description]
        r.plan_started_at          = row[:plan_started_at]
        r.plan_finished_at         = row[:plan_finished_at]
        r.status_updated_at        = Time.current
        r.comment                  = "Создано миграцией SeedDemoData"
      end
    end
  end

  def seed_agreements!
    # 6 демо-договоров. external_id = «псевдо-LB-id» в безопасном диапазоне
    # 999_000_001..999_000_006 (далеко от реальных LanBilling agrm_id).
    rows = [
      { number: "DEMO-2026-0001" },
      { number: "DEMO-2026-0002" },
      { number: "DEMO-2026-0003" },
      { number: "DEMO-2026-0004" },
      { number: "DEMO-2026-0005" },
      { number: "DEMO-2026-0006" }
    ]

    rows.each_with_object({}).with_index do |(row, acc), idx|
      external_id = EXT_AGREEMENTS_BASE + idx + 1   # 999_000_001..999_000_006
      acc[external_id] = upsert_demo!(
        Agreement,
        id: ID_AGREEMENTS + idx + 1,
        lookup: { external_id: external_id }
      ) do |a|
        a.external_id = external_id
        a.number      = row[:number]
      end
    end
  end

  def seed_debtors!(agreements)
    # Привязываем должников к договорам через agrm_id (== agreement.external_id).
    # debtors_controller#index фильтрует:
    #   - по `created_at` ∈ [прошлый_месяц.beginning_of_month .. прошлый_месяц.end_of_month]
    #   - по `agrm_type` (по умолчанию 'tv')
    # Поэтому 1) бэкдейтим created_at в середину прошлого месяца,
    # 2) делаем агрм-типы такими, чтоб дефолтный фильтр 'tv' что-то нашёл.
    ext_ids = agreements.keys
    backdated = (Time.current - 1.month).beginning_of_month + 14.days

    rows = [
      { agrm_idx: 0, balance:  -1500, fee:  700, status: "default",      agrm_type: "tv",     tar_ids: ["201"] },
      { agrm_idx: 1, balance:  -3200, fee:  850, status: "default",      agrm_type: "tv_int", tar_ids: ["101", "201"] },
      { agrm_idx: 2, balance:   -250, fee:  500, status: "default",      agrm_type: "tv",     tar_ids: ["201"] },
      { agrm_idx: 3, balance:  -8400, fee:  950, status: "impossible",   agrm_type: "int",    tar_ids: ["101"] },
      { agrm_idx: 4, balance: -12000, fee: 1100, status: "disconnected", agrm_type: "tv_int", tar_ids: ["101", "201"] }
      # agreements[5] — без долга, специально для проверки UI «не должник»
    ]

    has_agrm_type = Debtor.column_names.include?("agrm_type")
    has_tar_ids   = Debtor.column_names.include?("tar_ids")
    has_tar_id    = Debtor.column_names.include?("tar_id")  # старая схема: одиночное поле

    rows.each_with_index do |row, idx|
      ext_id = ext_ids[row[:agrm_idx]]
      upsert_demo!(Debtor, id: ID_DEBTORS + idx + 1, lookup: { agrm_id: ext_id }) do |d|
        d.agrm_id   = ext_id
        d.balance   = row[:balance]
        d.fee       = row[:fee]
        d.status    = row[:status]
        d.agrm_type = row[:agrm_type]          if has_agrm_type
        d.tar_ids   = row[:tar_ids]            if has_tar_ids
        d.tar_id    = row[:tar_ids].first.to_i if has_tar_id && !has_tar_ids
        d.created_at = backdated
        d.updated_at = backdated
      end
    end
  end
end
