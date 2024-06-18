import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { HelmRepositoryCreateEditModal } from '@qovery/domains/organizations/feature'
import { Icon, InputSelect, LoaderSpinner, useModal } from '@qovery/shared/ui'
import { useHelmCharts } from '../hooks/use-helm-charts/use-helm-charts'
import { useHelmRepositories } from '../hooks/use-helm-repositories/use-helm-repositories'

export function HelmChartsSetting({
  organizationId,
  helmRepositoryId,
}: {
  organizationId: string
  helmRepositoryId: string
}) {
  const { control, watch } = useFormContext()
  const {
    data: helmCharts,
    isLoading: isLoadingHelmCharts,
    isFetched: isFetchedHelmCharts,
  } = useHelmCharts({ organizationId, helmRepositoryId })
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

  return (
    <>
      {!isFetchedHelmCharts || isLoadingHelmCharts ? (
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
            render={({ field }) => (
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
            )}
          />
          {watchChartName && (
            <Controller
              name="chart_version"
              control={control}
              rules={{
                required: 'Please enter a version.',
              }}
              render={({ field }) => (
                <InputSelect
                  label="Version"
                  options={helmsChartsVersionsOptions}
                  onChange={field.onChange}
                  value={field.value}
                  error={
                    helmsChartsVersionsOptions.length === 0
                      ? 'No version found. Please verify that the chart name or helm repository is correct.'
                      : undefined
                  }
                  isSearchable
                />
              )}
            />
          )}
        </>
      )}
    </>
  )
}

export function SourceSetting({ disabled = false }: { disabled?: boolean }) {
  const { organizationId = '' } = useParams()
  const { openModal, closeModal } = useModal()
  const { control, watch } = useFormContext()
  const watchFieldProvider = watch('source_provider')
  const watchRepository = watch('repository')

  const {
    data: helmRepositories = [],
    isLoading: isLoadingHelmRepositories,
    isFetched: isFetchedHelmRepositories,
  } = useHelmRepositories({
    organizationId,
    enabled: watchFieldProvider === 'HELM_REPOSITORY',
  })

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
            onChange={field.onChange}
            value={field.value}
            error={error?.message}
          />
        )}
      />
      {watchFieldProvider === 'HELM_REPOSITORY' && (
        <div className="flex flex-col gap-3">
          {!isFetchedHelmRepositories || isLoadingHelmRepositories ? (
            <div className="flex justify-center">
              <LoaderSpinner />
            </div>
          ) : (
            <>
              <Controller
                name="repository"
                control={control}
                rules={{
                  required: 'Please select a repository.',
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
                      icon: <Icon iconName="circle-plus" className="text-brand-500" />,
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
                        })
                      },
                    }}
                  />
                )}
              />
              {watchRepository && (
                <HelmChartsSetting organizationId={organizationId} helmRepositoryId={watchRepository} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default SourceSetting
