import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { BlockContent, Button, Heading, InputText, InputTextArea, Section } from '@qovery/shared/ui'

export interface PageProjectGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  loading: boolean
}

export function PageProjectGeneral(props: PageProjectGeneralProps) {
  const { onSubmit, loading } = props
  const { control, formState, getValues } = useFormContext()

  return (
    <div key={getValues().toString()} className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <Heading className="mb-10">General</Heading>
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
            <Button data-testid="submit-button" type="submit" size="lg" disabled={!formState.isValid} loading={loading}>
              Save
            </Button>
          </div>
        </form>
      </Section>
    </div>
  )
}

export default PageProjectGeneral
