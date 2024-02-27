import { type GitAuthProvider, type GitTokenResponse } from 'qovery-typescript-axios'
import { Controller, type ControllerRenderProps, type FieldValues, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { Icon, InputSelect, useModal } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { GitTokenCreateEditModal } from '../git-token-create-edit-modal/git-token-create-edit-modal'
import { useAuthProviders } from '../hooks/use-auth-providers/use-auth-providers'
import { useGitTokens } from '../hooks/use-git-tokens/use-git-tokens'

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

export function GitProviderSetting({ disabled }: GitProviderSettingProps) {
  const { control, watch, setValue } = useFormContext()
  const { organizationId = '' } = useParams()
  const { openModal, closeModal } = useModal()

  const { data: authProviders = [] } = useAuthProviders({ organizationId, enabled: !disabled })
  const { data: gitTokens = [] } = useGitTokens({ organizationId, enabled: !disabled })
  const watchFieldProvider = watch('provider')
  const watchFieldGitTokenName = watch('git_token_name')

  const providerOptions = disabled
    ? [
        {
          label: watchFieldProvider
            ? `${watchFieldProvider}${watchFieldGitTokenName ? ` (${watchFieldGitTokenName})` : ''}`
            : '',
          value: watchFieldProvider ?? '',
          icon: <Icon name={`${watchFieldProvider?.split(' ')[0].toUpperCase()}`} />,
        },
      ]
    : mergeProviders(authProviders, gitTokens)

  const onChange = (field: ControllerRenderProps<FieldValues, 'provider'>, event: string | string[]) => {
    field.onChange(event)
    // Reset children fields
    setValue('repository', undefined)
    setValue('branch', undefined)
  }

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
          onChange={(event) => onChange(field, event)}
          menuListButton={{
            title: 'Select repository',
            label: 'New git access',
            onClick: () => {
              openModal({
                content: (
                  <GitTokenCreateEditModal
                    organizationId={organizationId}
                    onClose={closeModal}
                    onChange={(event) => onChange(field, event)}
                  />
                ),
              })
            },
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

export default GitProviderSetting
