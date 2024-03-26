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
  const { organizationId = '', environmentId = '', projectId = '' } = useParams()
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

  return (
    <Section>
      <Heading className="mb-2">General information</Heading>

      <form className="space-y-10" onSubmit={onSubmit}>
        <p className="text-neutral-350 text-sm">
          These general settings allow you to set up the database name, type and version.
        </p>

        <Section className="gap-4">
          <Heading>General</Heading>
          <GeneralSetting label="Database name" />
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
                    <InputRadio
                      value={DatabaseModeEnum.CONTAINER}
                      className="mb-3"
                      name={field.name}
                      description="Deployed on your Kubernetes cluster. Not for production purposes, no back-ups nor snapshots."
                      onChange={field.onChange}
                      formValue={field.value}
                      label="Container mode"
                    />
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
