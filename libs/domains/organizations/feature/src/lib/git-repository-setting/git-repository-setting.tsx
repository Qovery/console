import { type GitProviderEnum, type GitRepository } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { type SelectOptionValue } from '@qovery/shared/interfaces'
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
  const { control, setValue, watch } = useFormContext<{
    git_repository: GitRepository | undefined
    branch: string | undefined
  }>()
  const { organizationId = '' } = useParams()

  const watchFieldGitRepository = watch('git_repository')

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
      name="git_repository"
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
                      label: upperCaseFirstLetter(watchFieldGitRepository?.name ?? '') ?? '',
                      value: watchFieldGitRepository ?? '',
                    },
                  ]
                : repositories.map((repository) => ({
                    label: upperCaseFirstLetter(repository.name),
                    value: repository,
                  }))
            }
            onChange={(option: SelectOptionValue | SelectOptionValue[]) => {
              field.onChange(option)
              const repository = repositories.find((repository) => repository.name === option)
              setValue('branch', repository?.default_branch)
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
