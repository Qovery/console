import { useParams } from '@tanstack/react-router'
import {
  CloudProviderEnum,
  DatabaseModeEnum,
  type DatabaseTypeEnum,
  type ManagedDatabaseInstanceTypeResponse,
} from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { useCloudProviderDatabaseInstanceTypes } from '@qovery/domains/cloud-providers/feature'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type Database } from '@qovery/domains/services/data-access'
import { useEditService } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { type Value } from '@qovery/shared/interfaces'
import {
  Button,
  Callout,
  ExternalLink,
  Heading,
  Icon,
  InputSelect,
  InputText,
  Link,
  Section,
  inputSizeUnitRules,
} from '@qovery/shared/ui'
import { buildEditServicePayload } from '@qovery/shared/util-services'

interface DatabaseResourcesFormData {
  cpu: number
  memory: number
  storage: number
  instance_type?: string
}

export interface DatabaseResourcesSettingsProps {
  database: Database
}

interface DatabaseResourcesSettingsFormProps {
  database: Database
  onSubmit: FormEventHandler<HTMLFormElement>
  loading: boolean
  organizationId: string
  clusterId?: string
  cloudProvider?: string
}

function DatabaseResourcesSettingsForm({
  database,
  onSubmit,
  loading,
  organizationId,
  clusterId,
  cloudProvider,
}: DatabaseResourcesSettingsFormProps) {
  const { control, watch, formState } = useFormContext<DatabaseResourcesFormData>()

  const { data: cluster } = useCluster({
    organizationId,
    clusterId,
    enabled: Boolean(clusterId),
    suspense: true,
  })

  const resolvedCloudProvider = (cluster?.cloud_provider ?? cloudProvider ?? CloudProviderEnum.AWS) as CloudProviderEnum

  const { data: databaseInstanceTypes } = useCloudProviderDatabaseInstanceTypes(
    match(resolvedCloudProvider)
      .with(CloudProviderEnum.AWS, (provider) => ({
        cloudProvider: provider,
        databaseType: database.type as DatabaseTypeEnum,
        region: cluster?.region || '',
      }))
      .with(CloudProviderEnum.SCW, (provider) => ({
        cloudProvider: provider,
        databaseType: database.type as DatabaseTypeEnum,
      }))
      .with(CloudProviderEnum.GCP, (provider) => ({
        cloudProvider: provider,
        databaseType: database.type as DatabaseTypeEnum,
      }))
      .otherwise(() => ({
        cloudProvider: CloudProviderEnum.ON_PREMISE,
        databaseType: database.type as DatabaseTypeEnum,
      }))
  )

  const databaseInstanceTypeOptions: Value[] =
    databaseInstanceTypes?.map((instanceType: ManagedDatabaseInstanceTypeResponse) => ({
      label: instanceType.name,
      value: instanceType.name,
    })) ?? []

  const maxMemoryBySize = database.maximum_memory

  const minVCpu = match(cloudProvider)
    .with('GCP', () => 250)
    .otherwise(() => 10)

  const minMemory = match(cloudProvider)
    .with('GCP', () => 512)
    .otherwise(() => 1)

  const minStorageValue = formState.defaultValues?.storage !== 10 ? 20 : 10

  const displayInstanceTypesWarning =
    watch('instance_type') !== database.instance_type && database.mode === DatabaseModeEnum.MANAGED

  const displayStorageWarning =
    watch('storage') !== database.storage && database.mode === DatabaseModeEnum.MANAGED && database.type !== 'REDIS'

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="px-8 pb-8 pt-6">
        <SettingsHeading title="Resources" description="Manage the database resources." />
        <div className="max-w-content-with-navigation-left">
          <form className="space-y-10" onSubmit={onSubmit}>
            {database.mode === DatabaseModeEnum.MANAGED && (
              <Callout.Root color="yellow">
                <Callout.Icon>
                  <Icon iconName="triangle-exclamation" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  <Callout.TextHeading>Qovery manages this resource for you </Callout.TextHeading>
                  <Callout.TextDescription>
                    Use exclusively the Qovery console to update the resources managed by Qovery on your cloud account.
                    <br /> Do not manually update or upgrade them on the cloud provider console, otherwise you will risk
                    a drift in the configuration.
                  </Callout.TextDescription>
                </Callout.Text>
              </Callout.Root>
            )}

            <Section className="gap-4">
              <Heading>Resources configuration</Heading>
              {database.mode !== DatabaseModeEnum.MANAGED && (
                <>
                  <Controller
                    name="cpu"
                    control={control}
                    rules={{
                      min: minVCpu,
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <InputText
                        type="number"
                        name={field.name}
                        label="vCPU (milli)"
                        value={field.value}
                        onChange={field.onChange}
                        hint={
                          <>
                            Minimum value is {minVCpu} milli vCPU. Maximum value allowed based on the selected cluster
                            instance type: {database.maximum_cpu} milli vCPU.{' '}
                            {clusterId && (
                              <Link
                                to="/organization/$organizationId/cluster/$clusterId/settings/resources"
                                params={{ organizationId, clusterId }}
                                size="xs"
                              >
                                Edit node
                              </Link>
                            )}
                          </>
                        }
                        error={
                          error?.type === 'min' ? `Minimum allowed ${field.name} is: ${minVCpu} milli vCPU.` : undefined
                        }
                      />
                    )}
                  />
                  <Controller
                    name="memory"
                    control={control}
                    rules={inputSizeUnitRules(maxMemoryBySize, minMemory)}
                    render={({ field, fieldState: { error } }) => (
                      <InputText
                        dataTestId="input-memory-memory"
                        type="number"
                        name={field.name}
                        label="Memory (MiB)"
                        value={field.value}
                        onChange={field.onChange}
                        hint={
                          <>
                            Minimum value is {minMemory} MiB. Maximum value allowed based on the selected cluster
                            instance type: {database.maximum_memory} MiB.{' '}
                            {clusterId && (
                              <Link
                                to="/organization/$organizationId/cluster/$clusterId/settings/resources"
                                params={{ organizationId, clusterId }}
                                size="xs"
                              >
                                Edit node
                              </Link>
                            )}
                          </>
                        }
                        error={
                          error?.type === 'required'
                            ? 'Please enter a size.'
                            : error?.type === 'max'
                              ? `Maximum allowed ${field.name} is: ${maxMemoryBySize} MiB.`
                              : error?.type === 'min'
                                ? `Minimum allowed ${field.name} is: ${minMemory} MiB.`
                                : undefined
                        }
                      />
                    )}
                  />
                </>
              )}

              {database.mode === DatabaseModeEnum.MANAGED && (
                <>
                  <Controller
                    name="instance_type"
                    control={control}
                    rules={{
                      required: 'Please select an instance type',
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <InputSelect
                        isSearchable
                        onChange={field.onChange}
                        value={field.value}
                        label="Instance type"
                        error={error?.message}
                        options={databaseInstanceTypeOptions}
                        hint="The chosen instance type has a direct impact on your cloud provider cost."
                      />
                    )}
                  />
                  {displayInstanceTypesWarning && (
                    <Callout.Root
                      className="mt-3"
                      color="yellow"
                      data-testid="settings-resources-instance-types-warning"
                    >
                      <Callout.Icon>
                        <Icon iconName="circle-info" iconStyle="regular" />
                      </Callout.Icon>
                      <Callout.Text className="text-neutral-subtle">
                        Once triggered, the update will be managed by your cloud provider and applied during the
                        configured maintenance window. Moreover, the operation might cause a service interruption.{' '}
                        <ExternalLink
                          className="mt-1"
                          href="https://www.qovery.com/docs/configuration/database#applying-changes-to-a-managed-database"
                        >
                          Have a look at the documentation first
                        </ExternalLink>
                      </Callout.Text>
                    </Callout.Root>
                  )}
                </>
              )}

              <Controller
                name="storage"
                control={control}
                rules={
                  database.mode === DatabaseModeEnum.MANAGED && database.type === 'REDIS'
                    ? undefined
                    : {
                        pattern: {
                          value: /^[0-9]+$/,
                          message: 'Please enter a number.',
                        },
                        min: {
                          value: minStorageValue,
                          message: `Storage must be at least ${minStorageValue} GiB.`,
                        },
                      }
                }
                render={({ field, fieldState: { error } }) =>
                  database.mode === DatabaseModeEnum.MANAGED && database.type === 'REDIS' ? (
                    <input type="hidden" {...field} />
                  ) : (
                    <InputText
                      dataTestId="input-memory-storage"
                      name={field.name}
                      label="Storage (GiB)"
                      value={field.value}
                      onChange={field.onChange}
                      error={error?.message}
                    />
                  )
                }
              />
              {displayStorageWarning && (
                <Callout.Root className="mt-3" color="yellow">
                  <Callout.Icon>
                    <Icon iconName="circle-info" iconStyle="regular" />
                  </Callout.Icon>
                  <Callout.Text className="text-neutral-subtle">
                    Once triggered, the update will be managed by your cloud provider and applied during the configured
                    maintenance window. Moreover, the operation might cause a service interruption.{' '}
                    <ExternalLink
                      className="mt-1"
                      href="https://www.qovery.com/docs/configuration/database#applying-changes-to-a-managed-database"
                    >
                      Have a look at the documentation first
                    </ExternalLink>
                  </Callout.Text>
                </Callout.Root>
              )}
            </Section>

            <div className="flex justify-end">
              <Button
                data-testid="submit-button"
                size="lg"
                type="submit"
                disabled={!formState.isValid}
                loading={loading}
              >
                Save
              </Button>
            </div>
          </form>
        </div>
      </Section>
    </div>
  )
}

