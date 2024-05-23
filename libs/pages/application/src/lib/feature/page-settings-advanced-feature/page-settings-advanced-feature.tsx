import { useParams } from 'react-router-dom'
import { type AnyService, type Database } from '@qovery/domains/services/data-access'
import {
  AdvancedSettings,
  useAdvancedSettings,
  useDefaultAdvancedSettings,
  useService,
} from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Section } from '@qovery/shared/ui'

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
    <div className="flex w-full flex-col justify-between">
      <Section className="p-8">
        <SettingsHeading
          title="Advanced Settings"
          description="Settings are injected at the build and run time of your application and thus any change on this section will be applied on the next manual/automatic deploy."
        />
        <AdvancedSettings
          key={JSON.stringify(advancedSettings)}
          service={service}
          defaultAdvancedSettings={defaultAdvancedSettings}
          advancedSettings={advancedSettings}
        />
      </Section>
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
