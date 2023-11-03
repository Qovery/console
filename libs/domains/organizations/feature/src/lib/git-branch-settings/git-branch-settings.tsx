import { type GitProviderEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { InputSelect, InputText, LoaderSpinner } from '@qovery/shared/ui'
import { getGitTokenValue } from '../git-provider-setting/git-provider-setting'
import { useBranches } from '../hooks/use-branches/use-branches'

export interface GitBranchSettingsProps {
  gitProvider: GitProviderEnum
  disabled?: boolean
}

export function GitBranchSettings({ disabled, gitProvider }: GitBranchSettingsProps) {
  const { control, watch } = useFormContext()
  const { organizationId = '' } = useParams()

  const gitToken = getGitTokenValue(gitProvider)
  const provider = gitToken ? gitToken?.type : gitProvider
  const watchFieldRepository = watch('repository')
  const watchFieldBranch = watch('branch')

  const {
    data: branches = [],
    isError,
    isLoading,
    isRefetching,
  } = useBranches({
    organizationId,
    gitProvider: provider,
    name: watchFieldRepository,
    gitToken: gitToken?.id,
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
    <>
      <Controller
        name="branch"
        control={control}
        rules={{
          required: 'Please select a branch.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            label="Branch"
            options={
              disabled
                ? [
                    {
                      label: watchFieldBranch ?? '',
                      value: watchFieldBranch ?? '',
                    },
                  ]
                : branches.map((branch) => ({
                    label: branch.name,
                    value: branch.name,
                  }))
            }
            onChange={field.onChange}
            value={field.value}
            error={error?.message}
            disabled={disabled}
            isSearchable
          />
        )}
      />
      <Controller
        name="root_path"
        control={control}
        defaultValue="/"
        rules={{
          required: 'Value required',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            label="Root application path"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            error={error?.message}
            disabled={disabled}
          />
        )}
      />
    </>
  )
}

export default GitBranchSettings
