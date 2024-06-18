import { HelmRepositoryKindEnum } from 'qovery-typescript-axios'
import { type ComponentPropsWithoutRef, useState } from 'react'
import { Button, InputSelect, InputText } from '@qovery/shared/ui'

export interface SelectVersionModalProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onSubmit'> {
  title?: string
  description?: string
  submitLabel: string
  currentVersion?: string
  kind?: HelmRepositoryKindEnum
  onCancel: () => void
  onSubmit: (targetVersion: string) => void
}

export function SelectVersionModal({
  title,
  description,
  submitLabel,
  children,
  currentVersion,
  kind,
  onCancel,
  onSubmit,
}: SelectVersionModalProps) {
  const [targetVersion, setTargetVersion] = useState<string | undefined>()

  return (
    <div className="flex flex-col gap-6 p-5">
      <div className="flex flex-col gap-2 text-sm text-neutral-350">
        <h2 className="h4 max-w-sm truncate text-neutral-400">{title}</h2>
        <p className="text-neutral-350">{description}</p>
        {children}
      </div>
      {kind &&
      ![
        'OCI_ECR',
        'OCI_SCALEWAY_CR',
        'OCI_DOCKER_HUB',
        'OCI_PUBLIC_ECR',
        'OCI_GENERIC_CR',
        'OCI_GITHUB_CR',
        'OCI_GITLAB_CR',
      ].includes(kind) ? (
        <InputSelect
          label="Chart name"
          options={helmsChartsOptions}
          onChange={field.onChange}
          value={field.value}
          error={
            helmsChartsOptions.length === 0
              ? 'No chart name found. Please verify that the helm repository is correct.'
              : undefined
          }
          isSearchable
        />
      ) : (
        <InputText
          label="Chart name"
          name={field.name}
          onChange={field.onChange}
          value={field.value}
          error={error?.message}
        />
      )}
      <InputText
        name="version"
        onChange={(e) => setTargetVersion(e.target.value)}
        value={currentVersion}
        label="Version"
        type="text"
      />
      <div className="flex justify-end gap-3">
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
