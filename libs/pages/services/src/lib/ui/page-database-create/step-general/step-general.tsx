import * as Collapsible from '@radix-ui/react-collapsible'
import {
  CloudProviderEnum,
  type Cluster,
  type ClusterFeatureAwsExistingVpc,
  DatabaseAccessibilityEnum,
  DatabaseModeEnum,
} from 'qovery-typescript-axios'
import { type FormEventHandler, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { AnnotationSetting, LabelSetting } from '@qovery/domains/organizations/feature'
import { GeneralSetting } from '@qovery/domains/services/feature'
import { type Value } from '@qovery/shared/interfaces'
import { SERVICES_URL } from '@qovery/shared/routes'
import {
  BlockContent,
  Button,
  Callout,
  Heading,
  Icon,
  InputRadio,
  InputSelect,
  LoaderSpinner,
  Section,
  SegmentedControl,
} from '@qovery/shared/ui'
import { type GeneralData } from '../../../feature/page-database-create-feature/database-creation-flow.interface'
import { findTemplateData } from '../../../feature/page-job-create-feature/page-job-create-feature'
import { serviceTemplates } from '../../../feature/page-new-feature/service-templates'

export interface StepGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  showManagedWithVpcOptions?: boolean
  databaseTypeOptions?: Value[]
  databaseVersionOptions?: { [Key: string]: Value[] }
  cloudProvider?: string
  cluster: Cluster
  clusterVpc?: ClusterFeatureAwsExistingVpc
  publicOptionNotAvailable?: boolean
}

