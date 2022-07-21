import { Controller, useFormContext } from 'react-hook-form'
import { EnvironmentEntity } from '@console/shared/interfaces'
import { BlockContent, Button, ButtonSize, ButtonStyle, HelpSection, InputToggle } from '@console/shared/ui'

export interface PageSettingsPreviewEnvironmentsProps {
  onSubmit: () => void
  environment?: EnvironmentEntity
}

export function PageSettingsPreviewEnvironments(props: PageSettingsPreviewEnvironmentsProps) {
  const { onSubmit, environment } = props

  const { control, formState } = useFormContext()
  console.log(environment)

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8">
        <form onSubmit={onSubmit}>
          <BlockContent title="General">
            <Controller
              name="auto_delete"
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
