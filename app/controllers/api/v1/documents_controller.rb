module Api
    module V1
        class DocumentsController < BaseController
            load_resource

            skip_before_action :authenticate_user!, only: [:preview]

            def index
                filter = params[:filter] || {}
                @parent = Document.find_by(id: filter[:parent_id])
                @documents = Document.where(active: true)
                @documents = @documents.where(related_obj_id: filter[:related_obj_id]) if filter[:related_obj_id].present?
                @documents = @documents.where(related_obj_type: filter[:related_obj_type]) if filter[:related_obj_type].present?
                if filter[:parent_id].present?
                    @documents = @documents.where(parent_id: filter[:parent_id])
                else
                    @documents = @documents.where(parent_id: nil)
                end
                @documents = @documents.order(doc_type: :desc)
            end

            # https://.../api/v1/documents/:id/preview
            # "/api/v1/documents/7/preview?expires=1677523361&sign=db41d5a1707c8f27633c3a7ec7c7c955
            def preview
                # if current_user
                #     || (params[:sign] == Digest::MD5.hexdigest("#{params[:expires]}/#{@document.id}") && params[:expires].to_i < Time.now.to_i)
                # return
                # end
                # render status: 404

                # @document = Document.find(params[:id])
                send_file @document.file.path, disposition: 'inline'
            end

            # https://.../api/v1/documents/:id/download
            def download
                # @document = Document.find(params[:id])
                send_file @document.file.path, disposition: 'attachment'
            end

            def create
                @document = Document.create(document_params)
                search = {
                    related_obj_id: document_params[:related_obj_id],
                    related_obj_type: document_params[:related_obj_type],
                    parent_id: document_params[:parent_id],
                    active: true,
                }
                @documents = Document.where(search)
                @documents = @documents.order(doc_type: :desc)
            end

            def update
                @document = Document.find(params[:id])
                @document.update(document_params)
                set_bad_request(@document)
            end

            def destroy
                document = Document.find(params[:id]).destroy
                render json: {success: true}
            end

            private

            def set_bad_request(model)
                if model.errors.size > 0
                    render status: :bad_request
                end
            end

            def document_params
                a = params.permit(:related_obj_id, :related_obj_type, :title, :file, :doc_type, :parent_id)
                a[:parent_id] = nil if a[:parent_id] == "null"
                # a[:title] = nil if a[:title] == "null" || a[:title] == "undefined" || !a[:title].present?
                a
            end
        end
    end
end
