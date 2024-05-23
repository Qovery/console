import { match } from 'ts-pattern'

export function DotStatus({ color }: { color: 'red' | 'yellow' | 'green' }) {
  return match(color)
    .with('red', () => <div className="box-content h-2 w-2 rounded-full border-2 border-red-200 bg-red-500" />)
    .with('yellow', () => <div className="box-content h-2 w-2 rounded-full border-2 border-yellow-200 bg-yellow-500" />)
    .with('green', () => <div className="box-content h-2 w-2 rounded-full border-2 border-green-200 bg-green-500" />)
    .exhaustive()
}

export default DotStatus
