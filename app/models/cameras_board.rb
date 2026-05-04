class CamerasBoard < ApplicationRecord
  acts_as_list

  belongs_to :abonent
  belongs_to :camera

  scope :ordered, -> { order('position') }
end
