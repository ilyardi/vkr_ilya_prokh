export const STATUSES = [
  { label: "На проверке", value: "on_check", location: "warehouse" },
  { label: "Готов к выдаче", value: "ready_to_issue", location: "warehouse" },
  { label: "Неисправен", value: "defective", location: "warehouse" },
  { label: "Не укомплектован", value: "not_staffed", location: "warehouse" },
  { label: "Установлен", value: "set", location: "lb_agreement" },
  {
    label: "Требует проверки",
    value: "requires_verification",
    location: "user",
  },
  { label: "Готов к установке", value: "ready_to_install", location: "user" },
];

export const STATUSES_LABELS = {
  on_check: "На проверке",
  ready_to_issue: "Готов к выдаче",
  defective: "Неисправен",
  not_staffed: "Не укомплектован",
  set: "Установлен",
  value: "set",
  location: "lb_agreement",
  requires_verification: "Требует проверки",
  ready_to_install: "Готов к установке",
};

export const LOCATION_TYPES = {
  Warehouse: "Склад",
  User: "Инженер",
  LbAgreement: "Клиент",
};
