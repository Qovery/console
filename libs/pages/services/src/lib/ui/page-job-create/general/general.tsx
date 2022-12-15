import { FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { JobGeneralSetting } from '@qovery/shared/console-shared'
import { JobGeneralData, OrganizationEntity } from '@qovery/shared/interfaces'
import { SERVICES_URL } from '@qovery/shared/router'
import { Button, ButtonSize, ButtonStyle } from '@qovery/shared/ui'

export interface GeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  organization?: OrganizationEntity
  jobType: 'cron' | 'lifecycle'
}

export function General(props: GeneralProps) {
  const { organizationId = '', environmentId = '', projectId = '' } = useParams()
  const navigate = useNavigate()
  const { formState } = useFormContext<JobGeneralData>()

  return (
    <div>
      <div className="mb-10">
        <h3 className="text-text-700 text-lg mb-2">General informations</h3>
        <p className="text-text-500 text-sm mb-2">
          General settings allow you to set up your application name, git repository or container settings.
        </p>
      </div>
      <form onSubmit={props.onSubmit}>
        <JobGeneralSetting jobType={props.jobType} organization={props.organization} />

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

export default General
