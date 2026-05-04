ActionMailer::DeliveryJob.rescue_from(Net::SMTPFatalError) do |e|
    unless e.message.include?("550-Your message contains 0 valid recipients")
        raise e
    end
end
