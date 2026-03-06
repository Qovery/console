import { type Organization } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { IconEnum, type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobGeneralData } from '@qovery/shared/interfaces'
import { BlockContent, Icon, InputSelect } from '@qovery/shared/ui'
import { GeneralContainerSettings } from '../general-container-settings/general-container-settings'

export interface JobGeneralSettingProps {
  organization?: Organization
  jobType: JobType
  isEdition?: boolean
  rootPathLabel?: string
  rootPathHint?: string
  openContainerRegistryCreateEditModal?: () => void
  renderEditGitSettings?: () => ReactNode
  renderGitRepositorySettings?: (options: {
    organizationId: string
    rootPathLabel?: string
    rootPathHint?: string
  }) => ReactNode
}

export function JobGeneralSettings(props: JobGeneralSettingProps) {
  const { control, watch } = useFormContext<JobGeneralData>()
  const watchServiceType = watch('serviceType')
  const watchTemplateType = watch('template_type')
  const organizationId = props.organization?.id

  const ContainerSettings = ({ isSetting }: { isSetting?: boolean }) => {
    if (!organizationId) {
      return null
    }

    return (
      <GeneralContainerSettings
        organizationId={organizationId}
        isSetting={isSetting}
        openContainerRegistryCreateEditModal={props.openContainerRegistryCreateEditModal ?? (() => undefined)}
      />
    )
  }

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
                {props.renderEditGitSettings?.()}
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
              props.renderGitRepositorySettings?.({
                organizationId: props.organization?.id ?? '',
                rootPathLabel: props.rootPathLabel,
                rootPathHint: props.rootPathHint,
              })
            ))}

          {watchServiceType === 'CONTAINER' &&
            (props.isEdition ? (
              <div data-testid="container-fields">
                <BlockContent title="Container Settings" classNameContent="space-y-4">
                  {organizationId ? <ContainerSettings isSetting /> : null}
                </BlockContent>
              </div>
            ) : (
              <div data-testid="container-fields" className="space-y-4">
                {organizationId ? <ContainerSettings isSetting={props.isEdition} /> : null}
              </div>
            ))}
        </>
      )}
    </>
  )
}

export default JobGeneralSettings
