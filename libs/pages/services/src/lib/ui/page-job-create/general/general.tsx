import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { GeneralContainerSettings } from '@qovery/shared/console-shared'
import { IconEnum, ServiceTypeEnum } from '@qovery/shared/enums'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import { SERVICES_URL } from '@qovery/shared/router'
import { Button, ButtonSize, ButtonStyle, Icon, InputSelect, InputText, InputTextArea } from '@qovery/shared/ui'
import { GeneralData } from '../../../feature/page-job-create-feature/job-creation-flow.interface'
import CreateGeneralGitApplication from '../../page-application-create/page-application-create-general/create-general-git-application/create-general-git-application'

export interface GeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  organization?: OrganizationEntity
  jobType: 'cron' | 'lifecycle'
}

export function General(props: GeneralProps) {
  const { control, watch, getValues, formState } = useFormContext<GeneralData>()
  const { organizationId = '', environmentId = '', projectId = '' } = useParams()
  const navigate = useNavigate()

  watch('serviceType')

  return (
    <div>
      <div className="mb-10">
        <h3 className="text-text-700 text-lg mb-2">General informations</h3>
        <p className="text-text-500 text-sm mb-2">
          General settings allow you to set up your application name, git repository or container settings.
        </p>
      </div>

      <Controller
        name="name"
        control={control}
        rules={{
          required: 'Value required',
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
            label="Description"
            error={error?.message}
          />
        )}
      />

      <Controller
        name="serviceType"
        control={control}
        rules={{
          required: 'Please select a source.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            dataTestId="input-select-source"
            className="mb-6"
            onChange={field.onChange}
            value={field.value}
            options={[
              {
                value: ServiceTypeEnum.APPLICATION,
                label: 'Git provider',
                icon: <Icon name={IconEnum.GIT} className="w-4" />,
              },
              {
                value: ServiceTypeEnum.CONTAINER,
                label: 'Container Registry',
                icon: <Icon name={IconEnum.CONTAINER} className="w-4" />,
              },
            ]}
            label="Application source"
            error={error?.message}
          />
        )}
      />

      {getValues('serviceType') && (
        <>
          <div className="border-b border-b-element-light-lighter-400 mb-3"></div>
          {getValues().serviceType === ServiceTypeEnum.APPLICATION && <CreateGeneralGitApplication />}

          {getValues().serviceType === ServiceTypeEnum.CONTAINER && (
            <GeneralContainerSettings organization={props.organization} />
          )}
        </>
      )}

      <form onSubmit={props.onSubmit}>
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
