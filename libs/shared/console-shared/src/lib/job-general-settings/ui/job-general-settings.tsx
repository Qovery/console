import { type Organization } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { IconEnum, type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobGeneralData } from '@qovery/shared/interfaces'
import { BlockContent, Icon, InputSelect } from '@qovery/shared/ui'
import GeneralContainerSettings from '../../general-container-settings/ui/general-container-settings'
import EditGitRepositorySettingsFeature from '../../git-repository-settings/feature/edit-git-repository-settings-feature/edit-git-repository-settings-feature'
import GitRepositorySettings from '../../git-repository-settings/ui/git-repository-settings/git-repository-settings'

export interface JobGeneralSettingProps {
  organization?: Organization
  jobType: JobType
  isEdition?: boolean
  rootPathLabel?: string
  rootPathHint?: string
}

export function JobGeneralSettings(props: JobGeneralSettingProps) {
  const { control, watch } = useFormContext<JobGeneralData>()
  const watchServiceType = watch('serviceType')
  const watchTemplateType = watch('template_type')

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
              disabled={!!watchTemplateType}
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
                  <InputSelect
                    dataTestId="input-select-mode"
                    label="Mode"
                    options={[{ label: 'Docker', value: 'DOCKER' }]}
                    value="DOCKER"
                    disabled
                  />
                </BlockContent>
              </div>
            ) : (
              <GitRepositorySettings
                gitDisabled={false}
                rootPathLabel={props.rootPathLabel}
                rootPathHint={props.rootPathHint}
              />
            ))}

          {watchServiceType === 'CONTAINER' &&
            (props.isEdition ? (
              <div data-testid="container-fields">
                <BlockContent title="Container Settings" classNameContent="space-y-4">
                  <GeneralContainerSettings organization={props.organization} isSetting />
                </BlockContent>
              </div>
            ) : (
              <div data-testid="container-fields" className="space-y-4">
                <GeneralContainerSettings organization={props.organization} isSetting={props.isEdition} />
              </div>
            ))}
        </>
      )}
    </>
  )
}

export default JobGeneralSettings
