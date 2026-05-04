class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  enum role: {
    admin: 1,
    manager: 2,
    accountant: 3,
    billing_manager: 4,
    engineer: 5,
    main_engineer: 6,
    video_engineer: 7,
    connect_engineer: 8,
    service_engineer: 9,
    technical_engineer: 10,
    builder_engineer: 11,
    main_manager:12,
    main_billing_manager: 13,
    hr_manager: 14,
    main_accountant: 15,
    supervisor: 16,
    jurist: 17,
    developer: 18,
    tester: 19,
    project_manager: 20,
    car: 21,
    lead_engineer: 22,
    commercial_manager: 23,
    system: 24,
    main_video_engineer: 25,
  }

  has_many :equipment_locations, as: :location
  has_many :warehouse_material_moves
  has_many :warehouse_material_moves, as: :created_by
  has_many :working_days
  has_many :notification_rules
  belongs_to :department
  attr_accessor :check_password

  validates :password, :check_password, presence: true, on: :change_password
  validates :password, confirmation: true, if: :password_present?
  validate :password_complexity, if: :password_present?

  after_create_commit :create_notification_rules
  before_validation :sync_password_confirmation

  before_save ->(user) {
    if user.encrypted_password_changed?
      user.pass_changed_at = Time.now
    end
  }

  scope :warehouse_users, ->{ where(role: ['engineer', 'main_engineer']) }
  scope :help_desk_users, ->{ where(role: [
    'admin',
    'developer',
    'supervisor',
    'main_manager',
    'manager',
    'main_billing_manager',
    'billing_manager',
    'main_engineer',
    'engineer',
    'service_engineer',
    'connect_engineer',
    'technical_engineer',
    'builder_engineer',
    'main_video_engineer',
    'video_engineer',
    'main_accountant',
    'accountant',
    'hr_manager',
    'jurist',
    'car',
    'lead_engineer',
    'commercial_manager',
    'project_manager',
    'system',
    'tester'
    ]) }
  scope :executors_of_requests, ->{ where(role: ['service_engineer', 'connect_engineer'])}
  scope :active, ->{where(active: true)}

  # Выборки по отделам
  scope :monitoring_department, ->{ where(role: ['engineer', 'main_engineer']) }
  scope :service_department, ->{ where(role: ['service_engineer']) }
  scope :connection_department, ->{ where(role: ['connect_engineer']) }
  scope :technical_department, ->{ where(role: ['technical_engineer', 'video_engineer', 'main_video_engineer']) }
  scope :building_department, ->{ where(role: ['builder_engineer']) }
  scope :call_department, ->{ where(role: ['main_manager','manager']) }
  scope :accounting_department, ->{ where(role: ['main_accountant','accountant'])}
  # //////////////////

  def ability
    @ability ||= Ability.new(self)
  end

  def self.get_users_by_department(department_name)
    if department_name.present?
      department = Department.find_by(name: department_name)
      return none unless department # если нет департамента — пустой Relation
      where(department_id: department.id)
    else
      all
    end
  end

  # def self.get_users_by_department(department)
  #   users = []
  #   department = Department.find_by(name: department)
  #   users = department.users if department.present?
  #   users
  # end

  def working_days_in_month_by_date(date)
    working_days = self.working_days.by_month_in_date(date).map{|day|
      day.date.strftime('%-d').to_i
    }
  end

  def get_short_name
    data = self.name.split(" ").map.with_index{|v,i| i == 0 ? v : "#{v.slice(0)}."}.join(" ")
  end

  def create_notification_rules
    self.notification_rules.create(
      target_type: "Request",
      searcheble_types: RequestType.all.active.pluck(:id),
      searcheble_fields: I18n.t("user_notification.models.Request.fields").map{|key, value| key.to_s},
    )
    self.notification_rules.create(
      target_type: "Project",
      searcheble_types: ProjectType.all.pluck(:id),
      searcheble_fields: I18n.t("user_notification.models.Project.fields").map{|key, value| key.to_s},
    )
    self.notification_rules.create(
      target_type: "Expense",
      searcheble_types: ExpenseType.all.pluck(:id),
      searcheble_fields: I18n.t("user_notification.models.Expense.fields").map{|key, value| key.to_s},
    )
  end

  def password_present?
    password.present?
  end

  def sync_password_confirmation
    self.password_confirmation = check_password if check_password.present?
  end

  def password_complexity
    unless /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/.match?(password)
      errors.add(:password, 'должен содержать хотя бы одну цифру, строчную и заглавную буквы, спецсимвол и быть длиной не менее 8 символов')
    end
  end

end
