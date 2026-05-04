class Service < LbBase
  self.primary_key = :id
  self.table_name = :settings
  self.inheritance_column = "inheritance_type"

  class << self
    def tv
      find_by(service_name: 'ТВ')
    end

    def internet
      find_by(service_name: 'Internet')
    end

    def video
      find_by(service_name: 'Video')
    end
  end
end
