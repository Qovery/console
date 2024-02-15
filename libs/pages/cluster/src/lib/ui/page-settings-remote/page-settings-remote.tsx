import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ClusterRemoteSettings } from '@qovery/shared/console-shared'
import { ButtonLegacy, ButtonLegacySize, ButtonLegacyStyle, Heading, HelpSection, Section } from '@qovery/shared/ui'

export interface PageSettingsRemoteProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  loading: boolean
}

export function PageSettingsRemote(props: PageSettingsRemoteProps) {
  const { onSubmit, loading } = props
  const { formState } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
        <Heading className="mb-8">Remote access</Heading>
        <form onSubmit={onSubmit}>
          <ClusterRemoteSettings fromDetail />
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
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#what-is-a-cluster',
            linkLabel: 'How to configure my cluster',
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsRemote
