module Merchants
  def self.current
    Merchants::Yookassa
  end

  def self.get(name)
    case name
    when 'sberbank'
      Merchants::Sberbank
    when 'sberbank_sbp'
      Merchants::SberbankSBP
    when 'minbank'
      Merchants::Minbank
    when 'yookassa'
      Merchants::Yookassa
    when 'yookassa_sbp'
      Merchants::YookassaSBP
    else
      raise "No provider #{name}"
    end
  end
end
