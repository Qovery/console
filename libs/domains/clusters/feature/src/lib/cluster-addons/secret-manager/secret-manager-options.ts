import { type SecretManagerOption } from '../../secret-manager-modals/secret-manager-integration-modal'

export const SECRET_MANAGER_OPTIONS: SecretManagerOption[] = [
  { value: 'AWS_SECRET_MANAGER', label: 'AWS Secret manager', icon: 'AWS', typeLabel: 'AWS Secret manager' },
  { value: 'AWS_PARAMETER_STORE', label: 'AWS Parameter store', icon: 'AWS', typeLabel: 'AWS Parameter store' },
  { value: 'GCP_SECRET_MANAGER', label: 'GCP Secret manager', icon: 'GCP', typeLabel: 'GCP Secret manager' },
]

export const getSecretManagerOption = (source: SecretManagerOption['value']) =>
  SECRET_MANAGER_OPTIONS.find((option) => option.value === source) ?? SECRET_MANAGER_OPTIONS[0]
