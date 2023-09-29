import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ClusterGeneralSettings } from '@qovery/shared/console-shared'
import { BlockContent, ButtonLegacy, ButtonLegacySize, ButtonLegacyStyle, HelpSection } from '@qovery/shared/ui'

export interface PageSettingsGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  loading?: boolean
}

export function PageSettingsGeneral(props: PageSettingsGeneralProps) {
  const { onSubmit, loading } = props
  const { formState } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <h2 className="h5 mb-8 text-neutral-400">General settings</h2>
        <form onSubmit={onSubmit}>
          <BlockContent title="General information">
            <ClusterGeneralSettings fromDetail />
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
      </div>
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

export default PageSettingsGeneral
