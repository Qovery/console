import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { BlockContent, Button, ButtonSize, ButtonStyle, HelpSection, InputText, InputTextArea } from '@qovery/shared/ui'

export interface PageProjectGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  loading: boolean
}

export function PageProjectGeneral(props: PageProjectGeneralProps) {
  const { onSubmit, loading } = props
  const { control, formState, getValues } = useFormContext()

  return (
    <div key={getValues().toString()} className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <h1 className="h5 mb-10 text-text-700">General</h1>
        <form onSubmit={onSubmit}>
          <BlockContent title="Project settings">
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Please enter a name.' }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  className="mb-3"
                  dataTestId="input-name"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Project name"
                  error={error?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <InputTextArea
                  className="mb-3"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  label="Description"
                />
              )}
            />
          </BlockContent>
          <div className="flex justify-end">
            <Button
              dataTestId="submit-button"
              className="btn--no-min-w"
              size={ButtonSize.LARGE}
              style={ButtonStyle.BASIC}
              type="submit"
              disabled={!formState.isValid}
              loading={loading}
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
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/project/#edit-project-general-settings',
            linkLabel: 'How to configure my project',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageProjectGeneral
