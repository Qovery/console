// Synthetic test input for /audit eval — planted design issues.
import { Tag, Button, ButtonPrimitive } from '@qovery/shared/ui'

interface ServiceRowProps {
  name: string
  status: 'running' | 'degraded' | 'stopped'
  onRestart: () => void
  onDelete: () => void
}

export function ServiceRow({ name, status, onRestart, onDelete }: ServiceRowProps) {
  const statusColor =
    status === 'running'
      ? 'text-green-500'
      : status === 'degraded'
        ? 'text-yellow-500'
        : 'text-red-500'

  return (
    <div className="flex items-center gap-5 p-5 border border-neutral-300 rounded">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-700">{name}</span>
        <span className={`text-xs ${statusColor}`}>{status}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Tag color="green">v1.2.3</Tag>

        <ButtonPrimitive
          onClick={onRestart}
          className="px-3 py-2 text-sm focus:outline-none"
          style={{ backgroundColor: '#7c3aed', color: 'white' }}
        >
          Restart
        </ButtonPrimitive>

        <button onClick={onDelete} className="p-2 hover:bg-neutral-100">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>
    </div>
  )
}
