import { Controller, useFormContext } from 'react-hook-form'
import { IconEnum } from '@console/shared/enums'
import { ApplicationEntity } from '@console/shared/interfaces'
import { BlockContent, Button, ButtonSize, ButtonStyle, HelpSection, Icon, InputToggle } from '@console/shared/ui'

export interface PageSettingsPreviewEnvironmentsProps {
  onSubmit: () => void
  applications?: ApplicationEntity[]
}

export function PageSettingsPreviewEnvironments(props: PageSettingsPreviewEnvironmentsProps) {
  const { onSubmit, applications } = props
  const { control, formState } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8">
        <form onSubmit={onSubmit}>
          <BlockContent title="General">
            <Controller
              name="auto_preview"
              control={control}
              render={({ field }) => (
                <InputToggle
                  value={field.value}
                  onChange={field.onChange}
                  title="Activate preview environment for all applications"
                  description="Automatically create a preview environment when a merge/pull request is submitted on one of your applications."
                  forcedItemStart
                  small
                />
              )}
            />
            <div className={applications && applications.length > 0 ? 'mt-5' : ''}>
              {applications?.map((application: ApplicationEntity) => (
                <div key={application.id} className="h-9 flex items-center">
                  <Controller
                    name={application.id}
                    control={control}
                    render={({ field }) => (
                      <InputToggle
                        value={field.value}
                        onChange={field.onChange}
                        title={
                          <span className="flex items-center -top-1 relative">
                            <Icon name={IconEnum.APPLICATION} className="mr-3" /> {application.name}
                          </span>
                        }
                        small
                      />
                    )}
                  />
                </div>
              ))}
            </div>
          </BlockContent>
          <Button
            className="mb-6"
            disabled={!formState.isValid}
            size={ButtonSize.REGULAR}
            style={ButtonStyle.BASIC}
            type="submit"
          >
            Save
          </Button>
        </form>
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment/#preview-environment',
            linkLabel: 'How to set your preview environment',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsPreviewEnvironments
