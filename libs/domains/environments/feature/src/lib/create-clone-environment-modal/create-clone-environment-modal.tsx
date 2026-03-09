import { useNavigate } from '@tanstack/react-router'
import {
  type Cluster,
  type CreateEnvironmentModeEnum,
  type Environment,
  EnvironmentModeEnum,
  KubernetesEnum,
} from 'qovery-typescript-axios'
import { type FormEvent, useMemo, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { P, match } from 'ts-pattern'
import { useClusters } from '@qovery/domains/clusters/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { Button, Callout, ExternalLink, Icon, InputSelect, InputText, ModalCrud, useModal } from '@qovery/shared/ui'
import { EnvironmentMode } from '../environment-mode/environment-mode'
import { useCloneEnvironment } from '../hooks/use-clone-environment/use-clone-environment'
import { useCreateEnvironment } from '../hooks/use-create-environment/use-create-environment'

export interface CreateCloneEnvironmentModalProps {
  projectId: string
  organizationId: string
  environmentToClone?: Environment
  onClose: () => void
  type?: EnvironmentModeEnum
  cloneUseCaseId?: string
}

type SecretManagerDescriptor = {
  id: string
  name: string
  provider: 'AWS' | 'GCP'
}

type CloneMigrationAction = 'migrate' | 'detach' | 'convert'
export type CloneMigrationUseCaseOption = {
  id: string
  label: string
}
type CloneUseCaseOverrides = {
  forceDifferentCluster?: boolean
  forceSelfManaged?: boolean
  sourceManagers?: SecretManagerDescriptor[]
  targetManagers?: SecretManagerDescriptor[]
}

const SECRET_MANAGER_FIXTURES = {
  awsProd: { id: 'secret-manager-aws-prod', name: 'Prod secret manager', provider: 'AWS' as const },
  awsParameter: { id: 'secret-manager-aws-parameter', name: 'AWS Parameter store', provider: 'AWS' as const },
  gcpStaging: { id: 'secret-manager-gcp-staging', name: 'GCP staging secret manager', provider: 'GCP' as const },
}

const SOURCE_MANAGERS_SINGLE: SecretManagerDescriptor[] = [SECRET_MANAGER_FIXTURES.gcpStaging]
const SOURCE_MANAGERS_MULTIPLE: SecretManagerDescriptor[] = [
  SECRET_MANAGER_FIXTURES.gcpStaging,
  SECRET_MANAGER_FIXTURES.awsProd,
]
const TARGET_MANAGERS_SINGLE: SecretManagerDescriptor[] = [SECRET_MANAGER_FIXTURES.gcpStaging]
const TARGET_MANAGERS_MULTIPLE: SecretManagerDescriptor[] = [
  SECRET_MANAGER_FIXTURES.awsProd,
  SECRET_MANAGER_FIXTURES.awsParameter,
]

export const CLONE_MIGRATION_USE_CASES: CloneMigrationUseCaseOption[] = [
  { id: 'default', label: 'Default' },
  { id: 'self-managed', label: 'Self-managed target' },
  { id: 'single-target', label: 'Different cluster (1 manager each)' },
  { id: 'multi-target', label: 'Different cluster (multiple targets)' },
  { id: 'multi-source', label: 'Different cluster (multiple sources)' },
]

const getClusterSecretManagers = (cluster?: Cluster, scope: 'source' | 'target' = 'target') => {
  if (!cluster || cluster.kubernetes === KubernetesEnum.SELF_MANAGED) return []
  if (cluster.cloud_provider === 'AWS') {
    return scope === 'source' ? SOURCE_MANAGERS_MULTIPLE : TARGET_MANAGERS_MULTIPLE
  }
  return scope === 'source' ? SOURCE_MANAGERS_SINGLE : TARGET_MANAGERS_SINGLE
}

function CloneMigrationHelperModal({
  targetManagers,
  detectedTargetName,
  onClose,
  onConfirm,
}: {
  targetManagers: SecretManagerDescriptor[]
  detectedTargetName?: string
  onClose: () => void
  onConfirm: (action: CloneMigrationAction, targetId?: string) => void
}) {
  const [selectedAction, setSelectedAction] = useState<CloneMigrationAction | null>(null)
  const [targetId, setTargetId] = useState('')

  const hasMultipleTargets = targetManagers.length > 1

  const handleSelect = (action: CloneMigrationAction) => {
    setSelectedAction(action)
    if (action !== 'migrate') {
      setTargetId('')
    }
  }

  const canFinalize =
    Boolean(selectedAction) && (!hasMultipleTargets || selectedAction !== 'migrate' || Boolean(targetId))

  const cardBase =
    'flex w-full items-center gap-3 rounded-lg bg-background p-3 text-left outline outline-1 focus:outline focus:outline-1 shadow-[0_0_4px_0_rgba(0,0,0,0.01),0_2px_3px_0_rgba(0,0,0,0.02)]'
  const iconBase = 'flex h-10 w-10 items-center justify-center rounded-md'

  return (
    <div className="relative flex flex-col">
      <div className="px-5 pt-5">
        <h2 className="text-lg font-medium text-neutral">Migration helper</h2>
        <p className="mt-1 text-sm text-neutral-subtle">
          You’re about to clone a environment that contains external secrets from a secret manager on a new cluster.
          Please choose you’re preferred options.
        </p>
      </div>
      <div className="flex flex-col gap-2 px-5 py-5">
        {hasMultipleTargets ? (
          selectedAction === 'migrate' ? (
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
                  <Icon
                    iconName="right-left"
                    iconStyle="regular"
                    className={selectedAction === 'migrate' ? 'text-brand' : undefined}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-neutral">Migrate to another secret manager</span>
                  <span className="text-xs text-neutral-subtle">
                    Migration to one of your other secret manager detected
                  </span>
                </div>
              </button>
              <div className="p-3">
                <InputSelect
                  label="Target secret manager"
                  placeholder="Select a secret manager"
                  value={targetId}
                  onChange={(value) => setTargetId(value as string)}
                  options={targetManagers.map((manager) => ({ label: manager.name, value: manager.id }))}
                  portal
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleSelect('migrate')}
              className={`${cardBase} outline-neutral focus:outline-neutral`}
            >
              <div className={`${iconBase} bg-surface-neutral-component`}>
                <Icon iconName="right-left" iconStyle="regular" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-neutral">Migrate to another secret manager</span>
                <span className="text-xs text-neutral-subtle">
                  Migration to one of your other secret manager detected
                </span>
              </div>
            </button>
          )
        ) : (
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
                selectedAction === 'migrate' ? 'bg-surface-brand-component text-brand' : 'bg-surface-neutral-component'
              }`}
            >
              <Icon
                iconName="right-left"
                iconStyle="regular"
                className={selectedAction === 'migrate' ? 'text-brand' : undefined}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-neutral">Migrate to detected secret manager</span>
              <span className="text-xs text-neutral-subtle">
                Migration to “
                <span className="font-medium text-neutral">{detectedTargetName ?? 'Detected secret manager'}</span>”
              </span>
            </div>
          </button>
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
            <Icon
              iconName="link"
              iconStyle="regular"
              className={selectedAction === 'detach' ? 'text-brand' : undefined}
            />
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
            <Icon
              iconName="lock-keyhole"
              iconStyle="regular"
              className={selectedAction === 'convert' ? 'text-brand' : undefined}
            />
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
          Finalize clone
        </Button>
      </div>
    </div>
  )
}

function CloneMigrationTableModal({
  sourceManagers,
  targetManagers,
  onClose,
  onConfirm,
}: {
  sourceManagers: SecretManagerDescriptor[]
  targetManagers: SecretManagerDescriptor[]
  onClose: () => void
  onConfirm: (mapping: Record<string, string>) => void
}) {
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const targetOptions = useMemo(
    () => [
      ...targetManagers.map((item) => ({
        label: item.name,
        value: item.id,
        icon: <Icon width={16} height={16} name={item.provider} />,
      })),
      {
        label: 'Detach all references',
        value: '__detach_all__',
        icon: <Icon iconName="link" iconStyle="regular" className="text-sm" />,
      },
      {
        label: 'Convert to empty Qovery secrets',
        value: '__convert_qovery__',
        icon: <Icon iconName="lock-keyhole" iconStyle="regular" className="text-sm" />,
      },
    ],
    [targetManagers]
  )

  const isComplete = sourceManagers.every((manager) => Boolean(mapping[manager.id]))

  return (
    <div className="relative flex flex-col">
      <div className="px-5 pt-5">
        <h2 className="text-lg font-medium text-neutral">Migration helper</h2>
        <p className="mt-1 text-sm text-neutral-subtle">
          You’re about to clone a environment that contains external secrets from a secret manager on a new cluster. For
          each detected secret manager please choose you’re preferred option.
        </p>
      </div>
      <div className="px-5 py-5">
        <div className="overflow-hidden rounded-lg border border-neutral bg-background">
          <div className="flex border-b border-neutral">
            <div className="flex-1 border-r border-neutral px-3 py-2 font-mono text-xs text-neutral-subtle">
              Initial source
            </div>
            <div className="flex-1 px-3 py-2 font-mono text-xs text-neutral-subtle">Migration target</div>
          </div>
          {sourceManagers.map((manager, index) => (
            <div
              key={manager.id}
              className={`flex ${index < sourceManagers.length - 1 ? 'border-b border-neutral' : ''}`}
            >
              <div className="flex-1 border-r border-neutral p-3">
                <InputSelect
                  value={manager.id}
                  onChange={() => null}
                  inputClassName="input--inline"
                  options={sourceManagers.map((item) => ({
                    label: item.name,
                    value: item.id,
                    icon: <Icon width={16} height={16} name={item.provider} />,
                  }))}
                  portal
                  disabled
                />
              </div>
              <div className="flex-1 p-3">
                <InputSelect
                  value={mapping[manager.id]}
                  placeholder="Select"
                  onChange={(value) =>
                    setMapping((current) => ({
                      ...current,
                      [manager.id]: value as string,
                    }))
                  }
                  inputClassName="input--inline"
                  options={targetOptions}
                  portal
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-neutral px-5 py-4">
        <Button type="button" variant="plain" color="neutral" size="lg" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" size="lg" disabled={!isComplete} onClick={() => onConfirm(mapping)}>
          Finalize clone
        </Button>
      </div>
    </div>
  )
}

export function CreateCloneEnvironmentModal({
  projectId,
  organizationId,
  environmentToClone,
  onClose,
  type,
  cloneUseCaseId,
}: CreateCloneEnvironmentModalProps) {
  const navigate = useNavigate()
  const { enableAlertClickOutside } = useModal()
  const { data: clusters = [] } = useClusters({ organizationId })
  const { data: projects = [] } = useProjects({ organizationId })
  const selectedCaseId = cloneUseCaseId ?? 'default'

  const { mutateAsync: createEnvironment, isLoading: isCreateEnvironmentLoading } = useCreateEnvironment()
  const { mutateAsync: cloneEnvironment, isLoading: isCloneEnvironmentLoading } = useCloneEnvironment()
  const [migrationModal, setMigrationModal] = useState<{
    type: 'helper' | 'table'
    payload: { name: string; cluster: string; mode: EnvironmentModeEnum; project_id: string }
    sourceManagers: SecretManagerDescriptor[]
    targetManagers: SecretManagerDescriptor[]
  } | null>(null)

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      name: environmentToClone?.name ? environmentToClone.name + '-clone' : '',
      cluster: clusters.find(({ is_default }) => is_default)?.id,
      mode: type ?? EnvironmentModeEnum.DEVELOPMENT,
      project_id: projectId,
    },
  })

  const selectedClusterId = methods.watch('cluster')
  const selectedCluster = useMemo(
    () => clusters.find((cluster) => cluster.id === selectedClusterId),
    [clusters, selectedClusterId]
  )
  const sourceCluster = useMemo(
    () => clusters.find((cluster) => cluster.id === environmentToClone?.cluster_id),
    [clusters, environmentToClone?.cluster_id]
  )
  const isSelfManagedTarget = selectedCluster?.kubernetes === KubernetesEnum.SELF_MANAGED
  const useCaseOverrides = useMemo<CloneUseCaseOverrides>(() => {
    return match(selectedCaseId)
      .with('self-managed', () => ({
        forceDifferentCluster: true,
        forceSelfManaged: true,
        sourceManagers: SOURCE_MANAGERS_SINGLE,
        targetManagers: [],
      }))
      .with('single-target', () => ({
        forceDifferentCluster: true,
        sourceManagers: SOURCE_MANAGERS_SINGLE,
        targetManagers: TARGET_MANAGERS_SINGLE,
      }))
      .with('multi-target', () => ({
        forceDifferentCluster: true,
        sourceManagers: SOURCE_MANAGERS_SINGLE,
        targetManagers: TARGET_MANAGERS_MULTIPLE,
      }))
      .with('multi-source', () => ({
        forceDifferentCluster: true,
        sourceManagers: SOURCE_MANAGERS_MULTIPLE,
        targetManagers: TARGET_MANAGERS_MULTIPLE,
      }))
      .otherwise(() => ({}))
  }, [selectedCaseId])

  const resolvedIsSelfManaged = useCaseOverrides.forceSelfManaged ?? isSelfManagedTarget
  const resolvedSourceManagers = useCaseOverrides.sourceManagers ?? getClusterSecretManagers(sourceCluster, 'source')
  const resolvedTargetManagers = useCaseOverrides.targetManagers ?? getClusterSecretManagers(selectedCluster, 'target')
  const resolvedIsDifferentCluster =
    useCaseOverrides.forceDifferentCluster ??
    Boolean(sourceCluster && selectedCluster && sourceCluster.id !== selectedCluster.id)

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const executeClone = async (payload: {
    name: string
    cluster: string
    mode: EnvironmentModeEnum
    project_id: string
  }) => {
    const result = await cloneEnvironment({
      environmentId: environmentToClone?.id ?? '',
      payload: {
        name: payload.name,
        mode: payload.mode,
        cluster_id: payload.cluster,
        project_id: payload.project_id,
      },
    })

    navigate({
      to: `/organization/${organizationId}/project/${payload.project_id}/environment/${result.id}/overview`,
    })
    onClose()
  }

  const onSubmit = methods.handleSubmit(async ({ name, cluster, mode, project_id }) => {
    if (!cluster) {
      return
    }

    if (environmentToClone) {
      const payload = {
        name,
        cluster,
        mode: mode as EnvironmentModeEnum,
        project_id,
      }

      const sourceManagers = resolvedSourceManagers
      const targetManagers = resolvedTargetManagers

      if (
        resolvedIsDifferentCluster &&
        !resolvedIsSelfManaged &&
        sourceManagers.length > 0 &&
        targetManagers.length > 0
      ) {
        setMigrationModal({
          type: sourceManagers.length > 1 ? 'table' : 'helper',
          payload,
          sourceManagers,
          targetManagers,
        })
        return
      }

      await executeClone(payload)
    } else {
      const result = await createEnvironment({
        projectId: project_id,
        payload: {
          name: name,
          mode: mode as CreateEnvironmentModeEnum,
          cluster: cluster,
        },
      })
      navigate({
        to: `/organization/${organizationId}/project/${project_id}/environment/${result.id}/overview`,
      })
      onClose()
    }
  })

  const environmentModes = [
    {
      value: EnvironmentModeEnum.DEVELOPMENT,
      label: 'Development',
      icon: <EnvironmentMode mode="DEVELOPMENT" variant="shrink" />,
    },
    {
      value: EnvironmentModeEnum.STAGING,
      label: 'Staging',
      icon: <EnvironmentMode mode="STAGING" variant="shrink" />,
    },
    {
      value: EnvironmentModeEnum.PRODUCTION,
      label: 'Production',
      icon: <EnvironmentMode mode="PRODUCTION" variant="shrink" />,
    },
  ]

  return (
    <FormProvider {...methods}>
      {migrationModal?.type === 'table' ? (
        <CloneMigrationTableModal
          sourceManagers={migrationModal.sourceManagers}
          targetManagers={migrationModal.targetManagers}
          onClose={() => setMigrationModal(null)}
          onConfirm={() => {
            const payload = migrationModal.payload
            setMigrationModal(null)
            executeClone(payload)
          }}
        />
      ) : migrationModal?.type === 'helper' ? (
        <CloneMigrationHelperModal
          targetManagers={migrationModal.targetManagers}
          detectedTargetName={migrationModal.targetManagers[0]?.name}
          onClose={() => setMigrationModal(null)}
          onConfirm={() => {
            const payload = migrationModal.payload
            setMigrationModal(null)
            executeClone(payload)
          }}
        />
      ) : (
        <ModalCrud
          title={environmentToClone ? 'Clone Environment' : 'Create Environment'}
          description={
            environmentToClone
              ? 'Clone the environment on the same or different target cluster.'
              : 'Create a new environment and deploy your applications.'
          }
          onClose={onClose}
          onSubmit={onSubmit}
          loading={isCreateEnvironmentLoading || isCloneEnvironmentLoading}
          submitLabel={environmentToClone ? 'Clone' : 'Create'}
          howItWorks={
            environmentToClone ? (
              <>
                <div>
                  It creates a new environment having the same configuration of the source environment. All the
                  configurations will be copied within the new environment except for the custom domains defined on the
                  services. The environment will be cloned on the selected cluster and with the selected type. Once
                  cloned, you will be able to deploy it.
                </div>
                <ExternalLink
                  className="mt-2"
                  href="https://www.qovery.com/docs/configuration/environment#clone-environment"
                >
                  Documentation
                </ExternalLink>
              </>
            ) : (
              <>
                <div>
                  Create a new environment to deploy your applications. You can create a new environment by defining:
                </div>
                <ol className="ml-3 list-disc">
                  <li className="mb-2 mt-2">its name</li>
                  <li className="mb-2">
                    the cluster: you can select one of the existing clusters. Cluster can't be changed after the
                    environment creation.
                  </li>
                  <li className="mb-2">
                    the type: it defines the type of environment you are creating among Production, Staging,
                    Development.
                  </li>
                </ol>
                <ExternalLink
                  className="mt-2"
                  href="https://www.qovery.com/docs/configuration/environment#create-an-environment"
                >
                  Documentation
                </ExternalLink>
              </>
            )
          }
        >
          {environmentToClone && (
            <InputText
              className="mb-3"
              name="clone"
              value={environmentToClone.name}
              label="Environment to clone"
              disabled={true}
            />
          )}
          <Controller
            name="name"
            control={methods.control}
            rules={{
              required: 'Please enter a value',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                className="mb-3"
                name={field.name}
                onChange={(event: FormEvent<HTMLInputElement>) => {
                  field.onChange(event.currentTarget.value)
                }}
                value={field.value}
                label={environmentToClone?.name ? 'New environment name' : 'Environment name'}
                error={error?.message}
              />
            )}
          />
          {environmentToClone && (
            <Controller
              name="project_id"
              control={methods.control}
              rules={{
                required: 'Please select a target project.',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  className="mb-3"
                  onChange={field.onChange}
                  value={field.value}
                  label="Target project"
                  error={error?.message}
                  options={projects.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                  portal
                />
              )}
            />
          )}
          <Controller
            name="cluster"
            control={methods.control}
            rules={{
              required: 'Please select a value.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputSelect
                dataTestId="input-select-cluster"
                className="mb-3"
                onChange={field.onChange}
                value={field.value}
                label="Cluster"
                error={error?.message}
                options={
                  clusters?.map((c) => {
                    const clusterType = match([c.cloud_provider, c.kubernetes])
                      .with(['AWS', KubernetesEnum.MANAGED], ['AWS', undefined], () => 'Managed (EKS)')
                      .with(['AWS', KubernetesEnum.SELF_MANAGED], ['AWS', undefined], () => 'Self-managed')
                      .with(
                        ['AWS', KubernetesEnum.PARTIALLY_MANAGED],
                        ['AWS', undefined],
                        () => 'Partially managed (EKS Anywhere)'
                      )
                      .with(['SCW', P._], () => 'Managed (Kapsule)')
                      .with(['GCP', KubernetesEnum.SELF_MANAGED], () => 'Self-managed')
                      .with(['GCP', P._], () => 'GKE (Autopilot)')
                      .with(['ON_PREMISE', P._], () => 'On-premise')
                      .with(['AZURE', KubernetesEnum.SELF_MANAGED], () => 'Self-managed')
                      .with(['AZURE', P._], () => 'Azure')
                      .with(['DO', P._], () => 'DO')
                      .with(['OVH', P._], () => 'OVH')
                      .with(['CIVO', P._], () => 'CIVO')
                      .with(['HETZNER', P._], () => 'Hetzner')
                      .with(['ORACLE', P._], () => 'Oracle')
                      .with(['IBM', P._], () => 'IBM')
                      .exhaustive()

                    return {
                      value: c.id,
                      label: `${c.name} - ${clusterType}`,
                      icon: <Icon width={16} height={16} name={c.cloud_provider} />,
                    }
                  }) ?? []
                }
                portal={true}
              />
            )}
          />
          {environmentToClone && resolvedIsSelfManaged && (
            <Callout.Root className="mb-3" color="sky">
              <Callout.Icon>
                <Icon iconName="circle-info" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                You are about to clone a environment containing external secrets to a self-manage cluster. All external
                secrets will be converted to empty Qovery secrets upon cloning.
              </Callout.Text>
            </Callout.Root>
          )}
          <Controller
            name="mode"
            control={methods.control}
            rules={{
              required: 'Please select a value.',
            }}
            render={({ field }) => (
              <InputSelect
                className="mb-3"
                dataTestId="input-select-mode"
                options={environmentModes}
                onChange={field.onChange}
                value={field.value}
                label="Type"
                portal={true}
              />
            )}
          />
        </ModalCrud>
      )}
    </FormProvider>
  )
}

export default CreateCloneEnvironmentModal
