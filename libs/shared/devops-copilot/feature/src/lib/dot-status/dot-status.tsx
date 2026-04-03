import { match } from 'ts-pattern'

export function DotStatus({ color }: { color: 'red' | 'yellow' | 'green' }) {
  return match(color)
    .with('red', () => (
      <div className="box-content h-2 w-2 rounded-full border-2 border-negative-subtle bg-surface-negative-solid" />
    ))
    .with('yellow', () => (
      <div className="box-content h-2 w-2 rounded-full border-2 border-warning-subtle bg-surface-warning-solid" />
    ))
    .with('green', () => (
      <div className="box-content h-2 w-2 rounded-full border-2 border-positive-subtle bg-surface-positive-solid" />
    ))
    .exhaustive()
}

export default DotStatus
