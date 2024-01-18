import { type Organization } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { AutoDeploySetting } from '@qovery/domains/services/feature'
import { JobGeneralSettings } from '@qovery/shared/console-shared'
import { type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobGeneralData } from '@qovery/shared/interfaces'
import { SERVICES_URL } from '@qovery/shared/routes'
import { ButtonLegacy, ButtonLegacySize, ButtonLegacyStyle, InputText, InputTextArea } from '@qovery/shared/ui'

export interface StepGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  organization?: Organization
  jobType: JobType
}

export function StepGeneral(props: StepGeneralProps) {
  const { organizationId = '', environmentId = '', projectId = '' } = useParams()
  const navigate = useNavigate()
  const { formState, control, watch } = useFormContext<JobGeneralData>()
  const watchServiceType = watch('serviceType')

  // NOTE: Validation corner case where git settings can be in loading state
  const isGitSettingsValid = watchServiceType === 'APPLICATION' ? watch('branch') : true

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
        {watchServiceType && (
          <AutoDeploySetting source={watchServiceType === ServiceTypeEnum.CONTAINER ? 'CONTAINER_REGISTRY' : 'GIT'} />
        )}

        <div className="flex justify-between mt-6">
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
            disabled={!(formState.isValid && isGitSettingsValid)}
            size={ButtonLegacySize.XLARGE}
            style={ButtonLegacyStyle.BASIC}
          >
            Continue
          </ButtonLegacy>
        </div>
      </form>
    </div>
  )
}

export default StepGeneral