export function DatabaseResourcesSettings({ database }: DatabaseResourcesSettingsProps) {
  const {
    organizationId = '',
    projectId = '',
    environmentId = '',
    serviceId = '',
  } = useParams({
    strict: false,
  })

  const { data: environment } = useEnvironment({ environmentId, suspense: true })
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({
    organizationId,
    projectId,
    environmentId,
  })

  const methods = useForm<DatabaseResourcesFormData>({
    mode: 'onChange',
    defaultValues: {
      memory: database.memory ?? 0,
      storage: database.storage ?? 0,
      cpu: database.cpu ?? 10,
      instance_type: database.instance_type,
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    editService({
      serviceId: serviceId || database.id,
      payload: buildEditServicePayload({
        service: database,
        request: {
          cpu: Number(data.cpu),
          memory: Number(data.memory),
          storage: Number(data.storage),
          instance_type: data.instance_type,
        },
      }),
    })
  })

  return (
    <FormProvider {...methods}>
      <DatabaseResourcesSettingsForm
        database={database}
        onSubmit={onSubmit}
        loading={isLoadingEditService}
        organizationId={organizationId}
        clusterId={environment?.cluster_id}
        cloudProvider={environment?.cloud_provider.provider}
      />
    </FormProvider>
  )
}

export default DatabaseResourcesSettings
