import { render } from '@testing-library/react'
import { ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { ProbeTypeEnum } from '@qovery/shared/enums'
import ApplicationSettingsHealthchecks, {
  defaultLivenessProbe,
  defaultReadinessProbe,
} from './application-settings-healthchecks'

const defaultTypeReadiness = ProbeTypeEnum.TCP
const defaultTypeLiveness = ProbeTypeEnum.EXEC

const WrapperForm = ({ children }: { children: ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      ...defaultReadinessProbe,
      ...defaultLivenessProbe,
    },
    mode: 'all',
  })

  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('ApplicationSettingsHealthchecks', () => {
  it('should render successfully', () => {
    const { baseElement, getByTestId } = render(
      <WrapperForm>
        <ApplicationSettingsHealthchecks
          ports={[]}
          defaultTypeReadiness={defaultTypeReadiness}
          defaultTypeLiveness={defaultTypeLiveness}
          isJob={false}
        />
      </WrapperForm>
    )
    expect(baseElement).toBeTruthy()
    getByTestId('input-readiness-probe-current-type')
    getByTestId('input-liveness-probe-current-type')
  })

  it('should display probe ports when types are not EXEC', () => {
    const defaultTypeReadiness = ProbeTypeEnum.TCP
    const defaultTypeLiveness = ProbeTypeEnum.HTTP
    const ports = [80, 443]
    const jobPort = null
    const isJob = false

    const { getByTestId, queryByTestId } = render(
      <WrapperForm>
        <ApplicationSettingsHealthchecks
          ports={ports}
          jobPort={jobPort}
          defaultTypeReadiness={defaultTypeReadiness}
          defaultTypeLiveness={defaultTypeLiveness}
          isJob={isJob}
        />
      </WrapperForm>
    )

    expect(queryByTestId('input-job-readiness-probe-port')).toBeNull()
    expect(getByTestId('input-readiness-probe-current-type').value).toBe(defaultTypeReadiness)

    // Vérifie qu'il n'y a pas de champ port pour type liveness NONE ou EXEC
    expect(queryByTestId('input-liveness-probe-port')).toBeNull()

    // Vérifie qu'il y a un champ port pour type liveness TCP_SOCKET et HTTP_GET
    expect(getByTestId('input-liveness-probe-current-type').value).toBe(defaultTypeLiveness)
    expect(getByTestId('input-liveness-probe-port')).toBeTruthy()
  })
})
