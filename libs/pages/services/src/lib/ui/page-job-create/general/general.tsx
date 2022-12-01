import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { EntrypointCmdInputs, GeneralContainerSettings } from '@qovery/shared/console-shared'
import { IconEnum, ServiceTypeEnum } from '@qovery/shared/enums'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import { SERVICES_URL } from '@qovery/shared/router'
import { Button, ButtonSize, ButtonStyle, Icon, InputSelect, InputText, InputTextArea, Link } from '@qovery/shared/ui'
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

      <EntrypointCmdInputs entrypointRequired />

      <div className="border-b border-b-element-light-lighter-400 mb-3"></div>

      <p className="text-text-500 text-sm mb-3">Job configuration</p>

      {props.jobType === 'cron' ? (
        <Controller
          name="schedule"
          control={control}
          rules={{
            required: 'Value required',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-2"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Schedule - Cron expression"
              error={error?.message}
            />
          )}
        />
      ) : (
        <p>lifecycle event widget</p>
      )}

      <div className="mb-3 flex justify-between">
        <p className="text-text-500 text-xs ">Every minutes</p>
        <Link
          external={true}
          link="https://docs.qovery.com/docs/faq#what-is-a-cron-expression"
          className="text-text-400 !text-xs"
          linkLabel="CRON expression builder"
        />
      </div>

      <Controller
        name="nb_restarts"
        control={control}
        rules={{
          required: 'Value required',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            type="number"
            className="mb-2"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Number of restarts"
            error={error?.message}
          />
        )}
      />
      <p className="text-text-400 text-xs mb-3">
        Maximum number of restarts allowed in case of job failure (0 means no failure)
      </p>

      <Controller
        name="max_duration"
        control={control}
        rules={{
          required: 'Value required',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            type="number"
            className="mb-2"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Max duration in seconds"
            error={error?.message}
          />
        )}
      />

      <p className="text-text-400 text-xs mb-3">
        Maximum duration allowed for the job to run before killing it and mark it as failed
      </p>

      <Controller
        name="port"
        control={control}
        rules={{
          required: 'Value required',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            type="number"
            className="mb-2"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Port"
            error={error?.message}
          />
        )}
      />

      <p className="text-text-400 text-xs mb-3">
        Port where to run readiness and liveliness probes checks. The port will not be exposed externally
      </p>

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
