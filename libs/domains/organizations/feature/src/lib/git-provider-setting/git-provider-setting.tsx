import { type GitAuthProvider, type GitProviderEnum, type GitTokenResponse } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { Icon, InputSelect } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import useAuthProviders from '../hooks/use-auth-providers/use-auth-providers'
import useGitTokens from '../hooks/use-git-tokens/use-git-tokens'

export interface GitProviderSettingProps {
  disabled?: boolean
}

export const mergeProviders = (authProviders: GitAuthProvider[] = [], gitTokens: GitTokenResponse[] = []) => {
  const currentAuthProviders = authProviders.map((provider) => ({
    label: `${upperCaseFirstLetter(provider.name)} (${provider.owner})`,
    value: provider.name || '',
    icon: <Icon width={16} height={16} name={provider.name} />,
  }))

  const currentGitTokens = gitTokens.map((token) => ({
    label: upperCaseFirstLetter(token.name),
    value: `TOKEN_${token.type}_${token.id}`,
    icon: <Icon width={16} height={16} name={token.type} />,
  }))

  return [...currentAuthProviders, ...currentGitTokens]
}

export const getGitTokenValue = (value: string) => {
  if (value?.includes('TOKEN')) return { type: value.split('_')[1] as GitProviderEnum, id: value.split('_')[2] }
  return null
}

export function GitProviderSetting({ disabled }: GitProviderSettingProps) {
  const { control, watch, setValue } = useFormContext()
  const { organizationId = '' } = useParams()

  const { data: authProviders = [] } = useAuthProviders({ organizationId, enabled: !disabled })
  const { data: gitTokens = [] } = useGitTokens({ organizationId, enabled: !disabled })
  const watchFieldProvider = watch('provider')

  const providerOptions = disabled
    ? [
        {
          label: watchFieldProvider ?? '',
          value: watchFieldProvider ?? '',
          icon: <Icon name={`${watchFieldProvider?.split(' ')[0].toUpperCase()}`} />,
        },
      ]
    : mergeProviders(authProviders, gitTokens)

  return (
    <Controller
      name="provider"
      control={control}
      rules={{
        required: 'Please select a provider.',
      }}
      render={({ field, fieldState: { error } }) => (
        <InputSelect
          label="Git repository"
          options={providerOptions}
          onChange={(event) => {
            field.onChange(event)
            // Reset children fields
            setValue('repository', undefined)
            setValue('branch', undefined)
          }}
          value={field.value}
          error={error?.message}
          disabled={disabled}
        />
      )}
    />
  )
}

export default GitProviderSetting
