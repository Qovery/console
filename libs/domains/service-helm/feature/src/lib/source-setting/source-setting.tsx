import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { InputSelect, InputText, LoaderSpinner } from '@qovery/shared/ui'
import useHelmRepository from '../hooks/use-helm-repository/use-helm-repository'

export function SourceSetting() {
  const { organizationId = '' } = useParams()
  const { control, watch } = useFormContext()
  const watchFieldProvider = watch('source_provider')

  const {
    data: helmRepositories = [],
    isLoading: isLoadingHelmRepositories,
    isFetched: isFetchedHelmRepositories,
  } = useHelmRepository({
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
                />
              )}
            />
          )}
          <Controller
            name="chart_name"
            control={control}
            rules={{
              required: 'Please enter a chart name.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                label="Chart name"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                error={error?.message}
              />
            )}
          />
          <Controller
            name="chart_version"
            control={control}
            rules={{
              required: 'Please enter a version.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                label="Version"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                error={error?.message}
              />
            )}
          />
        </div>
      )}
    </div>
  )
}

export default SourceSetting
