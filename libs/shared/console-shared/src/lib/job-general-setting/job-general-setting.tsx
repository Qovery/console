/* eslint-disable-next-line */
import { Controller, useFormContext } from 'react-hook-form'
import { IconEnum, ServiceTypeEnum } from '@qovery/shared/enums'
import { JobGeneralData, OrganizationEntity } from '@qovery/shared/interfaces'
import { Icon, InputSelect, InputText, InputTextArea } from '@qovery/shared/ui'
import CreateGeneralGitApplication from '../create-general-git-application/create-general-git-application'
import GeneralContainerSettings from '../general-container-settings/ui/general-container-settings'

export interface JobGeneralSettingProps {
  organization?: OrganizationEntity
  jobType: 'cron' | 'lifecycle'
  isEdition?: boolean
}

export function JobGeneralSetting(props: JobGeneralSettingProps) {
  const { watch } = useFormContext<JobGeneralData>()
  const { control, getValues } = useFormContext<JobGeneralData>()
  watch('serviceType')

  return (
    <>
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

      {!props.isEdition && (
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
      )}

      {getValues('serviceType') && (
        <>
          <div className="border-b border-b-element-light-lighter-400 mb-3"></div>
          {getValues().serviceType === ServiceTypeEnum.APPLICATION && <CreateGeneralGitApplication />}

          {getValues().serviceType === ServiceTypeEnum.CONTAINER && (
            <GeneralContainerSettings organization={props.organization} />
          )}
        </>
      )}
    </>
  )
}

export default JobGeneralSetting
