class Site::Payments::MinbankController < Site::BaseController

  before_action :find_payment

  def approved
    perform
  end

  def cancel
    perform
  end

  def decline
    perform

    #  {"Message"=>
#   {"Version"=>"1.0",
#    "OrderID"=>"214739",
#    "SessionID"=>"D7CAC4161FC16DC3E051E8F36FBB9F4E",
#    "TransactionType"=>"Платеж",
#    "PAN"=>"5570 71XX XXXX 0560",
#    "PurchaseAmount"=>"440000",
#    "Currency"=>"810",
#    "TranDateTime"=>"10/07/2018 22:43:07",
#    "ResponseCode"=>nil,
#    "ResponseDescription"=>nil,
#    "CardHolderName"=>nil,
#    "Brand"=>nil,
#    "OrderStatus"=>"CANCELED",
#    "ApprovalCode"=>nil,
#    "OrderDescription"=>"Оплата за тариф",
#    "ApprovalCodeScr"=>nil,
#    "PurchaseAmountScr"=>"4,400.00",
#    "AcqFee"=>"0.00",
#    "CurrencyScr"=>"RUR",
#    "OrderStatusScr"=>"Отменен",
#    "Name"=>"SDFASDF",
#    "date"=>"10/07/2018 22:43:07"}}
  end

  private

  def perform
      @payment.pay_message = payment_message
      incoming_amount = payment_message.PurchaseAmount.to_f/100
      unless incoming_amount.round(2) == @payment.amount.round(2)
        @payment.pay_errors = ["Purchase amount not equal to expected. (#{incoming_amount.round(2)} != #{@payment.amount.round(2)})"]
        @payment.error!
        redirect_to "/pay?status=error&code=400" and return
        # render text: "Incorrect amount" and return
      end

      case payment_message.OrderStatus
      when "APPROVED" then
        @payment.paid!
      when "CANCELED" then
        @payment.canceled!
      when "DECLINED" then
        @payment.declined!
      end

      redirect_to "/pay?status=#{payment_message.OrderStatus.downcase}" and return
    end

    def payment_message
      @payment_message ||= begin
        xml = params[:xmlmsg]
        h = Hashie::Mash[MultiXml.parse(xml)]
        if h.XMLOut
          h.XMLOut.Message_
        else
          h.Message_
        end
      end
    end

    def find_payment
      unless payment_message.empty?
        @payment = LkPayment.find_by(order_id: payment_message.OrderID, provider: LkPayment::ProviderMinbank) #, session_id: payment_message.SessionID)
      end
      if @payment.nil?
        e = RuntimeError.new("Errors in Minbank Hook")
        ExceptionNotifier.notify_exception(e, data: { params: params })
        redirect_to "/pay?status=error&code=404"
      end
    end

end
