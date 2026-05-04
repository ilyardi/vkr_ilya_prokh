set :output, './log/cron.log'
job_type :rake, "cd :path && :environment_variable=:environment CRON_RUN=true bundle exec rake :task :output"

every 1.minutes do
  rake 'reports:unactive_agreements', output: './log/cron_reports_unactive_agreements.log'
  rake 'requests:send_status_alert', output: './log/cron_requests_send_status_alert.log'
  rake 'asterisk:sync_calls', output: './log/cron_asterisk_sync_calls.log'
end

every 3.minutes do
  # run check payments
  rake 'billing:check_payments', output: './log/cron_billing_check_payments.log'
end

every 5.minutes do
  rake 'reports:debtor_ips', output: './log/cron_reports_debtor_ips.log'
  rake 'dogovors:block_demo', output: './log/cron_dogovors_block_demo.log'
  rake 'debtors:find_and_rehabilitation_stuck_debtors', output: './log/cron_debtors_find_and_rehabilitation_stuck_debtors.log'
end

every 1.hour do
  rake 'billing:cancel_promised_payments', output: './log/cron_billing_cancel_promised_payments.log'
  rake 'sync_billing:synchronize_ports', output: './log/cron_sync_billing_synchronize_ports.log'

  rake 'sorm:payments', output: './log/cron_sorm_payments_fillup.log'

  # rake 'cameras:create_timelapse[cam_skver_orbita,"2025-05-07"]'
  # rake 'cameras:create_timelapse[cam_mobile,"2025-05-07"]'
end

every :day, at: '03:00' do # Time in UTC
  rake 'irc:load_payments', output: './log/cron_irc_load_payments.log'
  rake 'sorm:accounts', output: './log/cron_sorm_accounts.log'
end

every '0 0 1 * *' do
  rake 'reports:tar50_70_ips', output: './log/cron_reports_tar50_70_ips.log'
end

every '0 0 2 * *' do
  rake 'debtors:find_mono_debtors', output: './log/cron_debtors_find_debtors.log'
  rake 'debtors:find_packet_debtors', output: './log/cron_debtors_find_debtors.log'
  rake 'debtors:find_int_debtors', output: './log/cron_debtors_find_debtors.log'
end

every '0 0 11 * *' do
  rake 'debtors:find_packet_debtors', output: './log/cron_debtors_find_debtors.log'
  rake 'debtors:find_svn_debtors', output: './log/cron_debtors_find_debtors.log'
  rake 'debtors:find_ud_debtors', output: './log/cron_debtors_find_debtors.log'
end

every :day, at: '06:00' do
  rake 'blocking_services:check_expiration', output: './log/cron_blocking_services_expiration.log'
end

every :day, at: '20:40' do
  rake 'auto_payment_methods:fix_stuck_apm', output: './log/cron_auto_payment_methods_fix_stuck_apm.log'
end

every :day, at: '01:00' do
  rake 'expenses:generate_expense_by_temp', output: './log/cron_expenses_generate_expense_by_temp.log'
end
