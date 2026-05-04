module Api
  module Internal
    class AgreementsController < BaseController

      def show
        dogovor = params[:id]

        agrm = LbAgreement.find_by(agrm_id: dogovor)
        agrm ||= LbAgreement.find_by!(number: dogovor)

        addons = []
        sql = ActiveRecord::Base.send(:sanitize_sql_array, [<<-SQL, agrm.agrm_id])
          SELECT s.vg_id, c.descr, round(s.mul*c.above, 2) as amount, t.descr as name, t.rent
          FROM services s
          JOIN service_categories c USING (tar_id, serv_cat_idx)
          JOIN tarifs t USING (tar_id)
          JOIN vgroups vg ON vg.vg_id = s.vg_id
          JOIN agreements ag ON vg.agrm_id = ag.agrm_id
          WHERE vg.blocked = 0 AND ag.agrm_id = ? AND s.timeto = '9999-12-31 23:59:59'
        SQL
        addons += LbAgreement.connection.exec_query(sql).to_a

        sql = ActiveRecord::Base.send(:sanitize_sql_array, [<<-SQL, agrm.agrm_id])
          SELECT us.vg_id, c.descr, round(us.mul*c.above, 2) as amount, t.descr as name, t.rent
          FROM usbox_services us
          JOIN categories c USING (tar_id, cat_idx)
          JOIN tarifs t USING (tar_id)
          JOIN vgroups vg ON vg.vg_id = us.vg_id
          JOIN agreements ag ON vg.agrm_id = ag.agrm_id
          WHERE vg.blocked = 0 AND ag.agrm_id = ? AND us.timeto = '9999-12-31 23:59:59'
        SQL
        addons += LbAgreement.connection.exec_query(sql).to_a

        sql = ActiveRecord::Base.send(:sanitize_sql_array, [<<-SQL, agrm.agrm_id])
          SELECT vg.vg_id, t.descr as name, t.rent as amount
          FROM vgroups vg
          JOIN tarifs t ON vg.tar_id = t.tar_id
          JOIN agreements ag ON vg.agrm_id = ag.agrm_id
          WHERE vg.blocked = 0 AND ag.agrm_id = ?
        SQL
        services = LbAgreement.connection.exec_query(sql).to_a

        total_amount = 0
        services.map! do |s|
          s["amount"] = s["amount"].to_f
          total_amount += s["amount"]
          s[:addons] = addons.select{|a| a["vg_id"] == s["vg_id"]}.map do |a|
            { name: a["descr"], amount: a["amount"].to_f }
          end
          total_amount += s[:addons].sum{|a| a[:amount]}
          s.delete("vg_id")
          s
        end

        render json: {
          uid: agrm.uid,
          address: agrm.lb_account.address_connect(as_hash: true),
          name: agrm.lb_account.name,
          agrm_id: agrm.agrm_id,
          number: agrm.number,
          archive: agrm.archive,
          balance: agrm.balance,
          amount: total_amount,
          services: services
        }
      end

    end
  end
end
