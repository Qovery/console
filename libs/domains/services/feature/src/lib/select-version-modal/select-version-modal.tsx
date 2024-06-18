import { type HelmSourceRepositoryResponse } from 'qovery-typescript-axios'
import { type ComponentPropsWithoutRef, useState } from 'react'
import { Button, InputSelect, InputText } from '@qovery/shared/ui'
import useHelmChartsVersions from '../hooks/use-helm-charts-versions/use-helm-charts-versions'

export interface SelectVersionModalProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onSubmit'> {
  title?: string
  description?: string
  submitLabel: string
  currentVersion?: string
  repository?: HelmSourceRepositoryResponse
  organizationId: string
  onCancel: () => void
  onSubmit: (targetVersion: string) => void
}

export function SelectVersionModal({
  title,
  description,
  submitLabel,
  children,
  currentVersion,
  repository,
  organizationId,
  onCancel,
  onSubmit,
}: SelectVersionModalProps) {
  const [targetVersion, setTargetVersion] = useState<string | undefined>(currentVersion)
  const { data: versions } = useHelmChartsVersions({
    organizationId,
    helmRepositoryId: repository?.repository.id,
    chartName: repository?.chart_name,
  })

  return (
    <div className="flex flex-col gap-6 p-5">
      <div className="flex flex-col gap-2 text-sm text-neutral-350">
        <h2 className="h4 max-w-sm truncate text-neutral-400">{title}</h2>
        <p className="text-neutral-350">{description}</p>
        {children}
      </div>
      {versions && versions.length > 0 ? (
        <InputSelect
          label="Version"
          options={
            versions?.[0].versions?.map((v) => ({
              label: v,
              value: v,
            })) ?? []
          }
          onChange={(value) => setTargetVersion(value as string)}
          value={targetVersion}
          isSearchable
          portal
        />
      ) : (
        <InputText
          name="version"
          onChange={(e) => setTargetVersion(e.target.value)}
          value={targetVersion}
          label="Version"
          type="text"
        />
      )}

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
