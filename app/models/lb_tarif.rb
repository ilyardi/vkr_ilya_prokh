class LbTarif < LbBase
  self.primary_key = :tar_id
  self.table_name = :tarifs
  self.inheritance_column = :inheritance_type

  # belongs_to :lb_usbox_service, foreign_key: :serv_id

  def get_rent
    amount = self.rent.to_i if self.descr.include?("Инт")
    sql = <<-SQL
      SELECT SUM(above) as rent
      FROM service_categories sc
      WHERE tar_id = #{self.tar_id}
        AND rent_period = 1
        AND archive = 0
        AND auto_assign = 1
      GROUP BY tar_id
    SQL
    result = LbTarif.connection.execute(sql).to_a
    amount = result[0][0].to_i if result.present?
    amount
  end
end
