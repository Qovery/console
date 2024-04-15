import { EnvironmentModeEnum, type ServicePort } from 'qovery-typescript-axios'
import { useFormContext } from 'react-hook-form'
import { ApplicationSettingsHealthchecks } from '@qovery/shared/console-shared'
import { Button, Callout, Heading, Icon, Link, Section } from '@qovery/shared/ui'

export interface PageSettingsHealthchecksProps {
  loading: boolean
  linkResourcesSetting: string
  isJob: boolean
  jobPort?: number | null
  ports?: ServicePort[]
  onSubmit?: () => void
  minRunningInstances?: number
  environmentMode?: EnvironmentModeEnum
}

export function PageSettingsHealthchecks({
  onSubmit,
  ports,
  loading,
  isJob,
  jobPort,
  linkResourcesSetting,
  minRunningInstances,
  environmentMode,
}: PageSettingsHealthchecksProps) {
  const { formState } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full text-ssm">
      <Section className="p-8 max-w-content-with-navigation-left">
        {environmentMode === EnvironmentModeEnum.PRODUCTION && minRunningInstances === 1 && (
          <Callout.Root color="yellow" className="mb-2">
            <Callout.Icon>
              <Icon iconName="triangle-exclamation" />
            </Callout.Icon>
            <Callout.Text className="text-xs">
              Your service is configured to run with a minimum of one instance, setting the health checks will not
              ensure the service high availability during a cluster upgrade. Have a look at your{' '}
              <Link to={linkResourcesSetting} size="xs">
                instance setup
              </Link>{' '}
              first and increase the minimum instance type.
            </Callout.Text>
          </Callout.Root>
        )}
        <Heading className="mb-2">Health checks</Heading>
        <p className="text-xs text-neutral-400 mb-8">
          Health checks are automatic ways for Kubernetes to check the status of your application and decide if it can
          receive traffic or needs to be restarted (during the deployment and run phases). These checks are managed by
          two probes: Liveness and Readiness. If your application has special processing requirements (long start-up
          phase, re-load operations during the run), you can customize the liveness and readiness probes to match your
          needs (have a look at the documentation)
        </p>
        <form onSubmit={onSubmit}>
          <div className="relative">
            <ApplicationSettingsHealthchecks
              isJob={isJob}
              jobPort={jobPort}
              ports={ports?.map((port) => port.internal_port)}
            />
            <div className="flex justify-end">
              <Button className="mb-6" disabled={!formState.isValid} loading={loading} size="lg" type="submit">
                Save
              </Button>
            </div>
          </div>
        </form>
      </Section>
    </div>
  )
}

export default PageSettingsHealthchecks
