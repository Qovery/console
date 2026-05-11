import { useParams } from '@tanstack/react-router'
import { type HelmRepositoryKindEnum } from 'qovery-typescript-axios'
import { Suspense } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { HelmRepositoryCreateEditModal } from '@qovery/domains/organizations/feature'
import { Icon, InputSelect, InputText, LoaderSpinner, useModal } from '@qovery/shared/ui'
import { useHelmCharts } from '../hooks/use-helm-charts/use-helm-charts'
import { useHelmRepositories } from '../hooks/use-helm-repositories/use-helm-repositories'

export function HelmChartsSetting({
  organizationId,
  helmRepositoryId,
  kind,
}: {
  organizationId: string
  helmRepositoryId: string
  kind?: HelmRepositoryKindEnum
}) {
  const { control, watch, setValue } = useFormContext()

  const isOci = kind?.startsWith('OCI_')

  const { data: helmCharts, isFetching: isFetchingHelmCharts } = useHelmCharts({
    organizationId,
    helmRepositoryId,
    enabled: !isOci,
  })
  const watchChartName = watch('chart_name')

  const helmsChartsOptions =
    helmCharts?.map((helmChart) => ({
      label: helmChart.chart_name ?? '',
      value: helmChart.chart_name ?? '',
    })) ?? []

  const helmsChartsVersionsOptions =
    helmCharts
      ?.find((helmChart) => helmChart.chart_name === watchChartName)
      ?.versions?.map((version) => ({
        label: version,
        value: version,
      })) ?? []

  return !isOci && isFetchingHelmCharts ? (
    <div className="flex justify-center">
      <LoaderSpinner />
    </div>
  ) : (
    <>
      <Controller
        name="chart_name"
        control={control}
        rules={{
          required: 'Please enter a chart name.',
        }}
        render={({ field, fieldState: { error } }) =>
          !isOci ? (
            <InputSelect
              label="Chart name"
              options={helmsChartsOptions}
              onChange={(event) => {
                setValue('chart_version', undefined)
                field.onChange(event)
              }}
              value={field.value}
              error={
                helmsChartsOptions.length === 0
                  ? 'No chart name found. Please verify that the helm repository is correct.'
                  : error?.message
              }
              isSearchable
            />
          ) : (
            <InputText
              label="Chart name"
              name={field.name}
              onChange={(event) => {
                event.target.value = event.target.value.trim()
                field.onChange(event)
              }}
              value={field.value}
              error={error?.message}
            />
          )
        }
      />
      {watchChartName && (
        <Controller
          name="chart_version"
          control={control}
          rules={{
            required: 'Please enter a version.',
          }}
          render={({ field, fieldState: { error } }) =>
            !isOci && helmsChartsVersionsOptions.length > 0 ? (
              <InputSelect
                label="Version"
                options={helmsChartsVersionsOptions}
                onChange={field.onChange}
                value={field.value}
                error={error?.message}
                isSearchable
                filterOption="startsWith"
              />
            ) : (
              <InputText
                label="Version"
                name={field.name}
                onChange={(event) => {
                  event.target.value = event.target.value.trim()
                  field.onChange(event)
                }}
                value={field.value}
                error={error?.message}
                hint={
                  !isOci && helmsChartsVersionsOptions.length === 0 ? (
                    <span className="text-warning">
                      No version found. Please verify that the chart name or helm repository is correct. You can still
                      enter your version manually.
                    </span>
                  ) : undefined
                }
              />
            )
          }
        />
      )}
    </>
  )
}

function HelmRepositorySourceContent() {
  const { organizationId = '' } = useParams({ strict: false })
  const { control, watch } = useFormContext()
  const { openModal, closeModal } = useModal()
  const watchRepository = watch('repository')

  const { data: helmRepositories = [] } = useHelmRepositories({
    organizationId,
    enabled: true,
    suspense: true,
  })

  return (
    <div className="flex flex-col gap-3">
      <Controller
        name="repository"
        control={control}
        rules={{
          required: 'Please select a repository.',
          validate: () => true,
        }}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            label="Repository"
            options={helmRepositories.map((helmRepository) => ({
              label: helmRepository.name ?? '',
              value: helmRepository.id,
            }))}
            onChange={field.onChange}
            value={field.value}
            error={error?.message}
            isSearchable
            menuListButton={{
              title: 'Select helm repository',
              label: 'New helm repository',
              icon: <Icon iconName="circle-plus" className="text-brand" />,
              onClick: () => {
                openModal({
                  content: (
                    <HelmRepositoryCreateEditModal
                      organizationId={organizationId}
                      onClose={(response) => {
                        response && field.onChange(response.id)
                        closeModal()
                      }}
                    />
                  ),
                  options: {
                    fakeModal: true,
                  },
                })
              },
            }}
          />
        )}
      />
      {watchRepository && (
        <HelmChartsSetting
          organizationId={organizationId}
          helmRepositoryId={watchRepository}
          kind={helmRepositories.find((r) => r.id === watchRepository)?.kind}
        />
      )}
    </div>
  )
}

export function SourceSetting({ disabled = false }: { disabled?: boolean }) {
  const { control, watch, resetField } = useFormContext()
  const watchFieldProvider = watch('source_provider')

  return (
    <div className="flex flex-col gap-3">
      <Controller
        name="source_provider"
        control={control}
        rules={{
          required: 'Please select a Helm source.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            label="Helm source"
            disabled={disabled}
            options={[
              {
                label: 'Git provider',
                value: 'GIT',
              },
              {
                label: 'Helm repository',
                value: 'HELM_REPOSITORY',
              },
            ]}
            onChange={(value) => {
              resetField('repository')
              field.onChange(value)
            }}
            value={field.value}
            error={error?.message}
          />
        )}
      />
      {watchFieldProvider === 'HELM_REPOSITORY' && (
        <Suspense
          fallback={
            <div className="flex justify-center">
              <LoaderSpinner />
            </div>
          }
        >
          <HelmRepositorySourceContent />
        </Suspense>
      )}
    </div>
  )
}

export default SourceSetting
