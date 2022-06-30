export function copyToClipboard(str: string): void {
  navigator.clipboard.writeText(str)
}
