class IrcPaymentsToPayments < ActiveRecord::Migration[5.2]
  def change
    Payment.transaction do
      IrcPayment.all.each do |irc|
        Payment.create!({
          source_id:      irc.irc_id,
          source_type:    'irc',
          source_address: '',
          account_number: irc.account_number,
          amount:         irc.amount,
          paid_at:        irc.paid_at,
          added_at:       irc.added_at,

          status:           irc.status,
          lanbilling_id:    irc.lanbilling_id,
          lanbilling_error: irc.lanbilling_error,
          data:             irc.data,
        })
      end
    end
  end
end
