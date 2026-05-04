require 'sidekiq/web'

Rails.application.routes.draw do
  authenticated :user do
    mount Sidekiq::Web => '/sidekiq'
  end

  devise_for :users, only: :sessions, controllers: {
    sessions: 'users/sessions'
  }

  namespace :api do
    post 'agrm_documents/fdoc/set_status' => 'agrm_documents/fdoc#set_status'
    namespace :teledom do

      resources :phone_confirmation, only: [:create]
      resources :agreements, only: [] do
        post :add_key, on: :collection
        post :send_dom_code, on: :collection
        post :send_dom_key_done, on: :collection
        post :block, on: :collection
        post :unblock, on: :collection
        post :sync, on: :collection
        post :svn_sync, on: :collection
        post :add_subscriber, on: :collection
        post :del_subscriber, on: :collection
        get  :get_dom_info, on: :collection
        get :reports, on: :collection
        get :billing_stats, on: :collection
        get :all_rbt_addresses, on: :collection
        get :report_total, on: :collection
      end
      match '*path', to: 'issues#issue', via: :all
    end
    namespace :internal do
      resources :accounts, only: [] do
        get :find_by_address, on: :collection
        get :find_by_login, on: :collection
        get :streets, on: :collection
        get :buildings, on: :collection
        get :export, on: :collection
        put :update_by_agrm, on: :collection
      end
      resources :agreements, only: [:show]
      resources :payments, only: [:index]
    end

    namespace :v1, defaults: { format: :json } do
      resources :addresses, only: [:index] do
        get :houses, on: :collection
        get :flats, on: :collection
        get :entrances, on: :collection
      end
      resource :agreements, only: [:index, :show, :update] do
        post '/:id/connections', to: 'agreements#connections'
      end
      resources :agreement_documents, only: [:index, :create] do
        post 'refresh_doc_url', on: :member
      end
      resources :articles, only: [:index, :show, :update, :destroy]
      resources :available_services, only: [:index, :show, :create, :update, :destroy]
      resources :auto_payment_methods, only: [:index]
      resources :asterisk_calls, only: [:index] do
        get :audio, on: :member
      end
      resources :bonus_charges, only: [:index] do
        get 'rollback_charge', on: :member
      end
      resources :lb_tarifs, only: [:index]

      resources :blocking_services, only: [:index, :show, :create, :update]
      resources :cameras, only: [:index, :create, :show, :update, :destroy ] do
        post 'add_agreement/:agrm_id', to: 'cameras#add_agreement'
        post 'delete_agreement/:agrm_id', to: 'cameras#delete_agreement'
        get :archive, on: :member
        # post :add_agreement, on: :member
        # post :delete_agreement, on: :member
      end

      resources :call_reasons, only: [:index, :update]
      resources :calls, only: [:index, :create] do
        get :report, on: :collection
        get :request_dynamic, on: :collection
      end
      resources :directory, only: [:index] do
        get :user_roles, on: :collection
      end
      resources :documents, only: [:index, :create, :destroy, :update] do
        get :download, on: :member
        get :preview, on: :member
      end
      resources :dogovors, only: [:destroy]
      resources :debtors, only: [:index, :update]
      resources :departments, only: [:index, :create, :update, :destroy]
      resources :equipment, only: [:index, :create, :destroy, :update, :show] do
        get :brands, on: :collection
      end
      resources :equipment_types, only: [:index, :create, :destroy, :update, :show]
      resources :equipment_locations, only: [:index]
      resources :expenses, only: [:index, :create, :update, :destroy, :show] do
        put :batch_update, on: :collection
        put :switch_checked, on: :member
        post :create_by_plan, on: :member
      end
      resources :expense_templates, only: [:index, :create, :update, :show, :destroy]
      resources :expense_types, only: [:index, :create, :destroy]
      resources :expense_purposes, only: [:index, :create, :destroy] do
        get :for_searching, on: :collection
      end
      resources :expense_counterparties, only: [:index, :create,:update, :show, :destroy]
      resources :expense_stages, only: [:index, :create, :update, :destroy, :show]
      resources :irc_account_saldos, only: [:index] do
        post :load_file, on: :collection
        put :reload, on: :member
      end
      resources :lk_payments, only: [:index]
      resources :lb_payments, only: [:index, :update, :destroy] do
        put :batch_update,  on: :collection
      end
      resources :lb_agreements, only: [:index, :show, :update] do
        get :search, on: :collection
        get :fee_payments_report, on: :collection
        get :reconciliation_act, on: :member
      end
      resources :lb_teleset_charges, only: [:index]
      resources :lb_devices, only: [:index] do
        get :search, on: :collection
      end
      resources :notification_rules, only: [:index, :show, :create, :update, :destroy] do
        get :get_options, on: :collection
      end
      resources :payments, only: [:index] do
        get :resend_errors, on: :collection # temporary for manual execute
        put :resend, on: :member
        post :load_sberbank, on: :collection
        post :load_rschet, on: :collection
        post :load_minbank_ones, on: :collection
      end
      resources :phone_confirmations, only: [ :index ]
      resources :ports, only: [:index, :update] do
        put :check_port_state, on: :member
      end
      resource  :profile, only: [:show]
      resources :projects, only: [:index, :create, :update, :show] do
        get :context_search, on: :collection
      end
      resources :project_types, only: [:index, :create, :update, :destroy]
      resources :reports, only: [] do
        get :connection_source, on: :collection
        get :saldo, on: :collection
        get :statistic_service_requests, on: :collection
        get :manager_sales, on: :collection
        get :conversion_time_slots, on: :collection
        get :payments_by_month, on: :collection
      end
      resources :requests, only: [:index, :show, :create, :update, :destroy] do
        get 'report', on: :member, defaults: { format: 'html' }
        get :resource_search, on: :collection
        post :destroy_helper, on: :member
      end
      resources :request_types, only: [:index, :create, :update, :destroy]
      resources :request_subtypes, only: [:index, :create, :update, :destroy]
      resources :request_statuses, only: [:index, :create, :update, :destroy] do
        get :for_searching, on: :collection
      end
      resources :request_events, only: [:index, :create, :update, :destroy]
      resources :request_reasons, only: [:index, :create, :update, :destroy]
      resources :saldos, only: [:index] do
        get :reserves_report, on: :collection
        get :ur_csv_report, on: :collection
        get :agrms_csv_report, on: :collection
      end
      resources :support_requests, only: [:index]
      resources :search_templates, only: [:index, :create, :update, :destroy]
      resources :time_slots, only: [:index, :create, :update] do
        get :personal, on: :collection
        get :slots_by_week, on: :collection
      end
      resources :teledom_requests, only: [:index, :show, :create, :update]
      resources :user_requests, only: [:index]
      resources :users, only: [:index, :show, :update, :create] do
        get :warehouse_users, on: :collection
        get :help_desk_users, on: :collection
        get :executors_of_requests, on: :collection
        put :change_password, on: :member
      end
      resources :warehouses, only: [:index]
      resources :warehouse_materials, only: [:index, :create, :destroy, :update, :show] do
        get :getunit, on: :collection
      end
      resources :warehouse_material_moves, only: [:index, :create]
      resources :warehouse_material_categories, only: [:index, :create]
      resources :working_days, only: [:index, :create, :destroy] do
        post :fill_month, on: :collection
      end
      resources :white_ip_addresses, only: [:index, :show, :create, :update, :destroy]
      # get 'export', to: 'export#index'
      # get 'agreements/:id'
      # get 'accounts'
      # get 'streets/:sid/buildings/:bid/flats'
    end
  end

  namespace :site do
    resources :addresses, only: [:index] do
      get :houses, on: :collection
    end
    resources :faqs,             only: [:index]
    resources :articles, only: [:index, :show]
    resources :cameras, only: [:show], defaults: { format: :json } do
      get 'archive', on: :member
    end
    resources :channels,         only: [:index] do
      get 'iptv', on: :collection
      get 'iframe', on: :member
    end
    resources :docs,             only: [:index] do
      get :teleset_documents, on: :collection
    end

    resources :payments, only: [:create]
    resource :payment_method, only: [:show, :update, :destroy]
    resources :products,         only: [:index, :show]
    resources :support_requests, only: [:create]
    resources :user_requests,    only: [:create]
    get 'billing_users/autocomplete' => 'addresses#autocomplete'
    get 'billing_users/tarif' => 'addresses#tarif'

    # post 'payments/minbank/approved' => 'payments/minbank#approved'
    # post 'payments/minbank/decline'  => 'payments/minbank#decline'
    # post 'payments/minbank/cancel'   => 'payments/minbank#cancel'

    get 'payments/sberbank/approved'   => 'payments/sberbank#approved'
    get 'payments/sberbank/decline'    => 'payments/sberbank#decline'
    get 'payments/sberbank/cancel'     => 'payments/sberbank#cancel'
    get 'payments/sberbank_sbp/notify' => 'payments/sberbank_sbp#notify'
    post 'payments/sberbank_sbp/notify' => 'payments/sberbank_sbp#notify'
    get 'payments/sberbank_auto/approved'   => 'payments/sberbank_auto#approved'
    get 'payments/sberbank_auto/decline'    => 'payments/sberbank_auto#decline'
    get 'payments/sberbank_auto/cancel'     => 'payments/sberbank_auto#cancel'
    post 'payments/yookassa/approved'   => 'payments/yookassa#approved'
    post 'agrm_documents/fdoc/set_status' => 'agrm_documents/fdoc#set_status'

    namespace :v1, defaults: { format: :json } do
      resources :agreement_documents, only: [:create, :show]
      resources :dogovors, defaults: {format: :json} do
        post :create_confirmed, on: :collection
        put :default, on: :member
        get :payments, on: :member
      end
      resources :email_confirmation, only: [:create], defaults: {format: :json} do
        get :confirm, on: :collection
        post :resend, on: :collection
      end
      resources :phone_confirmation, only: [:create], defaults: {format: :json} do
        post :confirm, on: :collection
      end
      resources :payments, only: [:create, :index], defaults: {format: :json} do
        post :promised, to: 'payments#create_promised', on: :collection
      end
      resources :auto_payments, only: [:create, :destroy, :index]
      resources :blocking_services, only: [:create, :destroy]
      resource :profile, only: [:show, :update], defaults: {format: :json} do
        collection do
          post :update_phone
        end
      end
      resource  :session, only: [:destroy, :create], defaults: {format: :json}
      resources :notifications, only: [:index, :update], defaults: {format: :json} do
        collection do
          put :mark_all_as_read
        end
      end
      resources :cameras, only: [:index], defaults: {format: :json} do
        get :board, on: :collection
      end
      resources :settings, only: [:show], defaults: {format: :json} do
        get :video_instruction_url, on: :collection
      end
      resources :invoices, only: [:show, :index]
    end

    namespace :v4, defaults: { format: :json } do
      resources :addresses, only: [], defaults: {format: :json} do
        collection do
          get :streets
          get :buildings
        end
      end
      resources :agreements, only: [:create, :index, :show, :destroy], defaults: {format: :json} do
        member do
          put :default
        end
      end
      resources :cameras, only: [:index]
      resources :devices, param: :device_token, only: [:show, :update, :create], defaults: {format: :json}
      resources :notifications, only: [:index, :update], defaults: {format: :json}
      resources :invoices, only: [:show, :index]
      resources :payments, only: [:create, :index]
      resource :profile, only: [:show, :update], defaults: {format: :json} do
        put :update_password
        put :update_phone
        put :confirm_phone
      end
      resources :registrations, only: [:create], defaults: {format: :json} do
        collection do
          post :confirm
          # post :resend_code
        end
      end
      resource :session, only: [:destroy], defaults: {format: :json} do
        collection do
          post :login
          post :phone
          post :confirm
        end
      end
      resources :settings, only: [:show], defaults: {format: :json} do
        get :video_instruction_url, on: :collection
      end
    end

    # namespace :m1, defaults: { format: :json } do
    #   post 'abonent/request_code' => 'abonents#request_code'
    #   post 'abonent/confirm_code' => 'abonents#confirm_code'
    #   post 'abonent/register_push_token' => 'abonents#register_push_token'
    #   post 'abonent/send_name' => 'abonents#send_name'
    #   post 'abonent/app_version' => 'abonents#app_version'

    #   post 'notifications/inbox' => 'notifications#inbox'
    #   post 'notifications/unreaded' => 'notifications#unreaded'
    #   post 'notifications/delivered' => 'notifications#delivered'

    #   post 'payments' => 'payments#index'
    #   post 'not_found_arr/*path' => 'base#not_found_arr'
    #   post 'not_found/*path' => 'base#not_found'
    # end

    get 'page_parts/*part_name' => 'application#page_part'
    get "*path", to: "application#index"
  end

  namespace :lbwidget do
    get "addresses/streets",   to: "addresses#streets"
    get "addresses/buildings", to: "addresses#buildings"
    get "addresses/flats",     to: "addresses#flats"
    get "addresses/accounts",  to: "addresses#accounts"

    resources :calls, only: [:create]
    resources :call_reasons, only: [:index]
  end

  telegram_webhook Telegram::WebhookController

  get '/page_parts/*part_name' => 'application#page_part'

  get "widget", to: "application#widget"
  get "/m", to: "application#mobile"
  get "/m/*path", to: "application#mobile"
  get "*path", to: "application#index"
  root to: "application#index"
end
