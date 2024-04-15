import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import {
  BlockContent,
  ButtonLegacy,
  ButtonLegacySize,
  ButtonLegacyStyle,
  Heading,
  InputText,
  InputTextArea,
  Section,
} from '@qovery/shared/ui'

export interface PageProjectGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  loading: boolean
}

export function PageProjectGeneral(props: PageProjectGeneralProps) {
  const { onSubmit, loading } = props
  const { control, formState, getValues } = useFormContext()

  return (
    <div key={getValues().toString()} className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
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
            <ButtonLegacy
              dataTestId="submit-button"
              className="btn--no-min-w"
              size={ButtonLegacySize.LARGE}
              style={ButtonLegacyStyle.BASIC}
              type="submit"
              disabled={!formState.isValid}
              loading={loading}
            >
              Save
            </ButtonLegacy>
          </div>
        </form>
      </Section>
    </div>
  )
}

export default PageProjectGeneral
