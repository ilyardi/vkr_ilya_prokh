json.documents @documents, partial: 'document', as: :document
# json.parent @parent, partial: 'document', as: :document
if @parent.present?
    json.parent @parent, partial: 'document', as: :document
else
    json.parent nil
end
