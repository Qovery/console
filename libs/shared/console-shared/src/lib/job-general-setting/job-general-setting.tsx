import { BuildModeEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { IconEnum, ServiceTypeEnum } from '@qovery/shared/enums'
import { JobGeneralData, OrganizationEntity } from '@qovery/shared/interfaces'
import { BlockContent, Icon, InputSelect, InputText } from '@qovery/shared/ui'
import CreateGeneralGitApplication from '../create-general-git-application/create-general-git-application'
import GeneralContainerSettings from '../general-container-settings/ui/general-container-settings'
import EditGitRepositorySettingsFeature from '../git-repository-settings/edit-git-repository-settings-feature/edit-git-repository-settings-feature'

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
          {getValues().serviceType === ServiceTypeEnum.APPLICATION &&
            (props.isEdition ? (
              <>
                <EditGitRepositorySettingsFeature />
                <BlockContent title="Build mode">
                  <Controller
                    name="build_mode"
                    control={control}
                    rules={{
                      required: 'Please select a mode.',
                    }}
                    defaultValue={'DOCKER'}
                    render={({ field, fieldState: { error } }) => (
                      <InputSelect
                        dataTestId="input-select-mode"
                        label="Mode"
                        className="mb-3"
                        disabled={true}
                        options={[{ label: 'Docker', value: BuildModeEnum.DOCKER }]}
                        onChange={field.onChange}
                        value={field.value}
                        error={error?.message}
                      />
                    )}
                  />

                  <Controller
                    data-testid="input-text-dockerfile-path"
                    key="dockerfile_path"
                    name="dockerfile_path"
                    defaultValue={'Dockerfile'}
                    control={control}
                    rules={{
                      required: 'Value required',
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <InputText
                        dataTestId="input-text-dockerfile"
                        name={field.name}
                        onChange={field.onChange}
                        value={field.value}
                        label="Dockerfile path"
                        error={error?.message}
                      />
                    )}
                  />
                </BlockContent>
              </>
            ) : (
              <CreateGeneralGitApplication buildModeDisabled={true} />
            ))}

          {getValues().serviceType === ServiceTypeEnum.CONTAINER &&
            (props.isEdition ? (
              <BlockContent title="Container Settings">
                <GeneralContainerSettings organization={props.organization} />
              </BlockContent>
            ) : (
              <GeneralContainerSettings organization={props.organization} />
            ))}
        </>
      )}
    </>
  )
}

export default JobGeneralSetting
