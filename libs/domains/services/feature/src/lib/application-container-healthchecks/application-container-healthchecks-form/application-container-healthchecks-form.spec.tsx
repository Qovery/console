import { FormProvider, useForm } from 'react-hook-form'
import { ProbeTypeEnum } from '@qovery/shared/enums'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ApplicationContainerHealthchecksForm } from './application-container-healthchecks-form'

function Wrapper({ startupType = ProbeTypeEnum.NONE }: { startupType?: ProbeTypeEnum }) {
  const methods = useForm({
    defaultValues: {
      startup_probe: {
        current_type: startupType,
      },
      liveness_probe: {
        current_type: ProbeTypeEnum.TCP,
      },
      readiness_probe: {
        current_type: ProbeTypeEnum.HTTP,
        type: {
          http: {
            path: '/',
          },
        },
      },
    },
  })

  return (
    <FormProvider {...methods}>
      <ApplicationContainerHealthchecksForm ports={[8080]} />
    </FormProvider>
  )
}

describe('ApplicationContainerHealthchecksForm', () => {
  it('renders probe fields', () => {
    renderWithProviders(<Wrapper />)

    expect(screen.getByText('Liveness')).toBeInTheDocument()
    expect(screen.getByTestId('input-liveness-probe-port')).toBeInTheDocument()
    expect(screen.getByTestId('input-readiness-probe-path')).toBeInTheDocument()
  })

  it('renders a startup column without startup fields when no startup probe is selected', () => {
    renderWithProviders(<Wrapper />)

    expect(screen.getByText('Startup')).toBeInTheDocument()
    expect(screen.getByTestId('input-startup-probe-current-type')).toBeInTheDocument()
    expect(screen.queryByTestId('input-startup-probe-port')).not.toBeInTheDocument()
    expect(screen.queryByTestId('input-startup-probe-delay')).not.toBeInTheDocument()
  })

  it('renders the startup probe fields of the selected type', () => {
    renderWithProviders(<Wrapper startupType={ProbeTypeEnum.EXEC} />)

    expect(screen.getByTestId('input-startup-probe-command')).toBeInTheDocument()
    expect(screen.getByTestId('input-startup-probe-fail-threshold')).toBeInTheDocument()
    expect(screen.queryByTestId('input-startup-probe-port')).not.toBeInTheDocument()
  })
})
