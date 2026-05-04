class Site::AddressesController < Site::BaseController
  def index
    @addresses = LbAddressStreet.dubna(only_exists: false)
    if v = params[:query].presence
      @addresses = @addresses.like_name("%#{v.downcase}%")
    end
  end

  def houses
    # street = LbAddressStreet.dubna(only_exists: false).by_name(params[:street]).first
    street = LbAddressStreet.dubna(only_exists: false).find(params[:street])
    @addresses = (street) ? LbAddressBuilding.dubna(only_exists: false).by_street(street.record_id) : []
    if v = params[:query].presence
      @addresses = @addresses.like_name("%#{v.downcase}%")
    end
    @addresses = @addresses.sort_by{|a| a.name.to_i}
  end

  def autocomplete
    q = params[:q]

    case params[:field]
    when 'street'
      @records = LbAddressStreet.dubna(only_exists: false)
      if q.present?
        @records = @records.like_name("%#{q.downcase}%")
      end
    when 'building'
      street = LbAddressStreet.dubna(only_exists: false).by_name(params[:street]).first
      @records = (street) ? LbAddressBuilding.dubna(only_exists: false).by_street(street.record_id) : []
      if q.present?
        @records = @records.like_name("%#{q.downcase}%")
      end
      @records = @records.sort_by{|a| a.name.to_i}
    end
  end

  def tarif
    @agreement = LbAgreement.joins(lb_account: {lb_accounts_addrs: [:lb_address_flat, :lb_address_street, :lb_address_building]}).
      find_by('address_street.name = ?
        AND CONCAT(address_building.name, IF(block, CONCAT(" к.", address_building.block), "")) = ?
        AND address_flat.name = ?
        AND accounts_addr.type=2
        AND accounts.archive = 0', params[:street], params[:building], params[:flat])

    if @agreement.nil?
      render json: { error: "Адрес не найден." } and return
    end

    testing_agrms = (ENV['TESTING_AGREEMENTS'] || "").split(",").map(&:to_i)
    # 1151 - 9993631
    # 3620020 - Лесная 2-2
    if ENV['TESTING_PAYMENT'] == 'true' && !testing_agrms.include?(@agreement.number)
      render json: { error: "Оплата с сайта временно не доступна." } and return
    end
  end
end

