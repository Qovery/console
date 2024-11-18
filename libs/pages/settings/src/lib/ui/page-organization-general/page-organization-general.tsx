import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { NeedHelp } from '@qovery/shared/assistant/feature'
import {
  BlockContent,
  Button,
  Heading,
  InputFile,
  InputTags,
  InputText,
  InputTextArea,
  Section,
} from '@qovery/shared/ui'
import { dateMediumLocalFormat } from '@qovery/shared/util-dates'

export interface PageOrganizationGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  loading: boolean
  created_at: string
}

export function PageOrganizationGeneral(props: PageOrganizationGeneralProps) {
  const { onSubmit, loading, created_at } = props
  const { control, formState, watch } = useFormContext()

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left gap-10 p-8">
        <div className="space-y-3">
          <Heading className="text-neutral-400">General</Heading>
          <NeedHelp />
        </div>
        <form onSubmit={onSubmit}>
          <BlockContent title="Organization profile">
            <div className="flex items-center">
              <Controller
                name="logo_url"
                control={control}
                render={({ field }) => (
                  <InputFile dataTestId="input-file" onChange={field.onChange} value={field.value} />
                )}
              />
              <div className="ml-3">
                <p className="mb-1 font-medium text-neutral-400">{watch('name')}</p>
                <span className="block text-xs text-neutral-350">
                  Created since {dateMediumLocalFormat(created_at)}
                </span>
              </div>
            </div>
            <hr className="relative -left-5 my-5 w-[calc(100%+41px)] border-0 border-b border-neutral-250" />
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
                  label="Organization name"
                  error={error?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <InputTextArea
                  dataTestId="input-area"
                  className="mb-3"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Description"
                />
              )}
            />
            <Controller
              name="website_url"
              control={control}
              rules={{
                pattern: {
                  // eslint-disable-next-line no-useless-escape
                  value: /^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm,
                  message: 'The url is not valid',
                },
              }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  className="mb-3"
                  dataTestId="input-website"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  label="Website"
                />
              )}
            />
            <Controller
              name="admin_emails"
              control={control}
              render={({ field }) => (
                <InputTags
                  dataTestId="input-emails"
                  label="Contact emails"
                  placeholder="Add new email"
                  onChange={field.onChange}
                  tags={field.value}
                />
              )}
            />
            <p className="ml-3 mt-1 text-xs text-neutral-350">
              Indicate emails where you want to receive important communications from Qovery. (E.g. cluster upgrade,
              downtime...)
            </p>
          </BlockContent>
          <div className="flex justify-end">
            <Button data-testid="submit-button" size="lg" type="submit" disabled={!formState.isValid} loading={loading}>
              Save
            </Button>
          </div>
        </form>
      </Section>
    </div>
  )
}

export default PageOrganizationGeneral
