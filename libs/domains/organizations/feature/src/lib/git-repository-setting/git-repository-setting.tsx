import { type GitProviderEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { InputSelect, LoaderSpinner } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { getGitTokenValue } from '../git-provider-setting/git-provider-setting'
import useRepositories from '../hooks/use-repositories/use-repositories'

export interface GitRepositorySettingProps {
  gitProvider: GitProviderEnum
  disabled?: boolean
}

export function GitRepositorySetting({ disabled, gitProvider }: GitRepositorySettingProps) {
  const { control, setValue, watch } = useFormContext()
  const { organizationId = '' } = useParams()

  const getGitToken = getGitTokenValue(gitProvider)
  const gitProviderOrTokenType = getGitToken ? getGitToken?.type : gitProvider
  const watchFieldRepository = watch('repository')

  const {
    data: repositories = [],
    isLoading,
    isRefetching,
    isError,
  } = useRepositories({
    organizationId,
    gitProvider: gitProviderOrTokenType,
    gitToken: getGitToken?.id,
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
      }}
      render={({ field, fieldState: { error } }) => (
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
      )}
    />
  )
}

export default GitRepositorySetting
