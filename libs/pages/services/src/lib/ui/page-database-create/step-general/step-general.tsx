import {
  CloudProviderEnum,
  type Cluster,
  type ClusterFeatureAwsExistingVpc,
  DatabaseAccessibilityEnum,
  DatabaseModeEnum,
} from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
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
  const { control, formState, watch } = useFormContext<GeneralData>()
  const { organizationId = '', environmentId = '', projectId = '', slug, option } = useParams()
  const navigate = useNavigate()

  const watchType = watch('type')
  const watchMode = watch('mode')

  const databaseAccessibilityOptions: { label: string; value: DatabaseAccessibilityEnum }[] = [
    {
      label: 'Private',
      value: DatabaseAccessibilityEnum.PRIVATE,
    },
  ]

  if (!publicOptionNotAvailable) {
    databaseAccessibilityOptions.push({
      label: 'Public',
      value: DatabaseAccessibilityEnum.PUBLIC,
    })
  }

  const isTemplate = slug !== undefined
  const dataTemplate = serviceTemplates.find((service) => service.slug === slug)
  const dataOptionTemplate = option !== 'current' ? findTemplateData(slug, option) : null

  return (
    <Section>
      {isTemplate ? (
        <div className="mb-10 flex items-center gap-6">
          <img src={dataTemplate?.icon as string} alt={slug} className="h-10 w-10" />
          <div>
            <Heading className="mb-2">
              {dataTemplate?.title} {dataOptionTemplate?.title ? `- ${dataOptionTemplate?.title}` : ''}
            </Heading>
            <p className="text-sm text-neutral-350">
              These general settings allow you to set up the database name, type and version.
            </p>
          </div>
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
          <GeneralSetting label="Service name" />
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
                      className="mb-3"
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
                          className="mb-3"
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
          <Callout.Root className="text-xs" color="yellow">
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
                onChange={field.onChange}
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

          <Controller
            name="accessibility"
            control={control}
            rules={{ required: 'Please select an accessibility' }}
            render={({ field, fieldState: { error } }) => (
              <InputSelect
                label="Accessibility"
                options={databaseAccessibilityOptions}
                onChange={field.onChange}
                value={field.value}
                error={error?.message}
              />
            )}
          />
        </Section>

        {watchMode === DatabaseModeEnum.CONTAINER && (
          <Section className="gap-4">
            <Heading>Extra labels/annotations</Heading>
            <LabelSetting />
            <AnnotationSetting />
          </Section>
        )}

        {watchMode === DatabaseModeEnum.MANAGED && (
          <Section className="gap-4">
            <Heading>Extra labels</Heading>
            <LabelSetting />
          </Section>
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
