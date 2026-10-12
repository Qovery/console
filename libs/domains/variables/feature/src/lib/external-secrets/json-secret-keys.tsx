import { Button, CopyToClipboard } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

export function JsonSecretKeys({ keys, label, className }: { keys: string[]; label: string; className?: string }) {
  return (
    <ul aria-label={label} className={twMerge('flex flex-wrap gap-2', className)}>
      {keys.map((key) => (
        <li key={key} className="max-w-full">
          <CopyToClipboard text={key}>
            <Button
              type="button"
              color="neutral"
              variant="outline"
              size="xs"
              aria-label={`Copy ${key}`}
              title={`Copy ${key}`}
              className="max-w-full font-normal"
            >
              <span className="truncate">{key}</span>
            </Button>
          </CopyToClipboard>
        </li>
      ))}
    </ul>
  )
}
