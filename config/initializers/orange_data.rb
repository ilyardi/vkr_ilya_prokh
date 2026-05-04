OrangeData.configure do |c|
  c.debug   = true #Rails.env.development?
  c.api_url = Settings.orange_data.url || "https://api.orangedata.ru:2443"
  # c.api_path = API_PATH
  c.api_key = "5010050793"
  c.inn     = "5010050793"
  # c.agent_type = :bank_payment_agent
  # c.payment_transfer_operator_phone_numbers = PAYMENT_TRANSFER_OPERATOR_PHONE_NUMBERS
  # c.payment_agent_operation = PAYMENT_AGENT_OPERATION
  # c.payment_agent_phone_numbers = PAYMENT_AGENT_PHONE_NUMBERS
  # c.payment_operator_phone_numbers = PAYMENT_OPERATOR_PHONE_NUMBERS
  # c.payment_operator_name = PAYMENT_OPERATOR_NAME
  # c.payment_operator_address = PAYMENT_OPERATOR_ADDRESS
  # c.payment_operator_inn = ""
  c.supplier_phone_numbers = ["+74962120208"] # Телефон поставщика
  # c.additional_user_attribute = ADDITIONAL_USER_ATTRIBUTE
  # ? c.automat_number = AUTOMAT_NUMBER
  # c.receipt_type = RECEIPT_TYPE
  c.tax = :vat_not_charged
  c.taxation_system = :usn_revenue_minus_consumption
  c.payment_method_type = :full_calculation
  c.payment_subject_type = :service

  c.organization_key = File.read(Settings.orange_data.private_key)
  c.orange_data_key = File.read(Settings.orange_data.key)
  c.orange_data_certificate = File.read(Settings.orange_data.cert)
end

# 1. "признак агента" должен быть "банковский платежный агент"? Оплата у нас проходит через МинБанк.
# 2. Нужно ли указывать "номер автомата"?
# 3. И можете помочь в определении следущих параметров?
#    PAYMENT_TRANSFER_OPERATOR_PHONE_NUMBERS - список с телефонами оператора перевода
#    PAYMENT_AGENT_OPERATION - операция платежного агента
#    PAYMENT_AGENT_PHONE_NUMBERS - список с телефонами платежного агента
#    PAYMENT_OPERATOR_PHONE_NUMBERS - список с телефонами оператора по приему платежа
#    PAYMENT_OPERATOR_NAME - название оператора перевода
#    PAYMENT_OPERATOR_ADDRESS - адрес оператора перевода
#    PAYMENT_OPERATOR_INN - ИНН оператора перевода
#    SUPPLIER_PHONE_NUMBERS - телефон поставщика
