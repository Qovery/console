import posthog from 'posthog-js'
import { type Cluster, type ClusterRegion, type SecretManagerAccess } from 'qovery-typescript-axios'
import { type ReactNode, useCallback, useMemo, useState } from 'react'
import { FormProvider, type UseFormReturn, useForm } from 'react-hook-form'
import { useCloudProviders } from '@qovery/domains/cloud-providers/feature'
import { isGcpCluster } from '@qovery/domains/clusters/data-access'
import { type Value } from '@qovery/shared/interfaces'
import { Button, Heading, Icon, IconFlag, Navbar, Section, Tooltip } from '@qovery/shared/ui'
import {
  type IntegrationTab,
  getActiveProviderConstraints,
  getSecretManagerIntegrationConstraints,
} from './secret-manager-integration-constraints'
import { AwsSecretManagerManualSections } from './secret-manager-integration-modal/aws-secret-manager-manual-sections'
import { GcpSecretManagerManualSections } from './secret-manager-integration-modal/gcp-secret-manager-manual-sections'
import { SecretManagerAutomaticSections } from './secret-manager-integration-modal/secret-manager-automatic-sections'
import { type SecretManagerOption } from './secret-manager-integration.types'

export type { SecretManagerOption } from './secret-manager-integration.types'

export interface SecretManagerIntegrationModalProps {
  option: SecretManagerOption
  cluster?: Cluster
  mode?: 'create' | 'edit'
  initialValues?: SecretManagerAccess
  onClose: () => void
  onSubmit: (payload: SecretManagerAccess) => void | Promise<void>
}

export function SecretManagerIntegrationModal({
  option,
  cluster,
  mode = 'create',
  initialValues,
  onClose,
  onSubmit,
}: SecretManagerIntegrationModalProps) {
  const constraints = useMemo(
    () => getSecretManagerIntegrationConstraints({ option, cluster, mode, initialValues }),
    [option, cluster, mode, initialValues]
  )
  const { navigation, layout, aws, defaultAuthenticationMode } = constraints
  const { isManualOnlyGcpIntegration, isManualOnlyAwsIntegration } = layout
  const providerTabs = getActiveProviderConstraints(constraints)
  const automaticTab = providerTabs?.automatic

  const [activeTab, setActiveTab] = useState<IntegrationTab>(() => navigation.defaultTab)
  const methods = useForm<SecretManagerAccess>({
    mode: 'onChange',
    defaultValues: {
      ...initialValues,
      endpoint: {
        ...initialValues?.endpoint,
        mode: initialValues?.endpoint.mode ?? option.value,
      },
      authentication: {
        ...initialValues?.authentication,
        mode: initialValues?.authentication?.mode ?? defaultAuthenticationMode,
      },
    },
  })

  const setActiveTabWithDefaultAuthentication = useCallback(
    (tab: IntegrationTab) => {
      setActiveTab(tab)

      if (tab === 'manual' && !methods.getValues('authentication.mode') && defaultAuthenticationMode) {
        methods.setValue('authentication.mode', defaultAuthenticationMode, { shouldDirty: false })
      }
    },
    [defaultAuthenticationMode, methods]
  )

  const { awsRegions, gcpRegions } = useSecretManagerRegions()
  const regions = option.value === 'GCP_SECRET_MANAGER' ? gcpRegions : awsRegions
  const isGcpManualTabOnGcpSecretManager =
    option.value === 'GCP_SECRET_MANAGER' && isGcpCluster(cluster) && activeTab === 'manual'

  const getSubmitPayload = (data: SecretManagerAccess): SecretManagerAccess => {
    const isAutomaticIntegration =
      !isManualOnlyGcpIntegration && !isManualOnlyAwsIntegration && activeTab === 'automatic'
    const isGcpManualIntegration = isManualOnlyGcpIntegration || isGcpManualTabOnGcpSecretManager

    if (isAutomaticIntegration) {
      return {
        ...data,
        authentication: { mode: 'AUTOMATICALLY_CONFIGURED' },
      }
    }

    if (isGcpManualIntegration) {
      return {
        ...data,
        authentication: {
          mode: 'GCP_JSON_CREDENTIALS',
          json_credentials:
            data.authentication.mode === 'GCP_JSON_CREDENTIALS' ? data.authentication.json_credentials : undefined,
        },
      }
    }

    return data
  }

  const handleSubmit = methods.handleSubmit(async (data) => {
    const integration_mode = isManualOnlyGcpIntegration || isManualOnlyAwsIntegration ? 'manual' : activeTab
    try {
      await onSubmit(getSubmitPayload(data))
      posthog.capture('cluster-secret-manager-form-submitted', {
        is_edit: mode === 'edit',
        secret_manager_type: option.value,
        integration_mode,
        success: true,
      })
      onClose()
    } catch (error) {
      posthog.capture('cluster-secret-manager-form-submitted', {
        is_edit: mode === 'edit',
        secret_manager_type: option.value,
        integration_mode,
        success: false,
      })
      throw error
    }
  })

  const manualSections = isGcpManualTabOnGcpSecretManager ? (
    <div className="flex flex-col gap-3">
      <GcpSecretManagerManualSections methods={methods} regions={gcpRegions} />
    </div>
  ) : (
    <AwsSecretManagerManualSections
      authenticationTypeSelect={aws?.manual.authenticationTypeSelect}
      cluster={cluster}
      isManualOnlyIntegration={isManualOnlyAwsIntegration}
      methods={methods}
      option={option}
      regions={awsRegions}
    />
  )

  if (isManualOnlyGcpIntegration || isManualOnlyAwsIntegration) {
    return (
      <SecretManagerIntegrationForm
        mode={mode}
        methods={methods}
        onClose={onClose}
        onSubmit={handleSubmit}
        option={option}
        showHeader
      >
        <div className={`flex flex-col ${isManualOnlyGcpIntegration ? 'gap-3' : 'gap-4'} px-5 pb-6 pt-4`}>
          {isManualOnlyGcpIntegration ? (
            <GcpSecretManagerManualSections methods={methods} regions={gcpRegions} />
          ) : (
            manualSections
          )}
        </div>
      </SecretManagerIntegrationForm>
    )
  }

  return (
    <SecretManagerIntegrationForm
      mode={mode}
      methods={methods}
      onClose={onClose}
      onSubmit={handleSubmit}
      option={option}
    >
      <div className="rounded-t-md bg-surface-neutral-subtle px-5 pt-5">
        <ModalHeader option={option} />
        <div className="-mx-5 mt-4 border-b border-neutral px-5">
          <Navbar.Root activeId={activeTab}>
            {navigation.showAutomaticTabFirst ? (
              <>
                <Navbar.Item id="automatic" onClick={() => setActiveTab('automatic')}>
                  <Icon iconName="link" iconStyle="regular" />
                  Automatic integration
                </Navbar.Item>
                <Navbar.Item id="manual" onClick={() => setActiveTabWithDefaultAuthentication('manual')}>
                  <Icon iconName="hammer" iconStyle="regular" />
                  Manual integration
                </Navbar.Item>
              </>
            ) : (
              <>
                <Navbar.Item id="manual" onClick={() => setActiveTabWithDefaultAuthentication('manual')}>
                  <Icon iconName="hammer" iconStyle="regular" />
                  Manual integration
                </Navbar.Item>
                <Tooltip content={automaticTab?.disabledTooltip}>
                  <Navbar.Item
                    id="automatic"
                    aria-disabled
                    tabIndex={-1}
                    className="cursor-not-allowed text-neutral-disabled hover:text-neutral-disabled"
                    onClick={(event) => event.preventDefault()}
                  >
                    <Icon iconName="link" iconStyle="regular" />
                    Automatic integration
                  </Navbar.Item>
                </Tooltip>
              </>
            )}
          </Navbar.Root>
        </div>
      </div>
      <div className="p-5">
        {activeTab === 'automatic' ? (
          <SecretManagerAutomaticSections methods={methods} option={option} regions={regions} />
        ) : (
          manualSections
        )}
      </div>
    </SecretManagerIntegrationForm>
  )
}

