import { Controller, useFormContext } from 'react-hook-form'
import { ApplicationEntity } from '@console/shared/interfaces'
import { BlockContent, Button, ButtonSize, ButtonStyle, HelpSection, Icon, InputToggle } from '@console/shared/ui'
import { IconEnum } from '@console/shared/enums'

export interface PageSettingsPreviewEnvironmentsProps {
  onSubmit: () => void
  watchEnvPreview: boolean
  applications?: ApplicationEntity[]
}

export function PageSettingsPreviewEnvironments(props: PageSettingsPreviewEnvironmentsProps) {
  const { onSubmit, applications, watchEnvPreview } = props

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
                  description="Automatically create a preview environment when a merge request is submitted on one of your applications. Your environment will be cloned with the application synchronised on the branch waiting to be merged."
                  small
                />
              )}
            />
            {watchEnvPreview && (
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
            )}
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
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment/#delete-an-environment',
            linkLabel: 'How to delete my environment',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsPreviewEnvironments
