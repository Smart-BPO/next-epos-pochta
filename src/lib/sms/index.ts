/** SMS providers — server-only. Default: Play Mobile (UZ). */
export {
  createSmsMessageId,
  getPlaymobileBaseUrl,
  getPlaymobileOriginator,
  hasPlaymobileConfig,
  normalizeUzMsisdn,
  sendSms,
  sendSmsBatch,
  type PlaymobileSmsMessage,
  type PlaymobileSmsResult,
} from "./playmobile";
