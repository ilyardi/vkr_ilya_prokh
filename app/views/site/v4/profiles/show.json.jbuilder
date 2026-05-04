json.user do
  json.partial! 'site/v4/shared/user', user: current_abonent
end

if agrm = current_abonent.current_dogovor
  json.current_agreement do
    json.partial! 'site/v4/agreements/agreement', agreement: agrm
  end
end
