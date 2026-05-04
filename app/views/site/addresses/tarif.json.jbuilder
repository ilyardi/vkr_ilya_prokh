json.(@agreement, :agrm_id, :number, :balance)
json.dogovor @agreement.number
json.amount @agreement.get_services[:fee]
