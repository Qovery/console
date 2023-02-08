import { FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ClusterRemoteSettings } from '@qovery/shared/console-shared'
import { Button, ButtonSize, ButtonStyle, HelpSection } from '@qovery/shared/ui'

export interface PageSettingsRemoteProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  loading: boolean
}

export function PageSettingsRemote(props: PageSettingsRemoteProps) {
  const { onSubmit, loading } = props
  const { formState } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <h2 className="h5 mb-2 text-text-700">Remote access</h2>
        <form onSubmit={onSubmit}>
          <ClusterRemoteSettings fromDetail />
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
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#what-is-a-cluster',
            linkLabel: 'How to configure my cluster',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsRemote
