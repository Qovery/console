import { GitAuthProvider } from 'qovery-typescript-axios'
import { Icon } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/utils'

export const authProvidersValues = (authProviders: GitAuthProvider[]) => {
  return authProviders.map((provider: GitAuthProvider) => ({
    label: `${upperCaseFirstLetter(provider.name)} (${provider.owner})`,
    value: provider.name || '',
    icon: <Icon width="16px" height="16px" name={provider.name} />,
  }))
}
