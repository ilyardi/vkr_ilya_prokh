class WarehouseMaterial < ApplicationRecord
    enum unit: {:piece => 'piece', :metre => 'metre', :kilo => 'kilo', :litre => 'litre' }

    belongs_to :warehouse_material_category
    has_many :warehouse_material_moves, dependent: :destroy

    validates :name,:unit,:warehouse_material_category_id, presence: true
    validates :name, uniqueness: true

    after_create :generate_code

    private

    def generate_code
        gen_code = ''
        words_in_name = name.split  
        if words_in_name.length > 1
            gen_code += words_in_name[0][0].upcase + words_in_name[1][0].upcase
        else 
            gen_code += words_in_name[0][0..1].upcase
        end
        gen_code += '-' + id.to_s.rjust(5, "0")
        self.update_column(:code, gen_code)
    end
end
