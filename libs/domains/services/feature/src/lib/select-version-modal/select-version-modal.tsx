import { type ComponentPropsWithoutRef, useState } from 'react'
import { Button, InputText } from '@qovery/shared/ui'

export interface SelectVersionModalProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onSubmit'> {
  title?: string
  description?: string
  submitLabel: string
  currentVersion?: string
  onCancel: () => void
  onSubmit: (targetVersion: string) => void
}

export function SelectVersionModal({
  title,
  description,
  submitLabel,
  children,
  currentVersion,
  onCancel,
  onSubmit,
}: SelectVersionModalProps) {
  const [targetVersion, setTargetVersion] = useState<string | undefined>()

  return (
    <div className="flex flex-col gap-6 p-5">
      <div className="flex flex-col gap-2 text-sm text-neutral-350">
        <h2 className="h4 text-neutral-400 max-w-sm truncate mb-1">{title}</h2>
        <p>{description}</p>
        {children}
      </div>
      <InputText
        name="version"
        onChange={(e) => setTargetVersion(e.target.value)}
        value={currentVersion}
        label="Version"
        type="text"
      />
      <div className="flex gap-3 justify-end">
        <Button variant="outline" color="neutral" size="lg" onClick={() => onCancel()}>
          Cancel
        </Button>
        <Button disabled={!targetVersion} size="lg" onClick={() => onSubmit(targetVersion!)}>
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}

export default SelectVersionModal
