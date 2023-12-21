import { useParams } from 'react-router-dom'
import { type AnyService, type Database } from '@qovery/domains/services/data-access'
import {
  AdvancedSettings,
  useAdvancedSettings,
  useDefaultAdvancedSettings,
  useService,
} from '@qovery/domains/services/feature'
import { HelpSection } from '@qovery/shared/ui'

interface SettingsAdvancedFeatureProps {
  service: Exclude<AnyService, Database>
}

function SettingsAdvancedFeature({ service }: SettingsAdvancedFeatureProps) {
  const { id: serviceId, serviceType } = service
  const { data: defaultAdvancedSettings } = useDefaultAdvancedSettings({ serviceType })
  const { data: advancedSettings } = useAdvancedSettings({ serviceId, serviceType })

  if (!defaultAdvancedSettings || !advancedSettings) {
    return null
  }

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 ">
        <div className="flex justify-between mb-4">
          <div>
            <h1 className="h5 text-neutral-400 mb-2">Advanced Settings</h1>
            <p className="text-sm text-neutral-400 max-w-content-with-navigation-left">
              Settings are injected at the build and run time of your application and thus any change on this section
              will be applied on the next manual/automatic deploy.
            </p>
          </div>
        </div>
        <AdvancedSettings
          key={JSON.stringify(advancedSettings)}
          service={service}
          defaultAdvancedSettings={defaultAdvancedSettings}
          advancedSettings={advancedSettings}
        />
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/advanced-settings/',
            linkLabel: 'How to configure my application',
          },
        ]}
      />
    </div>
  )
}

export function PageSettingsAdvancedFeature() {
  const { environmentId = '', applicationId = '' } = useParams()

  const { data: service } = useService({ environmentId, serviceId: applicationId })

  if (!service || service?.serviceType === 'DATABASE') {
    return null
  }

  return <SettingsAdvancedFeature service={service} />
}

export default PageSettingsAdvancedFeature
