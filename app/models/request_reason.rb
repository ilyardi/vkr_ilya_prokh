class RequestReason < ApplicationRecord
    enum service_type: { tv: 'tv', internet: 'internet', int_tv: 'int_tv', other: 'other' }
    enum service_location: { abonent: 'abonent', operator: 'operator' }
end