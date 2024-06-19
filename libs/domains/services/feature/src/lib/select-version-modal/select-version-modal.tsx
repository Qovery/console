import { type ContainerSource, type HelmSourceRepositoryResponse } from 'qovery-typescript-axios'
import { type ComponentPropsWithoutRef, useState } from 'react'
import { useContainerVersions } from '@qovery/domains/organizations/feature'
import { type Value } from '@qovery/shared/interfaces'
import { Button, InputSelect, LoaderSpinner } from '@qovery/shared/ui'
import { useHelmChartsVersions } from '../hooks/use-helm-charts-versions/use-helm-charts-versions'

function SelectChartVersion({
  repository,
  organizationId,
  ...props
}: {
  repository: HelmSourceRepositoryResponse
  organizationId: string
} & Pick<ComponentPropsWithoutRef<typeof InputSelect>, 'onChange' | 'value'>) {
  const { data: chartsVersions = [], isFetching } = useHelmChartsVersions({
    organizationId,
    helmRepositoryId: repository.repository.id,
    chartName: repository.chart_name,
  })
  const options =
    chartsVersions
      .find(({ chart_name }) => chart_name === repository.chart_name)
      ?.versions?.map<Value>((v) => ({
        label: v,
        value: v,
      })) ?? []

  return isFetching ? (
    <div className="flex justify-center">
      <LoaderSpinner />
    </div>
  ) : (
    <InputSelect label="Version" options={options} isSearchable portal {...props} />
  )
}

function SelectImageVersion({
  organizationId,
  containerSource,
  ...props
}: {
  organizationId: string
  containerSource: ContainerSource
} & Pick<ComponentPropsWithoutRef<typeof InputSelect>, 'onChange' | 'value'>) {
  const { data: containerVersions = [], isFetching } = useContainerVersions({
    organizationId,
    containerRegistryId: containerSource.registry.id,
    imageName: containerSource.image_name,
  })

  const options =
    containerVersions
      .find(({ image_name }) => image_name === containerSource.image_name)
      ?.versions?.map<Value>((version) => ({
        value: version,
        label: version,
        isDisabled: version === 'latest',
      })) ?? []

  return isFetching ? (
    <div className="flex justify-center">
      <LoaderSpinner />
    </div>
  ) : (
    <InputSelect label="Version" options={options} isSearchable portal {...props} />
  )
}

export interface SelectVersionModalProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onSubmit'> {
  title?: string
  description?: string
  submitLabel: string
  currentVersion?: string
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
  organizationId,
  onCancel,
  onSubmit,
  ...props
}: SelectVersionModalProps &
  (
    | {
        repository: HelmSourceRepositoryResponse
      }
    | {
        containerSource: ContainerSource
      }
  )) {
  const [targetVersion, setTargetVersion] = useState<string | undefined>(currentVersion)

  return (
    <div className="flex flex-col gap-6 p-5">
      <div className="flex flex-col gap-2 text-sm text-neutral-350">
        <h2 className="h4 max-w-sm truncate text-neutral-400">{title}</h2>
        <p className="text-neutral-350">{description}</p>
        {children}
      </div>
      {'repository' in props ? (
        <SelectChartVersion
          organizationId={organizationId}
          repository={props.repository}
          onChange={(value) => setTargetVersion(value as string)}
          value={targetVersion}
        />
      ) : (
        <SelectImageVersion
          organizationId={organizationId}
          containerSource={props.containerSource}
          onChange={(value) => setTargetVersion(value as string)}
          value={targetVersion}
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
