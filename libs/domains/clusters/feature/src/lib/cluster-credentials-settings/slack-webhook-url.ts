const SLACK_WEBHOOK_URL_PATTERN = new RegExp(
  String.raw`^https://hooks\.slack\.com(?::\d+)?/(?:[A-Za-z0-9._~-]|%[A-Fa-f0-9]{2}|[!$&'()*+,;=:@])(?:[A-Za-z0-9._~-]|%[A-Fa-f0-9]{2}|[!$&'()*+,;=:@/])*(?:\?(?:[A-Za-z0-9._~-]|%[A-Fa-f0-9]{2}|[!$&'()*+,;=:@/?])*)?(?:#(?:[A-Za-z0-9._~-]|%[A-Fa-f0-9]{2}|[!$&'()*+,;=:@/?])*)?$`,
  'i'
)

const SLACK_WEBHOOK_URL_ERROR = 'Enter a valid Slack webhook URL from hooks.slack.com.'

export const validateSlackWebhookUrl = (value?: string | null) => {
  const url = value?.trim() ?? ''
  return !url || SLACK_WEBHOOK_URL_PATTERN.test(url) || SLACK_WEBHOOK_URL_ERROR
}
