import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { HelmRepositoryCreateEditModal } from '@qovery/domains/organizations/feature'
import { IconAwesomeEnum, IconFa, InputSelect, InputText, LoaderSpinner, useModal } from '@qovery/shared/ui'
import { useHelmRepositories } from '../hooks/use-helm-repositories/use-helm-repositories'

export function SourceSetting({ disabled = false }: { disabled?: boolean }) {
  const { organizationId = '' } = useParams()
  const { openModal, closeModal } = useModal()
  const { control, watch } = useFormContext()
  const watchFieldProvider = watch('source_provider')

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
                      icon: <IconFa name={IconAwesomeEnum.CIRCLE_PLUS} className="text-brand-500" />,
                      onClick: () => {
                        openModal({
                          content: (
                            <HelmRepositoryCreateEditModal organizationId={organizationId} onClose={closeModal} />
                          ),
                        })
                      },
                    }}
                  />
                )}
              />
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
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default SourceSetting
