import { type Cluster, type SecretManagerAccess } from 'qovery-typescript-axios'
import {
  excludeSecretManagerAccess,
  hasAwsAutomaticIntegrationConfigured,
  hasAwsManualStsIntegrationConfigured,
  hasGcpAutomaticIntegrationConfigured,
  isAwsCluster,
  isGcpCluster,
} from '@qovery/shared/util-clusters'
import { type SecretManagerOption } from './secret-manager-integration.types'

export type IntegrationTab = 'automatic' | 'manual'
export type SecretManagerProvider = 'aws' | 'gcp'

type IntegrationMode = 'create' | 'edit'

export type IntegrationTabConstraints = {
  disabled: boolean
  disabledTooltip?: string
}

/**
 * AWS
 * - Automatic and Assume role are mutually exclusive (max one of each).
 * - Static credentials are unlimited and can coexist with either.
 *
 * GCP
 * - Automatic integration is limited to one.
 * - JSON credentials (manual) are unlimited and can coexist with automatic.
 */
type ExistingIntegrations = {
  awsAutomatic: boolean
  awsAssumeRole: boolean
  gcpAutomatic: boolean
}

const TOOLTIP = {
  automaticUnavailableBecauseAutomatic:
    'Automatic integration is unavailable because an automatic integration is already configured.',
  automaticUnavailableBecauseAssumeRole:
    'Automatic integration is unavailable because an assume role integration is already configured.',
  staticCredentialsOnlyBecauseAutomatic:
    'Static credentials are the only available option while an automatic integration is configured.',
  staticCredentialsOnlyBecauseAssumeRole:
    'Static credentials are the only available option while an assume role integration is configured.',
} as const

export type AwsManualAuthenticationTypeSelect = IntegrationTabConstraints & {
  options: { label: string; value: SecretManagerAccess['authentication']['mode'] }[]
  defaultValue?: SecretManagerAccess['authentication']['mode']
}

export type AwsIntegrationConstraints = {
  automatic: IntegrationTabConstraints
  manual: IntegrationTabConstraints & {
    authenticationTypeSelect: AwsManualAuthenticationTypeSelect
  }
}

export type GcpIntegrationConstraints = {
  automatic: IntegrationTabConstraints
  manual: IntegrationTabConstraints
}

export type SecretManagerIntegrationConstraints = {
  activeProvider: SecretManagerProvider | null
  aws: AwsIntegrationConstraints | null
  gcp: GcpIntegrationConstraints | null
  defaultAuthenticationMode?: SecretManagerAccess['authentication']['mode']
  navigation: {
    defaultTab: IntegrationTab
    showAutomaticTabFirst: boolean
  }
  layout: {
    isManualOnlyGcpIntegration: boolean
    isManualOnlyAwsIntegration: boolean
  }
}

export const getActiveProviderConstraints = (constraints: SecretManagerIntegrationConstraints) =>
  constraints.activeProvider === 'aws' ? constraints.aws : constraints.gcp

const ENABLED_TAB: IntegrationTabConstraints = { disabled: false }

const getExistingIntegrations = (secretManagerAccesses: SecretManagerAccess[]): ExistingIntegrations => ({
  awsAutomatic: hasAwsAutomaticIntegrationConfigured(secretManagerAccesses),
  awsAssumeRole: hasAwsManualStsIntegrationConfigured(secretManagerAccesses),
  gcpAutomatic: hasGcpAutomaticIntegrationConfigured(secretManagerAccesses),
})

const getAwsAutomaticTab = (
  existing: ExistingIntegrations,
  isEditingAutomatic: boolean,
  manualAuthenticationTypeSelect: AwsIntegrationConstraints['manual']['authenticationTypeSelect']
): IntegrationTabConstraints => {
  if (isEditingAutomatic) {
    return ENABLED_TAB
  }

  if (manualAuthenticationTypeSelect.disabled && manualAuthenticationTypeSelect.disabledTooltip) {
    return {
      disabled: true,
      disabledTooltip: manualAuthenticationTypeSelect.disabledTooltip,
    }
  }

  if (existing.awsAssumeRole) {
    return {
      disabled: true,
      disabledTooltip: TOOLTIP.automaticUnavailableBecauseAssumeRole,
    }
  }

  if (existing.awsAutomatic) {
    return {
      disabled: true,
      disabledTooltip: TOOLTIP.automaticUnavailableBecauseAutomatic,
    }
  }

  return ENABLED_TAB
}

const getDefaultAwsAuthenticationMode = (
  options: AwsManualAuthenticationTypeSelect['options']
): SecretManagerAccess['authentication']['mode'] | undefined =>
  options.length === 1 ? options[0].value : undefined

