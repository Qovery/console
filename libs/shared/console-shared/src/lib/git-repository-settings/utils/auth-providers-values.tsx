import { type GitAuthProvider, type GitTokenResponse } from 'qovery-typescript-axios'
import { Icon } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export const authProvidersValues = (authProviders: GitAuthProvider[], gitTokens?: GitTokenResponse[]) => {
  const currentAuthProviders = authProviders.map((provider: GitAuthProvider) => ({
    label: `${upperCaseFirstLetter(provider.name)} (${provider.owner})`,
    value: provider.name || '',
    icon: <Icon width={16} height={16} name={provider.name} />,
  }))

  const currentGitTokens =
    gitTokens?.map((token: GitTokenResponse) => ({
      label: upperCaseFirstLetter(token.name),
      value: `token-${token.type}-${token.id}`,
      icon: <Icon width={16} height={16} name={token.type} />,
    })) || []

  return [...currentAuthProviders, ...currentGitTokens]
}

export const getGitTokenValue = (value: string) => {
  if (value?.includes('token')) return { type: value.split('-')[1], id: value.split('-')[2] }
  return null
}
