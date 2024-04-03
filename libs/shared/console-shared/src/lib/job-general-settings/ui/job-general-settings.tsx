import { BuildModeEnum, type Organization } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { IconEnum, type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobGeneralData } from '@qovery/shared/interfaces'
import { BlockContent, Icon, InputSelect, InputText } from '@qovery/shared/ui'
import GeneralContainerSettings from '../../general-container-settings/ui/general-container-settings'
import EditGitRepositorySettingsFeature from '../../git-repository-settings/feature/edit-git-repository-settings-feature/edit-git-repository-settings-feature'
import GitRepositorySettings from '../../git-repository-settings/ui/git-repository-settings/git-repository-settings'

export interface JobGeneralSettingProps {
  organization?: Organization
  jobType: JobType
  isEdition?: boolean
}

export function JobGeneralSettings(props: JobGeneralSettingProps) {
  const { control, watch } = useFormContext<JobGeneralData>()
  const watchServiceType = watch('serviceType')

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

      {watchServiceType && (
        <>
          {watchServiceType === 'APPLICATION' &&
            (props.isEdition ? (
              <div data-testid="git-fields">
                <EditGitRepositorySettingsFeature />
                <BlockContent title="Build & deploy">
                  <Controller
                    name="build_mode"
                    control={control}
                    rules={{
                      required: 'Please select a mode.',
                    }}
                    defaultValue="DOCKER"
                    render={({ field, fieldState: { error } }) => (
                      <InputSelect
                        dataTestId="input-select-mode"
                        label="Mode"
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
                    defaultValue="Dockerfile"
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
              </div>
            ) : (
              <GitRepositorySettings withBlockWrapper={false} gitDisabled={false} />
            ))}

          {watchServiceType === 'CONTAINER' &&
            (props.isEdition ? (
              <div data-testid="container-fields">
                <BlockContent title="Container Settings" classNameContent="space-y-4">
                  <GeneralContainerSettings organization={props.organization} />
                </BlockContent>
              </div>
            ) : (
              <div data-testid="container-fields">
                <GeneralContainerSettings organization={props.organization} />
              </div>
            ))}
        </>
      )}
    </>
  )
}

export default JobGeneralSettings
