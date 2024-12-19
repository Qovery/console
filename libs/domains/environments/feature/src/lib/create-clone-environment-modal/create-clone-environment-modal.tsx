import {
  type CreateEnvironmentModeEnum,
  type Environment,
  EnvironmentModeEnum,
  KubernetesEnum,
} from 'qovery-typescript-axios'
import { type FormEvent } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { P, match } from 'ts-pattern'
import { useClusters } from '@qovery/domains/clusters/feature'
import { SERVICES_GENERAL_URL, SERVICES_URL } from '@qovery/shared/routes'
import { ExternalLink, Icon, InputSelect, InputText, ModalCrud, useModal } from '@qovery/shared/ui'
import { EnvironmentMode } from '../environment-mode/environment-mode'
import { useCloneEnvironment } from '../hooks/use-clone-environment/use-clone-environment'
import { useCreateEnvironment } from '../hooks/use-create-environment/use-create-environment'

export interface CreateCloneEnvironmentModalProps {
  projectId: string
  organizationId: string
  environmentToClone?: Environment
  onClose: () => void
}

export function CreateCloneEnvironmentModal({
  projectId,
  organizationId,
  environmentToClone,
  onClose,
}: CreateCloneEnvironmentModalProps) {
  const navigate = useNavigate()
  const { enableAlertClickOutside } = useModal()
  const { data: clusters = [] } = useClusters({ organizationId })

  const { mutateAsync: createEnvironment, isLoading: isCreateEnvironmentLoading } = useCreateEnvironment()
  const { mutateAsync: cloneEnvironment, isLoading: isCloneEnvironmentLoading } = useCloneEnvironment()

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      name: environmentToClone?.name ? environmentToClone.name + '-clone' : '',
      cluster: clusters.find(({ is_default }) => is_default)?.id,
      mode: EnvironmentModeEnum.DEVELOPMENT,
    },
  })

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))
  const onSubmit = methods.handleSubmit(async ({ name, cluster, mode }) => {
    if (environmentToClone) {
      const result = await cloneEnvironment({
        environmentId: environmentToClone.id,
        payload: {
          name,
          mode: mode as EnvironmentModeEnum,
          cluster_id: cluster,
        },
      })
      navigate(SERVICES_URL(organizationId, projectId, result.id) + SERVICES_GENERAL_URL)
    } else {
      const result = await createEnvironment({
        projectId,
        payload: {
          name: name,
          mode: mode as CreateEnvironmentModeEnum,
          cluster: cluster,
        },
      })
      navigate(SERVICES_URL(organizationId, projectId, result.id) + SERVICES_GENERAL_URL)
    }
    onClose()
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
                href="https://hub.qovery.com/docs/using-qovery/configuration/environment/#clone-environment"
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
                  the cluster: you can select one of the existing clusters. Cluster can’t be changed after the
                  environment creation.
                </li>
                <li className="mb-2">
                  the type: it defines the type of environment you are creating among Production, Staging, Development.
                </li>
              </ol>
              <ExternalLink
                className="mt-2"
                href="https://hub.qovery.com/docs/using-qovery/configuration/environment/#create-an-environment"
              >
                Documentation
              </ExternalLink>
            </>
          )
        }
      >
        {environmentToClone && (
          <InputText
            className="mb-6"
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
              className="mb-6"
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
        <Controller
          name="cluster"
          control={methods.control}
          rules={{
            required: 'Please select a value.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              dataTestId="input-select-cluster"
              className="mb-6"
              onChange={field.onChange}
              value={field.value}
              label="Cluster"
              error={error?.message}
              options={
                clusters?.map((c) => {
                  const clusterType = match([c.cloud_provider, c.kubernetes])
                    .with(['AWS', KubernetesEnum.K3_S], () => 'EC2 (K3S)')
                    .with(['AWS', KubernetesEnum.MANAGED], ['AWS', undefined], () => 'Managed (EKS)')
                    .with(['AWS', KubernetesEnum.SELF_MANAGED], ['AWS', undefined], () => 'Self-managed')
                    .with(['SCW', P._], () => 'Managed (Kapsule)')
                    .with(['GCP', KubernetesEnum.SELF_MANAGED], () => 'Self-managed')
                    .with(['GCP', P._], () => 'GKE (Autopilot)')
                    .with(['ON_PREMISE', P._], () => 'On-premise')
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
        <Controller
          name="mode"
          control={methods.control}
          rules={{
            required: 'Please select a value.',
          }}
          render={({ field }) => (
            <InputSelect
              className="mb-6"
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
    </FormProvider>
  )
}

export default CreateCloneEnvironmentModal