const getAwsManualAuthenticationTypeSelect = (
  existing: ExistingIntegrations,
  isEditingAssumeRole: boolean,
  editingAuthenticationMode: SecretManagerAccess['authentication']['mode'] | undefined
): AwsIntegrationConstraints['manual']['authenticationTypeSelect'] => {
  const isExclusiveAuthAlreadyUsed = existing.awsAutomatic || existing.awsAssumeRole
  const canAddAssumeRole = !isExclusiveAuthAlreadyUsed
  const mustUseStaticCredentials = isExclusiveAuthAlreadyUsed && !isEditingAssumeRole

  const options: { label: string; value: SecretManagerAccess['authentication']['mode'] }[] = [
    { label: 'Static credentials', value: 'AWS_STATIC_CREDENTIALS' },
  ]

  if (canAddAssumeRole) {
    options.unshift({ label: 'Assume role via STS', value: 'AWS_ROLE_ARN' })
  }

  return {
    disabled: mustUseStaticCredentials,
    disabledTooltip: mustUseStaticCredentials
      ? existing.awsAssumeRole
        ? TOOLTIP.staticCredentialsOnlyBecauseAssumeRole
        : TOOLTIP.staticCredentialsOnlyBecauseAutomatic
      : undefined,
    options,
    defaultValue: editingAuthenticationMode ?? getDefaultAwsAuthenticationMode(options),
  }
}

const getGcpAutomaticTab = (
  existing: ExistingIntegrations,
  isEditingAutomatic: boolean
): IntegrationTabConstraints => {
  if (isEditingAutomatic || !existing.gcpAutomatic) {
    return ENABLED_TAB
  }

  return {
    disabled: true,
    disabledTooltip: TOOLTIP.automaticUnavailableBecauseAutomatic,
  }
}

const getDefaultTab = ({
  initialAuthenticationMode,
  automaticTab,
}: {
  initialAuthenticationMode: SecretManagerAccess['authentication']['mode'] | undefined
  automaticTab: IntegrationTabConstraints
}): IntegrationTab => {
  if (initialAuthenticationMode === 'AUTOMATICALLY_CONFIGURED') {
    return 'automatic'
  }

  if (initialAuthenticationMode === 'AWS_ROLE_ARN' || initialAuthenticationMode === 'GCP_JSON_CREDENTIALS') {
    return 'manual'
  }

  return automaticTab.disabled ? 'manual' : 'automatic'
}

const buildAwsConstraints = (
  existing: ExistingIntegrations,
  isEditingAutomatic: boolean,
  isEditingAssumeRole: boolean,
  editingAuthenticationMode: SecretManagerAccess['authentication']['mode'] | undefined
): AwsIntegrationConstraints => {
  const manual = {
    ...ENABLED_TAB,
    authenticationTypeSelect: getAwsManualAuthenticationTypeSelect(
      existing,
      isEditingAssumeRole,
      editingAuthenticationMode
    ),
  }

  return {
    automatic: getAwsAutomaticTab(existing, isEditingAutomatic, manual.authenticationTypeSelect),
    manual,
  }
}

const buildGcpConstraints = (existing: ExistingIntegrations, isEditingAutomatic: boolean): GcpIntegrationConstraints => ({
  automatic: getGcpAutomaticTab(existing, isEditingAutomatic),
  manual: ENABLED_TAB,
})

export function getSecretManagerIntegrationConstraints({
  option,
  cluster,
  mode = 'create',
  initialValues,
}: {
  option: SecretManagerOption
  cluster?: Cluster
  mode?: IntegrationMode
  initialValues?: SecretManagerAccess
}): SecretManagerIntegrationConstraints {
  const isAwsIntegration = option.icon === 'AWS'
  const isGcpSecretManagerOnGcpCluster = option.value === 'GCP_SECRET_MANAGER' && isGcpCluster(cluster)
  const isGcpSecretManagerOnAwsCluster = option.value === 'GCP_SECRET_MANAGER' && isAwsCluster(cluster)
  const isAwsSecretManagerOnGcpCluster = isAwsIntegration && isGcpCluster(cluster)

  const otherIntegrations = getExistingIntegrations(
    excludeSecretManagerAccess(cluster?.secret_manager_accesses ?? [], initialValues?.id)
  )

  const editingAuthenticationMode = initialValues?.authentication.mode
  const isEditingAutomatic = mode === 'edit' && editingAuthenticationMode === 'AUTOMATICALLY_CONFIGURED'
  const isEditingAssumeRole = mode === 'edit' && editingAuthenticationMode === 'AWS_ROLE_ARN'

  const aws =
    isAwsIntegration && !isAwsSecretManagerOnGcpCluster
      ? buildAwsConstraints(otherIntegrations, isEditingAutomatic, isEditingAssumeRole, editingAuthenticationMode)
      : null

  const gcp = isGcpSecretManagerOnGcpCluster ? buildGcpConstraints(otherIntegrations, isEditingAutomatic) : null

  const activeProvider: SecretManagerProvider | null = aws ? 'aws' : gcp ? 'gcp' : null
  const activeAutomaticTab = aws?.automatic ?? gcp?.automatic ?? ENABLED_TAB

  const defaultAuthenticationMode =
    editingAuthenticationMode ??
    aws?.manual.authenticationTypeSelect.defaultValue ??
    (isAwsSecretManagerOnGcpCluster ? 'AWS_STATIC_CREDENTIALS' : undefined)

  return {
    activeProvider,
    aws,
    gcp,
    defaultAuthenticationMode,
    navigation: {
      defaultTab: getDefaultTab({
        initialAuthenticationMode: editingAuthenticationMode,
        automaticTab: activeAutomaticTab,
      }),
      showAutomaticTabFirst: !activeAutomaticTab.disabled,
    },
    layout: {
      isManualOnlyGcpIntegration: isGcpSecretManagerOnAwsCluster,
      isManualOnlyAwsIntegration: isAwsSecretManagerOnGcpCluster,
    },
  }
}
