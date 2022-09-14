import { Controller, useFormContext } from 'react-hook-form'
import { IconEnum } from '@qovery/shared/enums'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { BlockContent, Button, ButtonSize, ButtonStyle, HelpSection, Icon, InputToggle } from '@qovery/shared/ui'

export interface PageSettingsPreviewEnvironmentsProps {
  onSubmit: () => void
  loading: boolean
  applications?: ApplicationEntity[]
}

export function PageSettingsPreviewEnvironments(props: PageSettingsPreviewEnvironmentsProps) {
  const { onSubmit, applications, loading } = props
  const { control, formState } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8  max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <div>
            <h2 className="h5 text-text-700 mb-2">Preview environments</h2>
          </div>
        </div>
        <form onSubmit={onSubmit}>
          <BlockContent title="General">
            <Controller
              name="auto_preview"
              control={control}
              render={({ field }) => (
                <InputToggle
                  dataTestId="toggle-all"
                  value={field.value}
                  onChange={field.onChange}
                  title="Activate preview environment for all applications"
                  description="Automatically create a preview environment when a merge/pull request is submitted on one of your applications."
                  forceAlignTop
                  small
                />
              )}
            />
            <div data-testid="toggles" className={applications && applications.length > 0 ? 'mt-5' : ''}>
              {applications?.map((application: ApplicationEntity) => (
                <div key={application.id} className="h-9 flex items-center">
                  <Controller
                    name={application.id}
                    control={control}
                    render={({ field }) => (
                      <InputToggle
                        dataTestId={`toggle-${application.id}`}
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
          <div className="flex justify-end">
            <Button
              className="mb-6 btn--no-min-w"
              disabled={!formState.isValid}
              size={ButtonSize.LARGE}
              style={ButtonStyle.BASIC}
              loading={loading}
              type="submit"
            >
              Save
            </Button>
          </div>
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
