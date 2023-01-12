import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { JobGeneralSettings } from '@qovery/shared/console-shared'
import { JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import { JobGeneralData, OrganizationEntity } from '@qovery/shared/interfaces'
import { SERVICES_URL } from '@qovery/shared/routes'
import { Button, ButtonSize, ButtonStyle, InputText, InputTextArea } from '@qovery/shared/ui'

export interface StepGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  organization?: OrganizationEntity
  jobType: JobType
}

export function StepGeneral(props: StepGeneralProps) {
  const { organizationId = '', environmentId = '', projectId = '' } = useParams()
  const navigate = useNavigate()
  const { formState, control } = useFormContext<JobGeneralData>()

  return (
    <div>
      <div className="mb-10">
        <h3 className="text-text-700 text-lg mb-2">
          {props.jobType === ServiceTypeEnum.CRON_JOB ? 'Cron' : 'Lifecycle'} job informations
        </h3>
        <p className="text-text-500 text-sm mb-2">
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

        <div className="flex justify-between">
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
