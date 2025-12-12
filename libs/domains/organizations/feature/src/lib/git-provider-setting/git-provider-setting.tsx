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

export interface TokenSelectionResult {
  git_token_id: string | null
  git_token_name: string | null
  provider: string | null
  is_public_repository: boolean
}

export function handleTokenSelection(
  value: string,
  gitTokens: GitTokenResponse[],
  newToken?: GitTokenResponse
): TokenSelectionResult {
  // Use newToken directly if provided AND matches the selected value (handles race condition)
  // Otherwise, look up the token in the existing list
  const token = newToken && newToken.id === value ? newToken : gitTokens.find(({ id }) => id === value)

  if (token) {
    return {
      git_token_id: token.id,
      git_token_name: token.name,
      provider: token.type,
      is_public_repository: false,
    }
  }

  // Not a token - either public repo or auth provider
  const isPublicRepo = value === 'PUBLIC'
  return {
    git_token_id: null,
    git_token_name: null,
    provider: isPublicRepo ? null : value,
    is_public_repository: isPublicRepo,
  }
}

export const mergeProviders = (authProviders: GitAuthProvider[] = [], gitTokens: GitTokenResponse[] = []) => {
  const currentAuthProviders = authProviders.map((provider) => ({
    label: `${upperCaseFirstLetter(provider.name)} (${provider.owner})`,
    value: provider.name || '',
    icon: <Icon width={16} height={16} name={provider.name} />,
    searchText: `${upperCaseFirstLetter(provider.name)} ${provider.owner}`,
  }))

  const currentGitTokens = gitTokens.map((token) => ({
    label: (
      <span>
        {upperCaseFirstLetter(token.type)} Token ({token.name})
        <Icon iconName="key" iconStyle="regular" className="ml-3 text-base" />
      </span>
    ),
    value: token.id,
    icon: <Icon width={16} height={16} name={token.type} />,
    // Add searchable text for filtering
    searchText: `${upperCaseFirstLetter(token.type)} Token ${token.name}`,
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
              label: `${upperCaseFirstLetter(watchFieldProvider ?? '')}${watchFieldGitTokenName ? ` (${watchFieldGitTokenName})` : ''}`,
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
          searchText: 'Public repository Github Gitlab Bitbucket',
        },
      ]

  const onChange = (value: string, newToken?: GitTokenResponse) => {
    /**
     * As we have merged providers (user personal account) and git tokens, we need transform it back as 2 separate fields.
     */
    const result = handleTokenSelection(value, gitTokens, newToken)
    setValue('git_token_id', result.git_token_id)
    setValue('git_token_name', result.git_token_name)
    setValue('provider', result.provider)
    setValue('is_public_repository', result.is_public_repository)

    // Reset children fields
    setValue('repository', '')
    setValue('branch', '')
    clearErrors('repository')
  }

  // Custom filter function to search through searchText when available, otherwise use label
  const customFilterOption = (option: any, inputValue: string) => {
    if (!inputValue) return true

    const searchString = option.data.searchText || (typeof option.data.label === 'string' ? option.data.label : '')
    return searchString.toLowerCase().includes(inputValue.toLowerCase())
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
                          response && onChange(response.id, response)
                          closeModal()
                        }}
                      />
                    ),
                    options: {
                      fakeModal: true,
                    },
                  })
                },
              }}
              value={gitTokenId ?? (watchFieldIsPublicRepository ? 'PUBLIC' : provider)}
              error={error?.message}
              disabled={disabled}
              isSearchable
              filterOption={customFilterOption}
            />
          )}
        />
      )}
    />
  )
}

export default GitProviderSetting
