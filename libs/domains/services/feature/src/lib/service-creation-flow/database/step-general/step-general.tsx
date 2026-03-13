import * as Collapsible from '@radix-ui/react-collapsible'
import { useParams, useSearch } from '@tanstack/react-router'
import {
  type Cluster,
  type ClusterFeatureAwsExistingVpc,
  type DatabaseConfiguration,
  DatabaseModeEnum,
} from 'qovery-typescript-axios'
import { type FormEventHandler, type ReactNode, useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import { match } from 'ts-pattern'
import {
  BlockContent,
  Button,
  Callout,
  FunnelFlowBody,
  Heading,
  Icon,
  InputRadio,
  InputSelect,
  Link,
  Section,
  SegmentedControl,
} from '@qovery/shared/ui'
import { GeneralSetting } from '../../../general-setting/general-setting'
import {
  type DatabaseCreateGeneralData,
  findDatabaseTemplateMatch,
  generateDatabaseTypeAndVersionOptions,
  getDefaultDatabaseMode,
} from '../database-create-utils'
import { useDatabaseCreateContext } from '../database-creation-flow'

export interface DatabaseStepGeneralProps {
  onSubmit: (data: DatabaseCreateGeneralData) => void
  labelSetting: ReactNode
  annotationSetting: ReactNode
  cloudProvider?: string
  cluster?: Cluster
  clusterVpc?: ClusterFeatureAwsExistingVpc
  databaseConfigurations?: DatabaseConfiguration[]
}

export function DatabaseStepGeneral({
  onSubmit,
  labelSetting,
  annotationSetting,
  cloudProvider,
  cluster,
  clusterVpc,
  databaseConfigurations,
}: DatabaseStepGeneralProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const { template, option } = useSearch({ strict: false })
  const { generalForm, setCurrentStep } = useDatabaseCreateContext()
  const [openExtraAttributes, setOpenExtraAttributes] = useState(false)

  const methods = generalForm
  const watchType = methods.watch('type')
  const watchMode = methods.watch('mode')
  const watchAccessibility = methods.watch('accessibility')

  const databaseOptions = useMemo(
    () =>
      generateDatabaseTypeAndVersionOptions(
        databaseConfigurations,
        watchMode === DatabaseModeEnum.MANAGED ? clusterVpc : undefined
      ),
    [clusterVpc, databaseConfigurations, watchMode]
  )

  const showManagedWithVpcOptions = clusterVpc
    ? generateDatabaseTypeAndVersionOptions(databaseConfigurations, clusterVpc).databaseTypeOptions.length > 0
    : false
  const templateMatch = findDatabaseTemplateMatch(template, option)
  const headerTitle = templateMatch.templateTitle
    ? `${templateMatch.templateTitle}${templateMatch.optionTitle ? ` - ${templateMatch.optionTitle}` : ''}`
    : 'General information'

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  useEffect(() => {
    const currentMode = methods.getValues('mode')
    const defaultMode = getDefaultDatabaseMode({
      currentMode,
      cloudProvider,
      showManagedWithVpcOptions,
    })

    if (!currentMode) {
      methods.setValue('mode', defaultMode, { shouldValidate: true })
    }
  }, [cloudProvider, methods, showManagedWithVpcOptions])

  const handleSubmit: FormEventHandler<HTMLFormElement> = methods.handleSubmit((data) => {
    methods.reset(data)
    onSubmit(data)
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <Section>
          <Heading className="mb-2">{headerTitle}</Heading>
          <p className="mb-10 text-sm text-neutral-subtle">
            These general settings allow you to set up the database name, type and version.
          </p>

          <form className="space-y-10" onSubmit={handleSubmit}>
            <Section className="gap-4">
              <Heading>General</Heading>
              <GeneralSetting
                label="Service name"
                service={{
                  id: '',
                  name: '',
                  created_at: '',
                  version: '',
                  icon_uri: methods.watch('icon_uri'),
                  type: watchType,
                  mode: watchMode,
                  service_type: 'DATABASE',
                  serviceType: 'DATABASE',
                  environment: { id: '' },
                }}
              />
            </Section>

            <BlockContent title="Database mode" className="mb-0" classNameContent="p-5">
              <Controller
                name="mode"
                control={methods.control}
                rules={{ required: 'Please select a database mode' }}
                render={({ field }) => (
                  <div className="flex gap-4">
                    <InputRadio
                      value={DatabaseModeEnum.CONTAINER}
                      name={field.name}
                      description="Deployed on your Kubernetes cluster. Not for production purposes, no back-ups nor snapshots."
                      onChange={field.onChange}
                      formValue={field.value}
                      label="Container mode"
                    />
                    {showManagedWithVpcOptions && cloudProvider === 'AWS' && cluster?.kubernetes !== 'SELF_MANAGED' ? (
                      <InputRadio
                        value={DatabaseModeEnum.MANAGED}
                        name={field.name}
                        description="Managed by your cloud provider. Back-ups and snapshots will be periodically created."
                        onChange={field.onChange}
                        formValue={field.value}
                        label="Managed mode"
                      />
                    ) : null}
                  </div>
                )}
              />
            </BlockContent>

            {watchMode === DatabaseModeEnum.MANAGED && clusterVpc ? (
              <Callout.Root color="yellow">
                <Callout.Icon>
                  <Icon iconName="circle-info" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  <Callout.TextHeading>Action needed</Callout.TextHeading>
                  Add the following tag on your VPC ({clusterVpc.aws_vpc_eks_id}) in AWS: <br />
                  Key: <strong>ClusterId</strong> Value: <strong>z{cluster?.id.split('-')[0]}</strong>
                </Callout.Text>
              </Callout.Root>
            ) : null}

            <Section className="gap-4">
              <Heading>Database configuration</Heading>
              <Controller
                name="type"
                control={methods.control}
                rules={{ required: 'Please select a database type' }}
                render={({ field, fieldState: { error } }) => (
                  <InputSelect
                    label="Database type"
                    options={databaseOptions.databaseTypeOptions}
                    onChange={(value) => {
                      field.onChange(value)
                      methods.resetField('version')
                    }}
                    value={field.value}
                    error={error?.message}
                  />
                )}
              />

              <Controller
                name="version"
                control={methods.control}
                rules={{ required: 'Please select a database version' }}
                render={({ field, fieldState: { error } }) => (
                  <InputSelect
                    className={watchType && watchMode ? '' : 'hidden'}
                    label="Version"
                    options={databaseOptions.databaseVersionOptions[`${watchType}-${watchMode}`] ?? []}
                    onChange={field.onChange}
                    value={field.value}
                    error={error?.message}
                  />
                )}
              />

              <Controller
                name="accessibility"
                control={methods.control}
                rules={{ required: 'Please select an accessibility' }}
                render={({ field }) => (
                  <div>
                    <SegmentedControl.Root
                      defaultValue="PRIVATE"
                      value={field.value}
                      onValueChange={field.onChange}
                      className="w-60 text-sm"
                    >
                      <SegmentedControl.Item value="PRIVATE">Private access</SegmentedControl.Item>
                      <SegmentedControl.Item value="PUBLIC">Public access</SegmentedControl.Item>
                    </SegmentedControl.Root>
                    <p className="mt-2 text-sm text-neutral-subtle">
                      {match({ watchMode, watchAccessibility })
                        .with(
                          { watchMode: 'CONTAINER', watchAccessibility: 'PRIVATE' },
                          { watchMode: 'CONTAINER', watchAccessibility: undefined },
                          () => (
                            <>
                              <strong>Private access to your database is ensured</strong>, as it is only accessible from
                              within your cluster or via our port-forward feature. This setup is recommended for
                              security reasons.
                            </>
                          )
                        )
                        .with(
                          { watchMode: 'MANAGED', watchAccessibility: 'PRIVATE' },
                          { watchMode: 'MANAGED', watchAccessibility: undefined },
                          () => (
                            <>
                              <strong>Private access to your database is ensured</strong>, as it is only accessible from
                              within your cloud network. This configuration is recommended for security reasons.
                            </>
                          )
                        )
                        .with({ watchMode: 'CONTAINER', watchAccessibility: 'PUBLIC' }, () => (
                          <>
                            <strong>Public access to your database is enabled</strong>, making it accessible to
                            authorized users from anywhere, both inside and outside your cluster, allowing for broad
                            access, collaboration, or testing purposes.
                          </>
                        ))
                        .with({ watchMode: 'MANAGED', watchAccessibility: 'PUBLIC' }, () => (
                          <>
                            <strong>Public access to your database is enabled</strong>, making it accessible to
                            authorized users from anywhere, both inside and outside your cloud network, allowing for
                            broad access, collaboration, or testing purposes.
                          </>
                        ))
                        .otherwise(() => null)}
                    </p>
                  </div>
                )}
              />
            </Section>

            <Collapsible.Root open={openExtraAttributes} onOpenChange={setOpenExtraAttributes} asChild>
              <Section className="gap-4">
                <div className="flex justify-between">
                  <Heading>
                    {watchMode === DatabaseModeEnum.MANAGED ? 'Extra labels' : 'Extra labels/annotations'}
                  </Heading>
                  <Collapsible.Trigger className="flex items-center gap-2 text-sm font-medium text-neutral">
                    {openExtraAttributes ? (
                      <>
                        Hide <Icon iconName="chevron-up" />
                      </>
                    ) : (
                      <>
                        Show <Icon iconName="chevron-down" />
                      </>
                    )}
                  </Collapsible.Trigger>
                </div>
                <Collapsible.Content className="flex flex-col gap-4">
                  {labelSetting}
                  {watchMode === DatabaseModeEnum.CONTAINER ? annotationSetting : null}
                </Collapsible.Content>
              </Section>
            </Collapsible.Root>

            <div className="flex justify-between">
              <Link
                as="button"
                size="lg"
                type="button"
                variant="plain"
                color="neutral"
                to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/new"
                params={{ organizationId, projectId, environmentId }}
              >
                Cancel
              </Link>
              <Button data-testid="button-submit" type="submit" disabled={!methods.formState.isValid} size="lg">
                Continue
              </Button>
            </div>
          </form>
        </Section>
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default DatabaseStepGeneral
