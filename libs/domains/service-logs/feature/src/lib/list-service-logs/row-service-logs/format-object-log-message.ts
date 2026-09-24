export function formatObjectLogMessage(message: string): string {
  try {
    const parsedMessage: unknown = JSON.parse(message)

    if (typeof parsedMessage !== 'object' || parsedMessage === null || Array.isArray(parsedMessage)) {
      return message
    }

    return JSON.stringify(parsedMessage, null, 2)
  } catch {
    return message
  }
}
