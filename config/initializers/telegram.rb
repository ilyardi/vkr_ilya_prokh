Telegram.bots_config = {
    default: '5412380128:AAFc2T24FyCd8QNvJ6QGaxNAG5aJQcXGYKg',
}

Telegram::Bot::UpdatesController.session_store = :redis_store, {expires_in: 1.month}