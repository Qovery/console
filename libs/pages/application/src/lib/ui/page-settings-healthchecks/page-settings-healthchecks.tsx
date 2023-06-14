import { ServicePort } from 'qovery-typescript-axios'
import { useFormContext } from 'react-hook-form'
import { ApplicationSettingsHealthchecks, ProbeTypeEnum, ProbeTypeWithNoneEnum } from '@qovery/shared/console-shared'
import { LoadingStatus } from '@qovery/shared/interfaces'
import { HelpSection, StickyActionFormToaster } from '@qovery/shared/ui'

export interface PageSettingsHealthchecksProps {
  loading: LoadingStatus
  defaultTypeReadiness?: ProbeTypeEnum
  defaultTypeLiveness?: ProbeTypeWithNoneEnum
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
          Health checks are automatic ways for Kubernetes to check the status of your application and decide if it can
          receive traffic or needs to be restarted (during the deployment and run phases). These checks are managed by
          two probes: Liveness and Readiness. If your application has special processing requirements (long start-up
          phase, re-load operations during the run), you can customize the liveness and readiness probes to match your
          needs (have a look at the documentation)
        </p>
        <form onSubmit={onSubmit}>
          <div className="relative">
            <ApplicationSettingsHealthchecks
              defaultTypeReadiness={ProbeTypeEnum.TCP}
              defaultTypeLiveness={ProbeTypeWithNoneEnum.NONE}
              ports={ports?.map((port) => port.internal_port)}
            />
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
            linkLabel: 'How to configure my health checks',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsHealthchecks
