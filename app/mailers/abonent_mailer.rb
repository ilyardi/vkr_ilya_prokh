class AbonentMailer < ApplicationMailer
  default 'X-UNIONE' => '{"global_language": "ru"}'

  def email_confirmation(abonent_id)
    @abonent = Abonent.find(abonent_id)
    @confirmation_token = @abonent.confirmation_token

    mail({
      from: "Телесеть <noreply@teleset.plus>",
      to: @abonent.unconfirmed_email,
      subject: "Подтвердите email",
    })
  end

  def invoice(email, invoice_ids, name = '')
    @name = name

    @invoices = []
    invoices = LbOrder.invoices.where(order_id: invoice_ids)

    @date = invoices[0]&.period

    invoices.each do |inv|
      mime = `file --b --mime-type '#{inv.file_name}'`.strip
      if mime != 'application/pdf'
        puts "[#{email}] Not PDF: #{inv.file_name}"
        next
      end

      attachments["счёт_#{I18n.t('date.normal_month_names')[inv.period.month]}_#{inv.period.year}_#{inv.lb_agreement.number}.pdf"] = File.read(inv.file_name)
      @invoices << inv
    end
    if @invoices.size == 0
      puts "[#{email}] No invoices"
      return
    end

    mail({
      from: "Телесеть <noreply@teleset.plus>",
      to: email,
      subject: "Счёт за #{I18n.t('date.normal_month_names')[@date.month]} #{@date.year}",
    })
  end

  def notification(abonent_id, title, body)
    @abonent = Abonent.find(abonent_id)
    @title = title
    @body = body

    mail({
      from: "Телесеть <noreply@teleset.plus>",
      to: @abonent.email,
      subject: title,
    })
  end

  def notification_on_email(email, title, body)
    @title = title
    @body = body

    mail({
      from: "Телесеть <noreply@teleset.plus>",
      to: email,
      subject: title,
      template_name: 'notification'
    })
  end

  def dolg(email, address)
    @address = address

    mail({
      from: "Телесеть <noreply@teleset.plus>",
      to: email,
      subject: "Задолженность за услуги связи",
    })
  end

  def claim(email, address)
    @address = address

    mail({
      from: "Телесеть <noreply@teleset.plus>",
      to: email,
      subject: "Претензия!",
    })
  end
end
