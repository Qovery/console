import { IconEnum } from '@qovery/shared/enums'

export interface ProviderDisplay {
  label: string
  icon: IconEnum
}

const PROVIDER_DISPLAY_BY_KEY: Record<string, ProviderDisplay> = {
  github: { label: 'GitHub', icon: IconEnum.GITHUB },
  Gitlab: { label: 'GitLab', icon: IconEnum.GITLAB },
  'google-oauth2': { label: 'Google', icon: IconEnum.GOOGLE },
  windowslive: { label: 'Microsoft', icon: IconEnum.MICROSOFT },
  bitbucket: { label: 'Bitbucket', icon: IconEnum.BITBUCKET },
}

export function getProviderKeyFromSub(sub?: string | null): string | undefined {
  return sub?.split('|')[0]
}

export function getProviderDisplay(providerKey?: string | null): ProviderDisplay | undefined {
  if (!providerKey) return undefined
  return PROVIDER_DISPLAY_BY_KEY[providerKey]
}
