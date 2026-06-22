export const LOG_MESSAGE_DATA_ATTRIBUTE = 'data-log-message'
export const LOG_COPY_EXCLUDE_DATA_ATTRIBUTE = 'data-log-copy-exclude'

interface CopySelectedLogMessagesEvent {
  preventDefault: () => void
  clipboardData: Pick<DataTransfer, 'setData'>
}

function getSelectedLogText(container: HTMLElement) {
  const messageNodes = Array.from(container.querySelectorAll(`[${LOG_MESSAGE_DATA_ATTRIBUTE}="true"]`))

  if (messageNodes.length > 0) {
    return messageNodes.map((node) => node.textContent ?? '').join('\n')
  }

  return container.textContent
}

export function copySelectedLogMessages(event: CopySelectedLogMessagesEvent) {
  const selection = window.getSelection()

  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return

  const container = document.createElement('div')
  container.append(selection.getRangeAt(0).cloneContents())
  container.querySelectorAll(`[${LOG_COPY_EXCLUDE_DATA_ATTRIBUTE}="true"]`).forEach((node) => node.remove())

  const text = getSelectedLogText(container)
  if (!text) return

  event.preventDefault()
  event.clipboardData.setData('text/plain', text)
}
