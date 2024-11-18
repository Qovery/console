import { type GitProviderEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { ExternalLink, InputSelect, LoaderSpinner } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useRepositories } from '../hooks/use-repositories/use-repositories'

export interface GitRepositorySettingProps {
  gitProvider: keyof typeof GitProviderEnum
  gitTokenId?: string
  disabled?: boolean
  urlRepository?: string
}

export function GitRepositorySetting({ disabled, gitProvider, gitTokenId, urlRepository }: GitRepositorySettingProps) {
  const { control, setValue, watch } = useFormContext()
  const { organizationId = '' } = useParams()

  const watchFieldRepository = watch('repository')

  const {
    data: repositories = [],
    isLoading,
    isRefetching,
    isError,
  } = useRepositories({
    organizationId,
    gitProvider,
    gitToken: gitTokenId,
    enabled: !disabled,
  })

  if (isError) {
    return null
  }

  if (!disabled && (isLoading || isRefetching)) {
    return (
      <div className="flex justify-center">
        <LoaderSpinner />
      </div>
    )
  }

  return (
    <Controller
      name="repository"
      control={control}
      rules={{
        required: 'Please select a repository.',
        validate: () => true,
      }}
      render={({ field, fieldState: { error } }) => (
        <div>
          <InputSelect
            label="Repository"
            options={
              disabled
                ? [
                    {
                      label: upperCaseFirstLetter(watchFieldRepository) ?? '',
                      value: watchFieldRepository ?? '',
                    },
                  ]
                : repositories.map((repository) => ({
                    label: upperCaseFirstLetter(repository.name),
                    value: repository.name,
                  }))
            }
            onChange={(event) => {
              field.onChange(event)
              const currentRepository = repositories.find((repository) => repository.name === event)
              // Set default branch
              setValue('branch', currentRepository?.default_branch)
            }}
            value={field.value}
            error={error?.message}
            disabled={disabled}
            isSearchable
          />
          {urlRepository && (
            <ExternalLink className="ml-3" size="xs" href={urlRepository}>
              Go to repository
            </ExternalLink>
          )}
        </div>
      )}
    />
  )
}

export default GitRepositorySetting
