import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import {
  BlockContent,
  Button,
  ButtonSize,
  ButtonStyle,
  HelpSection,
  InputFile,
  InputTags,
  InputText,
  InputTextArea,
} from '@qovery/shared/ui'

export interface PageOrganizationGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  loading: boolean
  created_at: string
}

export function PageOrganizationGeneral(props: PageOrganizationGeneralProps) {
  const { onSubmit, loading, created_at } = props
  const { control, formState, watch } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <h1 className="h5 mb-10 text-text-700">General</h1>
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
                <p className="text-text-600 font-medium mb-1">{watch('name')}</p>
                <span className="block text-xs text-text-400">Created since {created_at.split('T')[0]}</span>
              </div>
            </div>
            <hr className="my-5 border-0 border-b border-element-light-lighter-500 relative -left-5 w-[calc(100%+41px)]" />
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
            <p className="text-text-400 text-xs ml-4 mt-1">
              Indicate emails where you want to receive important communications from Qovery. (E.g. cluster upgrade,
              downtime...)
            </p>
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
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/#creating-an-organization',
            linkLabel: 'How to configure my organization',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageOrganizationGeneral
