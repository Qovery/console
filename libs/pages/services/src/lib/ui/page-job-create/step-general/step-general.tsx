import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { JobGeneralSettings } from '@qovery/shared/console-shared'
import { type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobGeneralData, type OrganizationEntity } from '@qovery/shared/interfaces'
import { SERVICES_URL } from '@qovery/shared/routes'
import { Button, ButtonSize, ButtonStyle, InputText, InputTextArea, InputToggle } from '@qovery/shared/ui'

export interface StepGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  organization?: OrganizationEntity
  jobType: JobType
}

export function StepGeneral(props: StepGeneralProps) {
  const { organizationId = '', environmentId = '', projectId = '' } = useParams()
  const navigate = useNavigate()
  const { formState, control, watch } = useFormContext<JobGeneralData>()
  const watchServiceType = watch('serviceType')

  return (
    <div>
      <div className="mb-10">
        <h3 className="text-neutral-400 text-lg mb-2">
          {props.jobType === ServiceTypeEnum.CRON_JOB ? 'Cron' : 'Lifecycle'} job information
        </h3>
        <p className="text-neutral-400 text-sm mb-2">
          General settings allow you to set up your application name, git repository or container settings.
        </p>
      </div>

      <h3 className="text-sm font-semibold mb-3">General</h3>

      <form onSubmit={props.onSubmit}>
        <Controller
          name="name"
          control={control}
          rules={{
            required: 'Please enter a name.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Application name"
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

        <JobGeneralSettings jobType={props.jobType} organization={props.organization} isEdition={false} />

        <Controller
          name="auto_deploy"
          control={control}
          render={({ field }) => (
            <InputToggle
              value={field.value}
              onChange={field.onChange}
              title="Auto-deploy"
              description={
                watchServiceType === ServiceTypeEnum.CONTAINER
                  ? 'The service will be automatically updated if Qovery is notified on the API that a new image tag is available.'
                  : 'The service will be automatically updated on every new commit on the branch.'
              }
              forceAlignTop
              small
            />
          )}
        />

        <div className="flex justify-between mt-6">
          <Button
            onClick={() => navigate(SERVICES_URL(organizationId, projectId, environmentId))}
            type="button"
            className="btn--no-min-w"
            size={ButtonSize.XLARGE}
            style={ButtonStyle.STROKED}
          >
            Cancel
          </Button>
          <Button
            dataTestId="button-submit"
            type="submit"
            disabled={!formState.isValid}
            size={ButtonSize.XLARGE}
            style={ButtonStyle.BASIC}
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepGeneral
