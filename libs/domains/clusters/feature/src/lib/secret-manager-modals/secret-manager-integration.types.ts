export type SecretManagerOption = {
  value: 'AWS_SECRET_MANAGER' | 'AWS_PARAMETER_STORE' | 'GCP_SECRET_MANAGER'
  label: string
  icon: 'AWS' | 'GCP'
  typeLabel: string
}
