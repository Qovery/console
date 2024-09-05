import { type GitAuthProvider, type GitTokenResponse } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
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
    label: (
      <>
        {upperCaseFirstLetter(token.type)} Token ({token.name})
        <Icon iconName="key" iconStyle="regular" className="ml-3 text-base" />
      </>
    ),
    value: token.id,
    icon: <Icon width={16} height={16} name={token.type} />,
  }))

  return [...currentAuthProviders, ...currentGitTokens]
}

export function GitProviderSetting({ disabled }: GitProviderSettingProps) {
  const { control, watch, setValue, clearErrors } = useFormContext()
  const { organizationId = '' } = useParams()
  const { openModal, closeModal } = useModal()

  const { data: authProviders = [] } = useAuthProviders({ organizationId, enabled: !disabled })
  const { data: gitTokens = [] } = useGitTokens({ organizationId, enabled: !disabled })
  const watchFieldIsPublicRepository = watch('is_public_repository')
  const watchFieldProvider = watch('provider')
  const watchFieldGitTokenName = watch('git_token_name')
  const watchFieldGitTokenId = watch('git_token_id')

  const providerOptions = disabled
    ? [
        watchFieldGitTokenId
          ? {
              label: `${watchFieldProvider ?? ''}${watchFieldGitTokenName ? ` (${watchFieldGitTokenName})` : ''}`,
              value: watchFieldGitTokenId ?? '',
              icon: <Icon name={`${watchFieldProvider?.split(' ')[0].toUpperCase()}`} />,
            }
          : {
              label: watchFieldProvider ?? '',
              value: watchFieldProvider ?? '',
              icon: <Icon name={`${watchFieldProvider?.split(' ')[0].toUpperCase()}`} />,
            },
      ]
    : [
        ...mergeProviders(authProviders, gitTokens),
        {
          label: 'Public repository (Github, Gitlab, Bitbucket)',
          value: 'PUBLIC',
          icon: <Icon iconName="folder-closed" iconStyle="regular" width={16} height={16} />,
        },
      ]

  const onChange = (value: string) => {
    /**
     * As we have merged providers (user personal account) and git tokens, we need transform it back as 2 separate fields
     */
    const token = gitTokens.find(({ id }) => id === value)
    if (token) {
      setValue('git_token_id', token.id)
      setValue('git_token_name', token.name)
      setValue('provider', token.type)
      setValue('is_public_repository', false)
    } else {
      const isPublicRepo = value === 'PUBLIC'
      setValue('git_token_id', null)
      setValue('git_token_name', null)
      setValue('provider', isPublicRepo ? null : value)
      setValue('is_public_repository', isPublicRepo)
    }
    // Reset children fields
    setValue('repository', '')
    setValue('branch', '')
    clearErrors('repository')
  }

  return (
    <Controller
      name="git_token_id"
      control={control}
      render={({ field: { value: gitTokenId } }) => (
        <Controller
          name="provider"
          control={control}
          rules={{
            required: 'Please select a provider.',
          }}
          render={({ field: { value: provider }, fieldState: { error } }) => (
            <InputSelect
              label="Git account"
              options={providerOptions}
              onChange={(value) => onChange(value as string)}
              menuListButton={{
                title: 'Select account',
                label: 'New git access',
                onClick: () => {
                  openModal({
                    content: (
                      <GitTokenCreateEditModal
                        organizationId={organizationId}
                        onClose={(response) => {
                          response && onChange(response.id)
                          closeModal()
                        }}
                      />
                    ),
                  })
                },
              }}
              value={gitTokenId ?? (watchFieldIsPublicRepository ? 'PUBLIC' : provider)}
              error={error?.message}
              disabled={disabled}
              isSearchable
            />
          )}
        />
      )}
    />
  )
}

export default GitProviderSetting
