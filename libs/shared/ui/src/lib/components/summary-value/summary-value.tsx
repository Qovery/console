export interface SummaryValueProps {
  label: string
  value: string | number | boolean | null | undefined
  testId?: string
}

export function SummaryValue({ label, value, testId }: SummaryValueProps) {
  return (
    <li data-testid={testId}>
      <strong className="font-medium text-neutral">{label}:</strong> {value != null ? String(value) : '-'}
    </li>
  )
}

export default SummaryValue
