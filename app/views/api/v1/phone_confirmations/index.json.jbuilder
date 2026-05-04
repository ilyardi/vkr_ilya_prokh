json.phone_confirmations do
    json.array! @confirmations, partial: 'phone_confirmation', as: :phone_confirmation
end