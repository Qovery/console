import { createFileRoute, useParams } from '@tanstack/react-router'
import { type CloudProvider, type ClusterRegion } from 'qovery-typescript-axios'
import { type FormEventHandler, useEffect, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { useCloudProviders } from '@qovery/domains/cloud-providers/feature'
import { useCluster, useEditCluster } from '@qovery/domains/clusters/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { useUserRole } from '@qovery/shared/iam/feature'
import {
  Badge,
  Button,
  Callout,
  CopyButton,
  DropdownMenu,
  Dropzone,
  ExternalLink,
  Icon,
  IconFlag,
  InputSelect,
  InputText,
  Navbar,
  Section,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { type UseCaseOption, useUseCasePage } from '../../../../../../../app/components/use-cases/use-case-context'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/settings/addons')(
  {
    component: RouteComponent,
  }
)

type SecretManagerOption = {
  value: 'aws-manager' | 'aws-parameter' | 'gcp-secret'
  label: string
  icon: 'AWS' | 'GCP'
  typeLabel: string
}

type IntegrationTab = 'automatic' | 'manual'

type SecretManagerIntegrationFormValues = {
  authenticationType: string
  region: string
  roleArn: string
  accessKey: string
  secretAccessKey: string
  secretManagerName: string
}

type SecretManagerItem = {
  id: string
  name: string
  typeLabel: string
  authentication: 'Automatic' | 'Manual'
  provider: 'AWS' | 'GCP'
  source: SecretManagerOption['value']
  authType?: 'sts' | 'static'
  region?: string
  roleArn?: string
  accessKey?: string
  secretAccessKey?: string
  usedByServices?: number
}

const SECRET_MANAGER_USE_CASES: UseCaseOption[] = [
  { id: 'delete-no-secrets', label: 'Delete (no secrets)' },
  { id: 'delete-used-no-other', label: 'Delete used (no other)' },
  { id: 'delete-used-one-other', label: 'Delete used (one other)' },
  { id: 'delete-used-multiple-other', label: 'Delete used (multiple other)' },
]

const SECRET_MANAGER_OPTIONS: SecretManagerOption[] = [
  { value: 'aws-manager', label: 'AWS Manager type', icon: 'AWS' },
  { value: 'aws-parameter', label: 'AWS Parameter store', icon: 'AWS' },
  { value: 'gcp-secret', label: 'GCP Secret manager', icon: 'GCP' },
].map((option) => ({ ...option, typeLabel: option.label }))

const BASE_SECRET_MANAGERS: SecretManagerItem[] = [
  {
    id: 'secret-manager-prod',
    name: 'Prod secret manager',
    typeLabel: 'AWS Manager type',
    authentication: 'Automatic',
    provider: 'AWS' as const,
    source: 'aws-manager',
    usedByServices: 32,
  },
  {
    id: 'secret-manager-gcp-staging',
    name: 'GCP staging secret manager',
    typeLabel: 'GCP secret manager',
    authentication: 'Manual',
    provider: 'GCP' as const,
    source: 'gcp-secret',
    authType: 'static',
    usedByServices: 0,
  },
  {
    id: 'secret-manager-parameter',
    name: 'AWS Parameter store',
    typeLabel: 'AWS Parameter store',
    authentication: 'Manual',
    provider: 'AWS' as const,
    source: 'aws-parameter',
    authType: 'sts',
    usedByServices: 0,
  },
]

type DeletionAction = 'migrate' | 'detach' | 'convert'

function SecretManagerDeletionHelperModal({
  integration,
  otherManagers,
  onClose,
  onConfirm,
}: {
  integration: SecretManagerItem
  otherManagers: SecretManagerItem[]
  onClose: () => void
  onConfirm: (action: DeletionAction, targetId?: string) => void
}) {
  const [selectedAction, setSelectedAction] = useState<DeletionAction | null>(null)
  const [targetId, setTargetId] = useState('')

  const hasOtherManagers = otherManagers.length > 0
  const hasMultipleManagers = otherManagers.length > 1
  const hasSingleManager = otherManagers.length === 1

  const handleSelect = (action: DeletionAction) => {
    setSelectedAction(action)
    if (action === 'migrate' && hasSingleManager) {
      setTargetId(otherManagers[0]?.id ?? '')
    }
    if (action !== 'migrate') {
      setTargetId('')
    }
  }

  const canFinalize =
    Boolean(selectedAction) && (!hasMultipleManagers || selectedAction !== 'migrate' || Boolean(targetId))

  const cardBase =
    'flex w-full items-center gap-3 rounded-lg bg-background p-3 text-left outline outline-1 focus:outline focus:outline-1 shadow-[0_0_4px_0_rgba(0,0,0,0.01),0_2px_3px_0_rgba(0,0,0,0.02)]'
  const iconBase = 'flex h-10 w-10 items-center justify-center rounded-md'

  return (
    <div className="relative flex flex-col">
      <div className="px-5 pt-5">
        <h2 className="text-lg font-medium text-neutral">Deletion helper</h2>
        <p className="mt-1 text-sm text-neutral-subtle">
          "{integration.name}" is currently used by {integration.usedByServices ?? 0} services. Choose what you want to
          do with the linked external secrets before before deleting it.
        </p>
      </div>
      <div className="flex flex-col gap-2 px-5 py-5">
        {hasOtherManagers && hasMultipleManagers ? (
          <div className="flex flex-col gap-0 rounded-lg border border-neutral bg-surface-neutral-subtle">
            <button
              type="button"
              onClick={() => handleSelect('migrate')}
              className={`${cardBase} ${
                selectedAction === 'migrate'
                  ? 'outline-brand-strong focus:outline-brand-strong'
                  : 'outline-neutral focus:outline-neutral'
              }`}
            >
              <div
                className={`${iconBase} ${
                  selectedAction === 'migrate'
                    ? 'bg-surface-brand-component text-brand'
                    : 'bg-surface-neutral-component'
                }`}
              >
                <Icon iconName="right-left" className={selectedAction === 'migrate' ? 'text-brand' : undefined} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-neutral">Migrate to another secret manager</span>
                <span className="text-xs text-neutral-subtle">
                  Migration to one of your other secret manager detected
                </span>
              </div>
            </button>
            {selectedAction === 'migrate' && (
              <div className="p-3">
                <InputSelect
                  label="Target secret manager"
                  placeholder="Select a secret manager"
                  value={targetId}
                  onChange={(value) => setTargetId(value as string)}
                  options={otherManagers.map((manager) => ({ label: manager.name, value: manager.id }))}
                  portal
                />
              </div>
            )}
          </div>
        ) : (
          hasOtherManagers && (
            <button
              type="button"
              onClick={() => handleSelect('migrate')}
              className={`${cardBase} ${
                selectedAction === 'migrate'
                  ? 'outline-brand-strong focus:outline-brand-strong'
                  : 'outline-neutral focus:outline-neutral'
              }`}
            >
              <div
                className={`${iconBase} ${
                  selectedAction === 'migrate'
                    ? 'bg-surface-brand-component text-brand'
                    : 'bg-surface-neutral-component'
                }`}
              >
                <Icon iconName="right-left" className={selectedAction === 'migrate' ? 'text-brand' : undefined} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-neutral">Migrate to detected secret manager</span>
                <span className="text-xs text-neutral-subtle">References will point to "{otherManagers[0]?.name}"</span>
              </div>
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => handleSelect('detach')}
          className={`${cardBase} ${
            selectedAction === 'detach'
              ? 'outline-brand-strong focus:outline-brand-strong'
              : 'outline-neutral focus:outline-neutral'
          }`}
        >
          <div
            className={`${iconBase} ${
              selectedAction === 'detach' ? 'bg-surface-brand-component text-brand' : 'bg-surface-neutral-component'
            }`}
          >
            <Icon iconName="link" className={selectedAction === 'detach' ? 'text-brand' : undefined} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-neutral">Detach all references</span>
            <span className="text-xs text-neutral-subtle">Empty external secrets to be remapped later</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelect('convert')}
          className={`${cardBase} ${
            selectedAction === 'convert'
              ? 'outline-brand-strong focus:outline-brand-strong'
              : 'outline-neutral focus:outline-neutral'
          }`}
        >
          <div
            className={`${iconBase} ${
              selectedAction === 'convert' ? 'bg-surface-brand-component text-brand' : 'bg-surface-neutral-component'
            }`}
          >
            <Icon iconName="lock-keyhole" className={selectedAction === 'convert' ? 'text-brand' : undefined} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-neutral">Convert to empty Qovery secrets</span>
            <span className="text-xs text-neutral-subtle">Conversion to empty qovery secrets for manual migration</span>
          </div>
        </button>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-neutral px-5 py-4">
        <Button type="button" variant="plain" color="neutral" size="lg" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          size="lg"
          disabled={!canFinalize}
          onClick={() => selectedAction && onConfirm(selectedAction, targetId)}
        >
          Finalize deletion
        </Button>
      </div>
    </div>
  )
}

function SecretManagerIntegrationModal({
  option,
  regionOptions,
  clusterProvider,
  mode = 'create',
  initialValues,
  onClose,
  onSubmit,
}: {
  option: SecretManagerOption
  regionOptions: Array<{ label: string; value: string; icon?: JSX.Element }>
  clusterProvider?: string
  mode?: 'create' | 'edit'
  initialValues?: SecretManagerItem
  onClose: () => void
  onSubmit: (payload: SecretManagerItem) => void
}) {
  const [activeTab, setActiveTab] = useState<IntegrationTab>(
    initialValues?.authentication === 'Manual' ? 'manual' : 'automatic'
  )
  const methods = useForm<SecretManagerIntegrationFormValues>({
    mode: 'onChange',
    defaultValues: {
      authenticationType: initialValues?.authType ?? '',
      region: initialValues?.region ?? '',
      roleArn: initialValues?.roleArn ?? '',
      accessKey: initialValues?.accessKey ?? '',
      secretAccessKey: initialValues?.secretAccessKey ?? '',
      secretManagerName: initialValues?.name ?? '',
    },
  })

  const authenticationOptions = useMemo(
    () => [
      { label: 'Assume role via STS', value: 'sts' },
      { label: 'Static credentials', value: 'static' },
    ],
    []
  )

  const authenticationType = methods.watch('authenticationType')
  const isStaticCredentials = authenticationType === 'static'
  const isAwsCluster = clusterProvider === 'AWS'
  const isGcpSecretManagerOnAws = option.value === 'gcp-secret' && isAwsCluster
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: { 'application/json': ['.json'] },
  })

  useEffect(() => {
    if (activeTab === 'manual' && !authenticationType) {
      methods.setValue('authenticationType', 'sts', { shouldDirty: false })
    }
  }, [activeTab, authenticationType, methods])

  const handleSubmit = methods.handleSubmit((data) => {
    onSubmit({
      id: initialValues?.id ?? `secret-manager-${Date.now()}`,
      name: data.secretManagerName.trim() || 'Secret manager',
      typeLabel: option.typeLabel,
      authentication: activeTab === 'manual' ? 'Manual' : 'Automatic',
      provider: option.icon,
      source: option.value,
      authType:
        activeTab === 'manual' && data.authenticationType ? (data.authenticationType as 'sts' | 'static') : undefined,
      region: data.region || undefined,
      roleArn: data.roleArn || undefined,
      accessKey: data.accessKey || undefined,
      secretAccessKey: data.secretAccessKey || undefined,
    })
    onClose()
  })

  const handleGcpAwsSubmit = methods.handleSubmit((data) => {
    onSubmit({
      id: initialValues?.id ?? `secret-manager-${Date.now()}`,
      name: data.secretManagerName.trim() || 'Secret manager',
      typeLabel: option.typeLabel,
      authentication: 'Manual',
      provider: option.icon,
      source: option.value,
      authType: 'static',
    })
    onClose()
  })

  useEffect(() => {
    methods.trigger().then()
  }, [methods.trigger])

  if (isGcpSecretManagerOnAws) {
    return (
      <FormProvider {...methods}>
        <form onSubmit={handleGcpAwsSubmit} className="flex flex-col">
          <div className="px-5 pt-5">
            <h2 className="text-lg font-medium text-neutral">{`${option.label} integration`}</h2>
            <p className="mt-1 text-sm text-neutral-subtle">
              Link your AWS secret manager to use external secrets on all service running on your cluster
            </p>
          </div>
          <div className="flex flex-col gap-3 px-5 pb-6 pt-4">
            <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
              <h3 className="text-sm font-medium text-neutral">
                1. Connect to your GCP Console and create/open a project
              </h3>
              <p className="text-sm text-neutral-subtle">Make sure you are connected to the right GCP account</p>
              <ExternalLink href="https://console.cloud.google.com/" size="sm">
                https://console.cloud.google.com/
              </ExternalLink>
            </div>
            <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
              <h3 className="text-sm font-medium text-neutral">
                2. Open the embedded Google shell and run the following command
              </h3>
              <div className="flex gap-6 rounded border border-neutral bg-surface-neutral-subtle p-3 text-neutral retina:border-[0.5px]">
                <div>
                  <span className="select-none">$ </span>
                  curl https://setup.qovery.com/create_credentials_gcp.sh | \ bash -s -- $GOOGLE_CLOUD_PROJECT
                  qovery_role qovery-service-account{' '}
                </div>
                <CopyButton
                  content=" curl https://setup.qovery.com/create_credentials_gcp.sh | \
bash -s -- $GOOGLE_CLOUD_PROJECT qovery_role qovery-service-account"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral p-4">
              <h3 className="text-sm font-medium text-neutral">
                3. Download the key.json generated and drag and drop it here
              </h3>
              <div {...getRootProps()}>
                <input className="hidden" {...getInputProps()} />
                <Dropzone typeFile=".json" isDragActive={isDragActive} />
              </div>
              <Controller
                name="secretManagerName"
                control={methods.control}
                render={({ field }) => (
                  <InputText
                    name={field.name}
                    label="Secret manager name"
                    value={field.value}
                    onChange={field.onChange}
                    hint="Display name in Qovery"
                  />
                )}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-neutral px-5 py-4">
            <Button type="button" variant="plain" color="neutral" size="lg" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="lg">
              {mode === 'edit' ? 'Save changes' : 'Add secret manager'}
            </Button>
          </div>
        </form>
      </FormProvider>
    )
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="bg-surface-neutral-subtle px-5 pt-5">
          <h2 className="text-lg font-medium text-neutral">{`${option.label} integration`}</h2>
          <p className="mt-1 text-sm text-neutral-subtle">
            {`Link your ${option.icon === 'GCP' ? 'GCP' : 'AWS'} secret manager to use external secrets on all service running on your cluster`}
          </p>
          <div className="-mx-5 mt-4 border-b border-neutral px-5">
            <Navbar.Root activeId={activeTab}>
              <Navbar.Item id="automatic" onClick={() => setActiveTab('automatic')}>
                <Icon iconName="link" iconStyle="regular" />
                Automatic integration
              </Navbar.Item>
              <Navbar.Item id="manual" onClick={() => setActiveTab('manual')}>
                <Icon iconName="hammer" iconStyle="regular" />
                Manual integration
              </Navbar.Item>
            </Navbar.Root>
          </div>
        </div>
        <div className="p-5">
          {activeTab === 'automatic' && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-neutral">Automatic integration</p>
                <p className="text-sm text-neutral-subtle">
                  Qovery will use the cluster’s credentials to configure access to your Secrets Manager automatically
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Controller
                  name="region"
                  control={methods.control}
                  render={({ field }) => (
                    <InputSelect
                      label="Region"
                      value={field.value}
                      placeholder="Select a region"
                      onChange={(value) => field.onChange(value as string)}
                      options={regionOptions}
                      isSearchable
                      portal
                    />
                  )}
                />
                <Controller
                  name="secretManagerName"
                  control={methods.control}
                  render={({ field }) => (
                    <InputText
                      name={field.name}
                      label="Secret manager name"
                      value={field.value}
                      onChange={field.onChange}
                      hint="Display name in Qovery"
                    />
                  )}
                />
              </div>
              {option.icon === 'AWS' && (
                <Callout.Root color="sky">
                  <Callout.Icon>
                    <Icon iconName="circle-info" iconStyle="regular" />
                  </Callout.Icon>
                  <Callout.Text>
                    Automatic integration requires the secret manager to be in the same AWS account as the cluster
                  </Callout.Text>
                </Callout.Root>
              )}
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="flex flex-col gap-4">
              <Controller
                name="authenticationType"
                control={methods.control}
                render={({ field }) => (
                  <InputSelect
                    label="Authentication type"
                    value={field.value}
                    placeholder="Select an authentication type"
                    onChange={(value) => field.onChange(value as string)}
                    options={authenticationOptions}
                    portal
                  />
                )}
              />

              {!authenticationType && (
                <p className="text-sm text-neutral-subtle">
                  Select an authentication type to see the required information.
                </p>
              )}
              {authenticationType && isStaticCredentials ? (
                <>
                  <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
                    <h3 className="text-sm font-medium text-neutral">1. Create a user for Qovery</h3>
                    <p className="text-sm text-neutral-subtle">Follow the instructions available on this page</p>
                    <ExternalLink
                      href="https://www.qovery.com/docs/getting-started/installation/aws#create-your-cluster"
                      size="sm"
                    >
                      How to create new credentials
                    </ExternalLink>
                  </div>
                  <div className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral p-4">
                    <h3 className="text-sm font-medium text-neutral">2. Fill in these information</h3>
                    <Controller
                      name="region"
                      control={methods.control}
                      render={({ field }) => (
                        <InputSelect
                          label="Region"
                          value={field.value}
                          placeholder="Select a region"
                          onChange={(value) => field.onChange(value as string)}
                          options={regionOptions}
                          isSearchable
                          portal
                        />
                      )}
                    />
                    <Controller
                      name="accessKey"
                      control={methods.control}
                      render={({ field }) => (
                        <InputText name={field.name} label="Access key" value={field.value} onChange={field.onChange} />
                      )}
                    />
                    <Controller
                      name="secretAccessKey"
                      control={methods.control}
                      render={({ field }) => (
                        <InputText
                          name={field.name}
                          label="Secret access key"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <Controller
                      name="secretManagerName"
                      control={methods.control}
                      render={({ field }) => (
                        <InputText
                          name={field.name}
                          label="Secret manager name"
                          value={field.value}
                          onChange={field.onChange}
                          hint="Display name in Qovery"
                        />
                      )}
                    />
                  </div>
                </>
              ) : authenticationType ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
                    <h3 className="text-sm font-medium text-neutral">1. Connect to your AWS Console</h3>
                    <p className="text-sm text-neutral-subtle">Make sure you are connected to the right AWS account</p>
                    <ExternalLink href="https://aws.amazon.com/fr/console/" size="sm">
                      https://aws.amazon.com/fr/console/
                    </ExternalLink>
                  </div>
                  <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
                    <h3 className="text-sm font-medium text-neutral">
                      2. Create a role for Qovery and grant assume role permissions
                    </h3>
                    <p className="text-sm text-neutral-subtle">
                      Execute the following Cloudformation stack and retrieve the role ARN from the “Output” section.
                    </p>
                    <ExternalLink
                      href="https://console.aws.amazon.com/cloudformation/home?#/stacks/quickcreate?templateURL=https%3A%2F%2Fs3.amazonaws.com%2Fcloudformation-qovery-role-creation%2Ftemplate.json&stackName=qovery-role-creation"
                      size="sm"
                    >
                      Cloudformation stack
                    </ExternalLink>
                  </div>
                  <div className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral p-4">
                    <h3 className="text-sm font-medium text-neutral">3. Provide your credentials info</h3>
                    <Controller
                      name="region"
                      control={methods.control}
                      render={({ field }) => (
                        <InputSelect
                          label="Region"
                          value={field.value}
                          placeholder="Select a region"
                          onChange={(value) => field.onChange(value as string)}
                          options={regionOptions}
                          isSearchable
                          portal
                        />
                      )}
                    />
                    <Controller
                      name="roleArn"
                      control={methods.control}
                      render={({ field }) => (
                        <InputText name={field.name} label="Role ARN" value={field.value} onChange={field.onChange} />
                      )}
                    />
                    <Controller
                      name="secretManagerName"
                      control={methods.control}
                      render={({ field }) => (
                        <InputText
                          name={field.name}
                          label="Secret manager name"
                          value={field.value}
                          onChange={field.onChange}
                          hint="Display name in Qovery"
                        />
                      )}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 border-t border-neutral px-5 py-4">
          <Button type="button" variant="plain" color="neutral" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="lg">
            {mode === 'edit' ? 'Save changes' : 'Add secret manager'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

function RouteComponent() {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const { data: cluster } = useCluster({ organizationId, clusterId })
  const { mutateAsync: editCluster, isLoading: isEditClusterLoading } = useEditCluster()
  const { isQoveryAdminUser } = useUserRole()
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { data: cloudProviders = [] } = useCloudProviders()
  const { selectedCaseId } = useUseCasePage({
    pageId: 'cluster-settings-addons-secret-manager',
    options: SECRET_MANAGER_USE_CASES,
    defaultCaseId: 'delete-no-secrets',
  })
  const currentProvider = useMemo(
    () => cloudProviders.find((cloud) => cloud.short_name === cluster?.cloud_provider),
    [cloudProviders, cluster?.cloud_provider]
  )
  const regionOptions = useMemo(
    () =>
      (currentProvider as CloudProvider | undefined)?.regions?.map((region: ClusterRegion) => ({
        label: `${region.city} (${region.name})`,
        value: region.name,
        icon: <IconFlag code={region.country_code} />,
      })) || [],
    [currentProvider]
  )
  const [observabilityEnabled, setObservabilityEnabled] = useState(false)
  const [kedaEnabled, setKedaEnabled] = useState(false)
  const baseSecretManagers = useMemo(
    () =>
      match(selectedCaseId)
        .with('delete-no-secrets', () =>
          BASE_SECRET_MANAGERS.slice(0, 2).map((manager) => ({ ...manager, usedByServices: 0 }))
        )
        .with('delete-used-no-other', () => [{ ...BASE_SECRET_MANAGERS[0], usedByServices: 32 }])
        .with('delete-used-one-other', () => [
          { ...BASE_SECRET_MANAGERS[0], usedByServices: 32 },
          { ...BASE_SECRET_MANAGERS[1], usedByServices: 0 },
        ])
        .with('delete-used-multiple-other', () => [
          { ...BASE_SECRET_MANAGERS[0], usedByServices: 32 },
          { ...BASE_SECRET_MANAGERS[1], usedByServices: 0 },
          { ...BASE_SECRET_MANAGERS[2], usedByServices: 0 },
        ])
        .otherwise(() => BASE_SECRET_MANAGERS.slice(0, 2)),
    [selectedCaseId]
  )
  const [secretManagers, setSecretManagers] = useState<SecretManagerItem[]>(() => baseSecretManagers)

  useEffect(() => {
    if (cluster) {
      setObservabilityEnabled(Boolean(cluster.metrics_parameters?.enabled))
      setKedaEnabled(Boolean(cluster.keda?.enabled))
    }
  }, [cluster])

  useEffect(() => {
    setSecretManagers(baseSecretManagers)
  }, [baseSecretManagers])

  const getSecretManagerOption = (source: SecretManagerOption['value']) =>
    SECRET_MANAGER_OPTIONS.find((option) => option.value === source) ?? SECRET_MANAGER_OPTIONS[0]

  const openSecretManagerModal = (option: SecretManagerOption, integration?: SecretManagerItem) => {
    openModal({
      content: (
        <SecretManagerIntegrationModal
          option={option}
          regionOptions={regionOptions}
          clusterProvider={cluster?.cloud_provider}
          mode={integration ? 'edit' : 'create'}
          initialValues={integration}
          onClose={closeModal}
          onSubmit={(payload) => {
            setSecretManagers((prev) => {
              if (integration) {
                return prev.map((item) =>
                  item.id === integration.id ? { ...payload, usedByServices: integration.usedByServices ?? 0 } : item
                )
              }
              return [...prev, { ...payload, usedByServices: 0 }]
            })
          }}
        />
      ),
      options: {
        width: 676,
        fakeModal: true,
      },
    })
  }

  const handleSave = async () => {
    if (!cluster) return

    const cloneCluster = {
      ...cluster,
      keda: {
        enabled: kedaEnabled,
      },
    }

    if (isQoveryAdminUser) {
      if (observabilityEnabled) {
        cloneCluster.metrics_parameters = {
          enabled: observabilityEnabled,
          configuration: {
            kind: 'MANAGED_BY_QOVERY',
            resource_profile: cloneCluster.metrics_parameters?.configuration?.resource_profile,
            cloud_watch_export_config: {
              ...cloneCluster.metrics_parameters?.configuration?.cloud_watch_export_config,
              enabled: cloneCluster.metrics_parameters?.configuration?.cloud_watch_export_config?.enabled ?? false,
            },
            high_availability: cloneCluster.metrics_parameters?.configuration?.high_availability,
            internal_network_monitoring: cloneCluster.metrics_parameters?.configuration?.internal_network_monitoring,
            alerting: {
              ...cloneCluster.metrics_parameters?.configuration?.alerting,
              enabled: cloneCluster.metrics_parameters?.configuration?.alerting?.enabled ?? false,
            },
          },
        }
      } else {
        cloneCluster.metrics_parameters = {
          enabled: false,
        }
      }
    }

    try {
      await editCluster({
        organizationId,
        clusterId: cluster.id,
        clusterRequest: cloneCluster,
      })
    } catch (error) {
      console.error(error)
    }
  }

  if (!cluster) {
    return null
  }

  const openDeletionHelper = (integration: SecretManagerItem) => {
    const otherManagers = secretManagers.filter((item) => item.id !== integration.id)
    openModal({
      content: (
        <SecretManagerDeletionHelperModal
          integration={integration}
          otherManagers={otherManagers}
          onClose={closeModal}
          onConfirm={() => {
            setSecretManagers((prev) => prev.filter((item) => item.id !== integration.id))
            closeModal()
          }}
        />
      ),
      options: {
        width: 488,
        fakeModal: true,
      },
    })
  }

  const handleDeleteSecretManager = (integration: SecretManagerItem) => {
    openModalConfirmation({
      title: 'Delete secret manager',
      name: integration.name,
      confirmationMethod: 'action',
      confirmationAction: 'delete',
      action: () => {
        const hasSecrets = (integration.usedByServices ?? 0) > 0
        if (hasSecrets) {
          openDeletionHelper(integration)
        } else {
          setSecretManagers((prev) => prev.filter((item) => item.id !== integration.id))
        }
      },
    })
  }

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="p-8">
        <SettingsHeading
          title="Add-ons"
          description="Add-ons are activable options that will grant you access to specific Qovery feature. You can activate or deactivate them when you want."
        />
        <div className="max-w-content-with-navigation-left">
          <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral shadow-[0_0_4px_0_rgba(0,0,0,0.01),0_2px_3px_0_rgba(0,0,0,0.02)]">
            <div className="border-b border-neutral p-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral">Qovery Observe</span>
                    <Badge size="sm" radius="full" variant="surface" color="yellow" className="text-[13px]">
                      $199/month
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-subtle">
                    Install Prometheus and Loki and your cluster to access Qovery monitoring page. Follow your services
                    usage, create alerts and troubleshoot when any bug occurs.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    color="neutral"
                    variant={observabilityEnabled ? 'surface' : 'outline'}
                    size="md"
                    className="gap-2"
                    onClick={() => setObservabilityEnabled((prev) => !prev)}
                  >
                    <Icon iconName="circle-check" iconStyle="regular" className="text-xs" />
                    {observabilityEnabled ? 'Activated' : 'Activate'}
                  </Button>
                  <Button type="button" color="neutral" variant="plain" size="md">
                    More details
                  </Button>
                </div>
              </div>
            </div>
            <div className="border-b border-neutral p-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral">KEDA autoscaler</span>
                    <Badge size="sm" radius="full" variant="surface" color="green" className="text-[13px]">
                      Free
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-subtle">
                    Qovery KEDA autoscaler allows you to add event-based autoscaling on all the services running on this
                    cluster.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    color="neutral"
                    variant={kedaEnabled ? 'surface' : 'outline'}
                    size="md"
                    className="gap-2"
                    onClick={() => setKedaEnabled((prev) => !prev)}
                  >
                    <Icon iconName="circle-check" iconStyle="regular" className="text-xs" />
                    {kedaEnabled ? 'Activated' : 'Activate'}
                  </Button>
                  <Button type="button" color="neutral" variant="plain" size="md">
                    More details
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral">Secret manager integration</span>
                    <Badge size="sm" radius="full" variant="surface" color="green" className="text-[13px]">
                      Free
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-subtle">
                    Link any secret manager on your cluster to add external secrets variables to all the services
                    running on your cluster
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button color="neutral" variant="solid" size="md" className="gap-2" type="button">
                        <Icon iconName="circle-plus" iconStyle="regular" className="text-xs" />
                        Add secret manager
                        <Icon iconName="chevron-down" className="text-[10px]" />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="start">
                      {SECRET_MANAGER_OPTIONS.map((option) => (
                        <DropdownMenu.Item
                          key={option.value}
                          color="neutral"
                          icon={<Icon name={option.icon} width={16} height={16} />}
                          onClick={() => openSecretManagerModal(option)}
                        >
                          {option.label}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                  {secretManagers.length > 0 && (
                    <div className="w-full rounded-md border border-neutral bg-surface-neutral-subtle">
                      {secretManagers.map((manager, index) => (
                        <div
                          key={manager.id}
                          className={`flex items-center justify-between gap-3 p-3 ${
                            index < secretManagers.length - 1 ? 'border-b border-neutral' : ''
                          }`}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <Icon name={manager.provider} width={24} height={24} />
                            <div className="flex min-w-0 flex-1 flex-col gap-1 text-[13px] leading-4">
                              <p className="truncate font-medium text-neutral">{manager.name}</p>
                              <div className="flex flex-nowrap items-center gap-2 text-neutral-subtle">
                                <span>
                                  Type: <span className="text-neutral">{manager.typeLabel}</span>
                                </span>
                                <span>
                                  Authentication: <span className="text-neutral">{manager.authentication}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {manager.authentication !== 'Automatic' && (
                              <Button
                                type="button"
                                variant="outline"
                                color="neutral"
                                size="md"
                                iconOnly
                                onClick={() => openSecretManagerModal(getSecretManagerOption(manager.source), manager)}
                              >
                                <Icon iconName="pen" iconStyle="regular" className="text-xs" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              color="neutral"
                              size="md"
                              iconOnly
                              onClick={() => handleDeleteSecretManager(manager)}
                            >
                              <Icon iconName="trash" iconStyle="regular" className="text-xs" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Button type="button" size="lg" onClick={handleSave} loading={isEditClusterLoading}>
              Save changes
            </Button>
          </div>
        </div>
      </Section>
    </div>
  )
}
