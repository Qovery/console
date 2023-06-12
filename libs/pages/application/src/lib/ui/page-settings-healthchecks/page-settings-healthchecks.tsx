import { ServicePort } from 'qovery-typescript-axios'
import { useFormContext } from 'react-hook-form'
import { ApplicationSettingsHealthchecks } from '@qovery/shared/console-shared'
import { LoadingStatus } from '@qovery/shared/interfaces'
import { HelpSection, StickyActionFormToaster } from '@qovery/shared/ui'

export interface PageSettingsHealthchecksProps {
  loading: LoadingStatus
  ports?: ServicePort[]
  onSubmit?: () => void
}

export function PageSettingsHealthchecks({ onSubmit, ports, loading }: PageSettingsHealthchecksProps) {
  const { formState } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full text-ssm">
      <div className="p-8 max-w-content-with-navigation-left">
        <h2 className="h5 text-text-700 mb-2">Health checks</h2>
        <p className="text-xs text-text-500 mb-8">
          Automated health checks allow to verify the status of your application and if it’s ready to receive incoming
          traffic. Kubernetes allows to configure two automatic probes checking the status of your application: Liveness
          and Readiness probes. Within this section you can specify the configuration for both these probes.
        </p>
        <form onSubmit={onSubmit}>
          <div className="relative">
            <ApplicationSettingsHealthchecks ports={ports?.map((port) => port.internal_port)} />
            <StickyActionFormToaster
              visible={formState.isDirty}
              onSubmit={onSubmit}
              disabledValidation={!formState.isValid}
              loading={loading === 'loading'}
            />
          </div>
        </form>
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/advanced-settings/',
            linkLabel: 'How to configure my application',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsHealthchecks
