import { useParams } from '@tanstack/react-router'
import { type Organization } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { type FormEventHandler } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { Controller, useFormContext } from 'react-hook-form'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { BlockContent, Button, InputFile, InputTags, InputText, InputTextArea, Section } from '@qovery/shared/ui'
import { dateMediumLocalFormat } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useEditOrganization } from '../hooks/use-edit-organization/use-edit-organization'
import { useOrganization } from '../hooks/use-organization/use-organization'

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
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading title="General" />

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
                <p className="mb-1 font-medium text-neutral">{watch('name')}</p>
                <span className="block text-xs text-neutral-subtle">
                  Created since {dateMediumLocalFormat(created_at)}
                </span>
              </div>
            </div>
            <hr className="relative -left-5 my-5 w-[calc(100%+41px)] border-0 border-b border-neutral" />
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
            <p className="ml-3 mt-1 text-xs text-neutral-subtle">
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

export const handleSubmit = (data: FieldValues, organization: Organization) => {
  return {
    ...organization,
    logo_url: data['logo_url'],
    name: data['name'],
    description: data['description'],
    website_url: data['website_url'] === '' ? undefined : data['website_url'],
    admin_emails: data['admin_emails'],
  }
}

export function PageOrganizationGeneralFeature() {
  const { organizationId = '' } = useParams({ strict: false })
  useDocumentTitle('General - Organization settings')

  const { data: organization } = useOrganization({ organizationId })
  const { mutateAsync: editOrganization, isLoading: isLoadingEditOrganization } = useEditOrganization()

  const methods = useForm({
    mode: 'onChange',
  })

  useEffect(() => {
    methods.reset({
      name: organization?.name || '',
      logo_url: organization?.logo_url || '',
      description: organization?.description || '',
      website_url: organization?.website_url || '',
      admin_emails: organization?.admin_emails || '',
    })
  }, [
    methods,
    organization?.logo_url,
    organization?.name,
    organization?.description,
    organization?.website_url,
    organization?.admin_emails,
  ])

  const onSubmit = methods.handleSubmit(async (data) => {
    if (data && organization) {
      const cloneOrganization = handleSubmit(data, organization)

      try {
        await editOrganization({
          organizationId,
          organizationRequest: cloneOrganization,
        })
      } catch (error) {
        console.error(error)
      }
    }
  })

  if (!organization) return null

  return (
    <FormProvider {...methods}>
      <PageOrganizationGeneral
        onSubmit={onSubmit}
        loading={isLoadingEditOrganization}
        created_at={organization?.created_at || ''}
      />
    </FormProvider>
  )
}
