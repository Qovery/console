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
import { type Value } from '@qovery/shared/interfaces'
import { SERVICES_URL } from '@qovery/shared/routes'
import {
  BlockContent,
  ButtonLegacy,
  ButtonLegacySize,
  ButtonLegacyStyle,
  Callout,
  Heading,
  Icon,
  InputRadio,
  InputSelect,
  InputText,
  InputTextArea,
  Section,
} from '@qovery/shared/ui'
import { type GeneralData } from '../../../feature/page-database-create-feature/database-creation-flow.interface'

export interface StepGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
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
      <div className="mb-10">
        <Heading className="mb-2">General information</Heading>
        <p className="text-neutral-400 text-sm mb-2">
          These general settings allow you to set up the database name, type and version.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <Controller
          name="name"
          control={control}
          rules={{
            required: 'Please enter a name',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Database name"
              error={error?.message}
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <InputTextArea
              dataTestId="input-textarea-description"
              name="description"
              className="mb-3"
              onChange={field.onChange}
              value={field.value}
              label="Description (optional)"
              error={error?.message}
            />
          )}
        />

        <BlockContent title="Database mode" className="mb-6">
          <div className={`flex gap-4 ${cloudProvider === CloudProviderEnum.AWS ? 'justify-center' : ''}`}>
            <Controller
              name="mode"
              control={control}
              render={({ field }) => (
                <>
                  {cloudProvider === CloudProviderEnum.AWS && cluster.kubernetes !== 'SELF_MANAGED' && (
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
        </BlockContent>

        <div className="h-[1px] bg-neutral-200 w-full my-6"></div>

        {watchMode === DatabaseModeEnum.MANAGED && clusterVpc && (
          <Callout.Root className="mb-3 text-xs" color="yellow">
            <Callout.Icon>
              <Icon className="text-xs" iconName="circle-info" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>Action needed</Callout.TextHeading>
              Add the following tag on your VPC ({clusterVpc.aws_vpc_eks_id}) in AWS: <br />
              Key: <strong>ClusterId</strong> Value: <strong>z{cluster.id.split('-')[0]}</strong>
            </Callout.Text>
          </Callout.Root>
        )}

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
              className="mb-3"
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
              className={`mb-3 ${watchType && watchMode ? '' : 'hidden'}`}
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
              className="mb-10"
            />
          )}
        />

        <div className="flex justify-between">
          <ButtonLegacy
            onClick={() => navigate(SERVICES_URL(organizationId, projectId, environmentId))}
            type="button"
            className="btn--no-min-w"
            size={ButtonLegacySize.XLARGE}
            style={ButtonLegacyStyle.STROKED}
          >
            Cancel
          </ButtonLegacy>
          <ButtonLegacy
            dataTestId="button-submit"
            type="submit"
            disabled={!formState.isValid}
            size={ButtonLegacySize.XLARGE}
            style={ButtonLegacyStyle.BASIC}
          >
            Continue
          </ButtonLegacy>
        </div>
      </form>
    </Section>
  )
}

export default StepGeneral
