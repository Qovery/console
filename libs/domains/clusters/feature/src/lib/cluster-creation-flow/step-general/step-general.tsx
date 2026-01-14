import { type CloudProvider, CloudProviderEnum, type ClusterRegion } from 'qovery-typescript-axios'
import { type FormEventHandler, useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { useCloudProviderCredentials, useCloudProviders } from '@qovery/domains/cloud-providers/feature'
import { type ClusterGeneralData, type Value } from '@qovery/shared/interfaces'
import {
  Button,
  Callout,
  FunnelFlowBody,
  Heading,
  Icon,
  IconFlag,
  InputSelect,
  Link,
  LoaderSpinner,
  Section,
} from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { ClusterCredentialsSettings } from '../../cluster-credentials-settings/cluster-credentials-settings'
import { ClusterGeneralSettings } from '../../cluster-general-settings/cluster-general-settings'
import { defaultResourcesData, useClusterContainerCreateContext } from '../cluster-creation-flow'

export interface StepGeneralProps {
  organizationId: string
  onSubmit: (data: ClusterGeneralData) => void
}

export function StepGeneral({ organizationId, onSubmit }: StepGeneralProps) {
  useDocumentTitle('General - Create Cluster')

  const { generalData, setGeneralData, setResourcesData } = useClusterContainerCreateContext()

  const methods = useForm<ClusterGeneralData>({
    defaultValues: { installation_type: 'LOCAL_DEMO', production: false, ...generalData },
    mode: 'onChange',
  })

  // Sync form values when context generalData changes (from slug defaults)
  useEffect(() => {
    if (generalData) {
      methods.reset({ production: false, ...generalData })
    }
  }, [generalData, methods])

  const { control, formState, watch } = methods

  const { data: cloudProviders = [] } = useCloudProviders()
  const { data: credentials = [] } = useCloudProviderCredentials({
    organizationId,
    cloudProvider: methods.getValues('cloud_provider'),
  })

  const [currentProvider, setCurrentProvider] = useState<CloudProvider | undefined>(
    cloudProviders.filter((cloudProvider: CloudProvider) => cloudProvider.short_name === generalData?.cloud_provider)[0]
  )

  const buildCloudProviders: Value[] = useMemo(
    () =>
      cloudProviders.map((value) => ({
        label: upperCaseFirstLetter(value.name),
        value: value.short_name || '',
        icon: <Icon name={value.short_name || CloudProviderEnum.AWS} className="w-4" />,
      })),
    [cloudProviders]
  )

  const buildRegions: Value[] = useMemo(
    () =>
      currentProvider?.regions?.map((region: ClusterRegion) => ({
        label: `${region.city} (${region.name})`,
        value: region.name,
        icon: <IconFlag code={region.country_code} />,
      })) || [],
    [currentProvider?.regions]
  )

  const watchCloudProvider = watch('cloud_provider')
  const watchInstallationType = watch('installation_type')

  useEffect(() => {
    const provider = cloudProviders?.filter((cloud) => cloud.short_name === watchCloudProvider && cloud.regions)[0]
    setCurrentProvider(provider as CloudProvider)
  }, [cloudProviders, watchCloudProvider])

  const handleSubmit: FormEventHandler<HTMLFormElement> = methods.handleSubmit((data) => {
    setResourcesData((d) => ({
      cluster_type: d?.cluster_type ?? '',
      disk_size: d?.disk_size ?? 50,
      instance_type: d?.instance_type ?? '',
      nodes: d?.nodes ?? [3, 10],
      karpenter: {
        enabled: match(data)
          .with({ cloud_provider: 'AWS' }, () => true)
          .otherwise(() => false),
        default_service_architecture: 'AMD64',
        disk_size_in_gib: 50,
        spot_enabled: false,
        qovery_node_pools: {
          requirements: [],
        },
      },
      infrastructure_charts_parameters: d?.infrastructure_charts_parameters,
    }))

    if (credentials.length > 0 || data.installation_type === 'PARTIALLY_MANAGED') {
      if (data['credentials']) {
        const currentCredentials = credentials?.filter((item) => item.id === data['credentials'])[0]
        data['credentials_name'] = currentCredentials.name
      }

      setGeneralData(data)
      onSubmit(data)
    }
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <Section>
          <div className="mb-10">
            <Heading className="mb-2">General information</Heading>
            <p className="mb-2 text-sm text-neutral-subtle">Provide here some general information for your cluster.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Section className="mb-10">
              <Heading className="mb-4">General</Heading>
              <ClusterGeneralSettings />
            </Section>
            <Section className="mb-10">
              <Heading className="mb-3">Provider credentials</Heading>
              {cloudProviders.length > 0 ? (
                <>
                  <Controller
                    name="cloud_provider"
                    control={control}
                    rules={{
                      required: 'Please select a cloud provider.',
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <InputSelect
                        dataTestId="input-cloud-provider"
                        label="Cloud provider"
                        className="mb-3"
                        options={buildCloudProviders}
                        disabled={watchInstallationType === 'PARTIALLY_MANAGED'}
                        onChange={(value) => {
                          field.onChange(value)
                          setResourcesData(defaultResourcesData)
                        }}
                        value={field.value}
                        error={error?.message}
                        portal
                      />
                    )}
                  />
                  {currentProvider && (
                    <>
                      <Controller
                        name="region"
                        control={control}
                        rules={{
                          required: 'Please select a region.',
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelect
                            dataTestId="input-region"
                            label="Region"
                            className="mb-3"
                            options={buildRegions}
                            disabled={watchInstallationType === 'PARTIALLY_MANAGED'}
                            onChange={field.onChange}
                            value={field.value}
                            error={error?.message}
                            isSearchable
                            portal
                          />
                        )}
                      />

                      <ClusterCredentialsSettings
                        cloudProvider={currentProvider.short_name as CloudProviderEnum}
                        isSetting={false}
                      />

                      <Callout.Root className="mb-5 mt-10 grid grid-cols-[40px_auto] gap-4" color="neutral">
                        <Callout.Icon className="w-10 text-4xl">
                          <Icon name="KUBERNETES" className="w-full" />
                        </Callout.Icon>

                        <Callout.Text>
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                              <p className="text-base font-semibold">
                                A fully managed Kubernetes cluster will be deployed
                                <br />
                                on your{' '}
                                {match(currentProvider.short_name as Exclude<CloudProviderEnum, 'ON_PREMISE'>)
                                  .with('AWS', () => 'AWS account (EKS)')
                                  .with('SCW', () => 'Scaleway account (Kapsule)')
                                  .with('AZURE', () => 'Azure account (AKS)')
                                  .with('GCP', () => 'GCP account (Autopilot GKE)')
                                  .exhaustive()}
                              </p>
                              <ul className="list-disc pl-3 text-neutral-subtle">
                                <li>High-availability infrastructure deployed across multiple zones</li>
                                <li>Customizable resources (in the next steps)</li>
                                <li>No Kubernetes expertise required</li>
                              </ul>
                            </div>
                          </div>
                        </Callout.Text>

                        <div className="col-span-2 flex items-start gap-4 rounded border border-surface-info-solid bg-surface-info-subtle p-3 pl-4">
                          <Icon iconName="circle-info" iconStyle="regular" className="text-base text-info" />

                          <div className="flex flex-col gap-1 text-neutral-subtle">
                            <p className="font-semibold">Qovery manages this infrastructure for you.</p>
                            <p>
                              Secure, stable, and optimized environment with continuous security patches and proactive
                              health monitoring
                            </p>
                          </div>
                        </div>
                      </Callout.Root>
                    </>
                  )}
                </>
              ) : (
                <div className="mt-2 flex justify-center">
                  <LoaderSpinner className="w-4" />
                </div>
              )}
            </Section>

            <div className="flex justify-between">
              <Link
                as="button"
                size="lg"
                type="button"
                variant="plain"
                color="neutral"
                to="/organization/$organizationId/cluster/new"
                params={{ organizationId }}
              >
                Cancel
              </Link>
              <Button size="lg" data-testid="button-submit" type="submit" disabled={!formState.isValid}>
                Continue
              </Button>
            </div>
          </form>
        </Section>
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepGeneral
