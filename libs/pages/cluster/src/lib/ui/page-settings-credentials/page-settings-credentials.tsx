import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ClusterCredentialsSettingsFeature } from '@qovery/shared/console-shared'
import { BlockContent, ButtonLegacy, ButtonSize, ButtonStyle, HelpSection } from '@qovery/shared/ui'

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
      <div className="p-8 max-w-content-with-navigation-left">
        <h2 className="h5 mb-8 text-neutral-400">Credentials</h2>
        <form onSubmit={onSubmit}>
          <BlockContent title="Configured credentials">
            <ClusterCredentialsSettingsFeature cloudProvider={cloudProvider} />
          </BlockContent>
          <div className="flex justify-end">
            <ButtonLegacy
              dataTestId="submit-button"
              className="btn--no-min-w"
              size={ButtonSize.LARGE}
              style={ButtonStyle.BASIC}
              type="submit"
              disabled={!formState.isValid}
              loading={loading}
            >
              Save
            </ButtonLegacy>
          </div>
        </form>
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#credentials',
            linkLabel: 'How to configure my credentials cluster',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsCredentials
