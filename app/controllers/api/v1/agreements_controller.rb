module Api
    module V1
        class AgreementsController < BaseController
            def connections
                @errors = {}
                @connections =  Agreement.get_connections_data(params[:id])

                users = User.all.index_by(&:id)

                @connections = @connections.to_a

                @connections = @connections.map do |record|
                    connect = record.attributes
                    port = Port.find(connect["p_id"])
                    port.check_port_state
                    @errors["#{connect["dv_name"]}::#{port.number}"] = port.errors if port.errors.size > 0
                    connect["p_state"] = port.state
                    connect["checked_at"] = port.checked_at
                    connect["changes"] = []
                    port.versions.limit(5).each do |change|
                        next unless change.changeset["state"].present?
                        connect["changes"] << {
                            state_change: "#{change.changeset["state"][0]} => #{change.changeset["state"][1]}",
                            user: users[change.whodunnit.to_i] ? users[change.whodunnit.to_i].name : 'Система',
                            date: change.created_at
                        }
                    end
                    connect
                end
            end
        end
    end
end
