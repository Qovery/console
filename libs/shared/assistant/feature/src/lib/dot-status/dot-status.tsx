import { match } from 'ts-pattern'

export function DotStatus({ color }: { color: 'red' | 'yellow' | 'green' }) {
  return match(color)
    .with('red', () => <div className="box-content h-2 w-2 rounded-full bg-red-500 border-2 border-red-200" />)
    .with('yellow', () => <div className="box-content h-2 w-2 rounded-full bg-yellow-500 border-2 border-yellow-200" />)
    .with('green', () => <div className="box-content h-2 w-2 rounded-full bg-green-500 border-2 border-green-200" />)
    .exhaustive()
}

export default DotStatus
