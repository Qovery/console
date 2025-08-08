import { type GitProviderEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { InputSelect, InputText, LoaderSpinner } from '@qovery/shared/ui'
import { useBranches } from '../hooks/use-branches/use-branches'

export interface GitBranchSettingsProps {
  gitProvider: keyof typeof GitProviderEnum
  gitTokenId?: string
  disabled?: boolean
  hideRootPath?: boolean
  rootPathLabel?: string
  rootPathHint?: string
}

export function GitBranchSettings({
  disabled,
  gitProvider,
  gitTokenId,
  hideRootPath,
  rootPathLabel = 'Application root folder path',
  rootPathHint = 'Provide the folder path in the repository where the application is located.',
}: GitBranchSettingsProps) {
  const { control, watch } = useFormContext()
  const { organizationId = '' } = useParams()

  const watchFieldRepository = watch('repository')
  const watchFieldBranch = watch('branch')

  const {
    data: branches = [],
    isError,
    isLoading,
    isRefetching,
  } = useBranches({
    organizationId,
    gitProvider,
    name: watchFieldRepository,
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
      {!hideRootPath && (
        <Controller
          name="root_path"
          control={control}
          defaultValue="/"
          rules={{
            required: 'Value required',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              label={rootPathLabel}
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
              disabled={disabled}
              hint={rootPathHint}
            />
          )}
        />
      )}
    </>
  )
}

export default GitBranchSettings