export function StepGeneral({
  databaseTypeOptions,
  databaseVersionOptions = {},
  publicOptionNotAvailable,
  cluster,
  clusterVpc,
  onSubmit,
  cloudProvider,
  showManagedWithVpcOptions,
}: StepGeneralProps) {
  const { control, formState, watch, resetField } = useFormContext<GeneralData>()
  const { organizationId = '', environmentId = '', projectId = '', slug, option } = useParams()
  const navigate = useNavigate()
  const [openExtraAttributes, setOpenExtraAttributes] = useState(false)

  const watchType = watch('type')
  const watchMode = watch('mode')
  const watchAccessibility = watch('accessibility')

  const isTemplate = slug !== undefined
  const dataTemplate = serviceTemplates.find((service) => service.slug === slug)
  const dataOptionTemplate = option !== 'current' ? findTemplateData(slug, option) : null

  return (
    <Section>
      {isTemplate ? (
        <div className="mb-10">
          <Heading className="mb-2">
            {dataTemplate?.title} {dataOptionTemplate?.title ? `- ${dataOptionTemplate?.title}` : ''}
          </Heading>
          <p className="text-sm text-neutral-350">
            These general settings allow you to set up the database name, type and version.
          </p>
        </div>
      ) : (
        <>
          <Heading className="mb-2">General information</Heading>
          <p className="mb-10 text-sm text-neutral-350">
            These general settings allow you to set up the database name, type and version.
          </p>
        </>
      )}

      <form className="space-y-10" onSubmit={onSubmit}>
        <Section className="gap-4">
          <Heading>General</Heading>
          <GeneralSetting
            label="Service name"
            service={{
              id: '',
              name: '',
              service_type: 'DATABASE',
              serviceType: 'DATABASE',
              created_at: '',
              type: 'MONGODB',
              environment: {
                id: '',
              },
              version: '',
              icon_uri: 'app://qovery-console/database',
              mode: watchMode,
            }}
          />
        </Section>

        <BlockContent title="Database mode" className="mb-0">
          {!cluster || !cloudProvider || showManagedWithVpcOptions === undefined ? (
            <div className="flex justify-center p-5">
              <LoaderSpinner className="w-5" />
            </div>
          ) : (
            <div className={`flex gap-4 ${cloudProvider === CloudProviderEnum.AWS ? 'justify-center' : ''}`}>
              <Controller
                name="mode"
                control={control}
                render={({ field }) => (
                  <>
                    <InputRadio
                      value={DatabaseModeEnum.CONTAINER}
                      name={field.name}
                      description="Deployed on your Kubernetes cluster. Not for production purposes, no back-ups nor snapshots."
                      onChange={field.onChange}
                      formValue={field.value}
                      label="Container mode"
                    />
                    {showManagedWithVpcOptions &&
                      cloudProvider === CloudProviderEnum.AWS &&
                      cluster.kubernetes !== 'SELF_MANAGED' && (
                        <InputRadio
                          value={DatabaseModeEnum.MANAGED}
                          name={field.name}
                          description="Managed by your cloud provider. Back-ups and snapshots will be periodically created."
                          onChange={field.onChange}
                          formValue={field.value}
                          label="Managed mode"
                        />
                      )}
                  </>
                )}
              />
            </div>
          )}
        </BlockContent>

        {watchMode === DatabaseModeEnum.MANAGED && clusterVpc && (
          <Callout.Root color="yellow">
            <Callout.Icon>
              <Icon iconName="circle-info" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>Action needed</Callout.TextHeading>
              Add the following tag on your VPC ({clusterVpc.aws_vpc_eks_id}) in AWS: <br />
              Key: <strong>ClusterId</strong> Value: <strong>z{cluster.id.split('-')[0]}</strong>
            </Callout.Text>
          </Callout.Root>
        )}

        <Section className="gap-4">
          <Heading>Database configuration</Heading>
          <Controller
            name="type"
            control={control}
            rules={{ required: 'Please select a database type' }}
            render={({ field, fieldState: { error } }) => (
              <InputSelect
                label="Database type"
                options={databaseTypeOptions || []}
                onChange={(e) => {
                  field.onChange(e)
                  resetField('version')
                }}
                value={field.value}
                error={error?.message}
              />
            )}
          />

          <Controller
            name="version"
            control={control}
            rules={{ required: 'Please select a database version' }}
            render={({ field, fieldState: { error } }) => (
              <InputSelect
                label="Version"
                options={databaseVersionOptions[`${watchType}-${watchMode}`] || []}
                onChange={field.onChange}
                value={field.value}
                error={error?.message}
                className={watchType && watchMode ? '' : 'hidden'}
              />
            )}
          />

          {publicOptionNotAvailable ? (
            <span>
              The access of your database is private, it is only accessible from within your cluster or via our
              port-forward feature. Public access to a K3S cluster running a containerized database is not supported.
            </span>
          ) : (
            <Controller
              name="accessibility"
              control={control}
              rules={{ required: 'Please select an accessibility' }}
              render={({ field }) => (
                <div>
                  <SegmentedControl.Root
                    defaultValue={DatabaseAccessibilityEnum.PRIVATE}
                    value={field.value}
                    onValueChange={field.onChange}
                    className="w-60 text-sm"
                  >
                    <SegmentedControl.Item value={DatabaseAccessibilityEnum.PRIVATE}>
                      Private access
                    </SegmentedControl.Item>
                    <SegmentedControl.Item value={DatabaseAccessibilityEnum.PUBLIC}>
                      Public access
                    </SegmentedControl.Item>
                  </SegmentedControl.Root>
                  <p className="mt-2 text-sm text-neutral-350">
                    {match({ watchMode, watchAccessibility })
                      .with(
                        { watchMode: 'CONTAINER', watchAccessibility: 'PRIVATE' },
                        { watchMode: 'CONTAINER', watchAccessibility: undefined },
                        () => (
                          <>
                            <strong>Private access to your database is ensured</strong>, as it is only accessible from
                            within your cluster or via our port-forward feature. This setup is recommended for security
                            reasons.
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
                          <strong>Public access to your database is enabled</strong>, making it accessible to authorized
                          users from anywhere, both inside and outside your cluster, allowing for broad access,
                          collaboration, or testing purposes.
                        </>
                      ))
                      .with({ watchMode: 'MANAGED', watchAccessibility: 'PUBLIC' }, () => (
                        <>
                          <strong>Public access to your database is enabled</strong>, making it accessible to authorized
                          users from anywhere, both inside and outside your cloud network, allowing for broad access,
                          collaboration, or testing purposes.
                        </>
                      ))
                      .exhaustive()}
                  </p>
                </div>
              )}
            />
          )}
        </Section>

        {watchMode === DatabaseModeEnum.CONTAINER && (
          <Collapsible.Root open={openExtraAttributes} onOpenChange={setOpenExtraAttributes} asChild>
            <Section className="gap-4">
              <div className="flex justify-between">
                <Heading>Extra labels/annotations</Heading>
                <Collapsible.Trigger className="flex items-center gap-2 text-sm font-medium">
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
              </div>{' '}
              <Collapsible.Content className="flex flex-col gap-4">
                <LabelSetting />
                <AnnotationSetting />
              </Collapsible.Content>
            </Section>
          </Collapsible.Root>
        )}

        {watchMode === DatabaseModeEnum.MANAGED && (
          <Collapsible.Root open={openExtraAttributes} onOpenChange={setOpenExtraAttributes} asChild>
            <Section className="gap-4">
              <div className="flex justify-between">
                <Heading>Extra labels</Heading>
                <Collapsible.Trigger className="flex items-center gap-2 text-sm font-medium">
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
              </div>{' '}
              <Collapsible.Content className="flex flex-col gap-4">
                <LabelSetting />
              </Collapsible.Content>
            </Section>
          </Collapsible.Root>
        )}

        <div className="flex justify-between">
          <Button
            onClick={() => navigate(SERVICES_URL(organizationId, projectId, environmentId))}
            type="button"
            className="btn--no-min-w"
            size="lg"
            variant="plain"
          >
            Cancel
          </Button>
          <Button data-testid="button-submit" type="submit" disabled={!formState.isValid} size="lg">
            Continue
          </Button>
        </div>
      </form>
    </Section>
  )
}

export default StepGeneral
