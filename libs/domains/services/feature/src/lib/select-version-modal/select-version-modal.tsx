import { type ContainerSource, type HelmSourceRepositoryResponse } from 'qovery-typescript-axios'
import { type ComponentPropsWithoutRef, useState } from 'react'
import { useContainerVersions } from '@qovery/domains/organizations/feature'
import { type Value } from '@qovery/shared/interfaces'
import { Button, Icon, InputSelect, InputText, LoaderSpinner, Tooltip } from '@qovery/shared/ui'
import { useHelmChartsVersions } from '../hooks/use-helm-charts-versions/use-helm-charts-versions'

function SelectChartVersion({
  repository,
  organizationId,
  onChange,
  value,
}: {
  repository: HelmSourceRepositoryResponse
  organizationId: string
  onChange: (value: string) => void
  value?: string
}) {
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
    <div className="flex h-14 justify-center">
      <LoaderSpinner className="h-5 w-5" />
    </div>
  ) : options.length > 0 ? (
    <InputSelect
      label="Version"
      options={options}
      filterOption="startsWith"
      isSearchable
      portal
      onChange={(value) => onChange(value as string)}
      value={value}
    />
  ) : (
    <InputText
      name="version"
      label="Version"
      type="text"
      onChange={(e) => onChange(e.target.value)}
      value={value}
      hint={
        <span className="text-orange-500">
          No version found. Please verify that the chart name or helm repository is correct. You can still enter your
          version manually.
        </span>
      }
    />
  )
}

function SelectImageVersion({
  organizationId,
  containerSource,
  onChange,
  value,
}: {
  organizationId: string
  containerSource: ContainerSource
  onChange: (value: string) => void
  value?: string
}) {
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
        label:
          version === 'latest' ? (
            <span className="flex items-center gap-3">
              <span>{version}</span>
              <Tooltip classNameContent="z-10" content="Image tag cannot be latest to ensure consistent deployment">
                <span>
                  <Icon
                    iconName="circle-info"
                    iconStyle="regular"
                    className="text-base text-neutral-400 dark:text-neutral-50"
                  />
                </span>
              </Tooltip>
            </span>
          ) : (
            version
          ),
        isDisabled: version === 'latest',
      })) ?? []

  return isFetching ? (
    <div className="flex h-14 justify-center">
      <LoaderSpinner className="h-5 w-5" />
    </div>
  ) : options.length > 0 ? (
    <InputSelect
      label="Version"
      options={options}
      filterOption="startsWith"
      isSearchable
      portal
      onChange={(value) => onChange(value as string)}
      value={value}
      hint="Image tag shall be unique (no ‘main’, ‘dev’, ‘master’)"
    />
  ) : (
    <InputText
      name="version"
      label="Version"
      type="text"
      onChange={(e) => onChange(e.target.value)}
      value={value}
      hint={
        <>
          <span className="text-orange-500">
            No tag found. Please verify that the container registry and the image name is correct. You can still enter
            your image tag manually.
          </span>
          <br />
          Image tag shall be unique (no ‘main’, ‘dev’, ‘master’)
        </>
      }
    />
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
      <div className="flex flex-col gap-2 text-sm">
        <h2 className="h4 max-w-sm truncate text-neutral-400 dark:text-neutral-50">{title}</h2>
        <p className="text-neutral-350 dark:text-neutral-50">{description}</p>
        {children}
      </div>
      {'repository' in props ? (
        <SelectChartVersion
          organizationId={organizationId}
          repository={props.repository}
          onChange={setTargetVersion}
          value={targetVersion}
        />
      ) : (
        <SelectImageVersion
          organizationId={organizationId}
          containerSource={props.containerSource}
          onChange={setTargetVersion}
          value={targetVersion}
        />
      )}

      <div className="flex justify-end gap-3">
        <Button variant="plain" color="neutral" size="lg" onClick={() => onCancel()}>
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
