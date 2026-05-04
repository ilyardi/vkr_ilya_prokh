module Ofd
  class OrangeData
    def initialize(payment)
      @payment = payment
      @params = @payment.params_for_ofd
    end

    def perform
      receipt = create_receipt
      receipt = add_position(receipt)
      receipt = add_payment(receipt)
      # receipt = add_agent(receipt)
      receipt.sync!
    end

    private

      def create_receipt
        ::OrangeData::Receipt.new(
          id: @params[:invoice_number],
          # inn: '1234567890',
          # group: 'Main',
          type: :income,
          # key: '1234567890',
          customer_contact: @params[:customer_contact],
          # taxation_system: :osn
        )
      end

      def add_position(receipt)
        receipt.add_position(
          quantity: 1,
          price: @params[:amount],
          text: @params[:description],
          # tax: :vat_not_charged,
          # payment_method_type: :full_calculation,
          # payment_subject_type: :service,
          # nomenclature_code: 'Тестовый товар'
        )
      end

      def add_payment(receipt)
        receipt.add_payment(
          type: :card,
          amount: @params[:amount],
        )
      end

      def add_agent(receipt)
        receipt.add_agent(
          # agent_type: 0,
          payment_transfer_operator_phone_numbers: [],
          # payment_agent_operation: 'Операция агента',
          payment_agent_phone_numbers: [],
          payment_operator_phone_numbers: [],
          # payment_operator_name: 'Наименование оператора перевода',
          # payment_operator_address: 'Адрес оператора перевода',
          payment_operator_inn: '',
          supplier_phone_numbers: [] # need empty? for take from global config
        )
      end
  end
end

# response = OrangeData::Receipt.new(
#   id: '123',
#   inn: '1234567890',
#   group: 'Main',
#   type: :income,
#   key: '1234567890',
#   customer_contact: '+79991234567',
#   taxation_system: :osn
# ).add_position(
#   quantity: 5,
#   price: 10,
#   text: 'Тестовый товар',
#   tax: :vat_not_charged,
#   payment_method_type: :full_calculation,
#   payment_subject_type: :service,
#   nomenclature_code: 'Тестовый товар'
# ).add_payment(
#   type: :card,
#   amount: 50
# ).add_agent(
#   agent_type: 127,
#   payment_transfer_operator_phone_numbers: ['+79998887766'],
#   payment_agent_operation: 'Операция агента',
#   payment_agent_phone_numbers: ['+79998887766'],
#   payment_operator_phone_numbers: ['+79998887766'],
#   payment_operator_name: 'Наименование оператора перевода',
#   payment_operator_address: 'Адрес оператора перевода',
#   payment_operator_inn: '3123011520',
#   supplier_phone_numbers: ['+79998887766']
# ).add_customer_info(
#   name: 'citation',
#   value: 'В здоровом теле здоровый дух, этот лозунг еще не потух!'
# ).sync!