function useSecretManagerRegions() {
  const { data: cloudProviders = [] } = useCloudProviders()

  return useMemo(() => {
    const toRegionOptions = (providerShortName: string): Value[] => {
      const provider = cloudProviders.find((provider) => provider.short_name === providerShortName)

      return (
        provider?.regions?.map((region: ClusterRegion) => ({
          label: `${region.city} (${region.name})`,
          value: region.name,
          icon: <IconFlag code={region.country_code} />,
        })) ?? []
      )
    }

    return {
      awsRegions: toRegionOptions('AWS'),
      gcpRegions: toRegionOptions('GCP'),
    }
  }, [cloudProviders])
}

interface SecretManagerIntegrationFormProps {
  children: ReactNode
  mode: 'create' | 'edit'
  methods: UseFormReturn<SecretManagerAccess>
  onClose: () => void
  onSubmit: () => void
  option: SecretManagerOption
  showHeader?: boolean
}

function SecretManagerIntegrationForm({
  children,
  mode,
  methods,
  onClose,
  onSubmit,
  option,
  showHeader = false,
}: SecretManagerIntegrationFormProps) {
  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col">
        {showHeader && (
          <Section className="px-5 pt-5">
            <ModalHeader option={option} />
          </Section>
        )}
        {children}
        <div className="flex justify-end gap-3 border-t border-neutral px-5 py-4">
          <Button type="button" variant="plain" color="neutral" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="lg" loading={methods.formState.isSubmitting}>
            {mode === 'edit' ? 'Save changes' : 'Add secret manager'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

function ModalHeader({ option }: { option: SecretManagerOption }) {
  return (
    <>
      <Heading level={1} className="text-lg font-medium text-neutral">{`${option.label} integration`}</Heading>
      <p className="mt-1 text-sm text-neutral-subtle">
        {`Link your ${option.icon === 'GCP' ? 'GCP' : 'AWS'} secret manager to use external secrets on all services running on your cluster`}
      </p>
    </>
  )
}
