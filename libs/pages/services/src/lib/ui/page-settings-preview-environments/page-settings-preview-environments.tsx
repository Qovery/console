import { EnvironmentEntity } from '@console/shared/interfaces'
import { BlockContent, HelpSection } from '@console/shared/ui'

export interface PageSettingsPreviewEnvironmentsProps {
  environment?: EnvironmentEntity
}

export function PageSettingsPreviewEnvironments(props: PageSettingsPreviewEnvironmentsProps) {
  const { environment } = props

  console.log(environment)

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8">
        <BlockContent title="General">
          <p>Test block</p>
        </BlockContent>
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment/#delete-an-environment',
            linkLabel: 'How to delete my environment',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsPreviewEnvironments
