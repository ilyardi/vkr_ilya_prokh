import { WIDGET_SEARCH_HISTORY_ADD, WIDGET_SEARCH_HISTORY_UPDATE,
  WIDGET_MANAGER_PHONE_UPDATE } from "redux/constants"

export const historyAdd = (account) =>
  ({
    type: WIDGET_SEARCH_HISTORY_ADD,
    account: account,
  })

export const historyUpdate = (account) =>
  ({
    type: WIDGET_SEARCH_HISTORY_UPDATE,
    account: account,
  })

export const managerPhoneUpdate = (phone) =>
  ({
    type: WIDGET_MANAGER_PHONE_UPDATE,
    managerPhone: phone,
  })
