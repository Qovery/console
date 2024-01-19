import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ClusterCredentialsSettingsFeature } from '@qovery/shared/console-shared'
import {
  BlockContent,
  ButtonLegacy,
  ButtonLegacySize,
  ButtonLegacyStyle,
  Heading,
  HelpSection,
  Section,
} from '@qovery/shared/ui'

export interface PageSettingsCredentialsProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  cloudProvider?: CloudProviderEnum
  loading?: boolean
}

export function PageSettingsCredentials(props: PageSettingsCredentialsProps) {
  const { onSubmit, loading, cloudProvider } = props
  const { formState } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
        <Heading className="mb-8">Credentials</Heading>
        <form onSubmit={onSubmit}>
          <BlockContent title="Configured credentials">
            <ClusterCredentialsSettingsFeature cloudProvider={cloudProvider} />
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
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#credentials',
            linkLabel: 'How to configure my credentials cluster',
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsCredentials
