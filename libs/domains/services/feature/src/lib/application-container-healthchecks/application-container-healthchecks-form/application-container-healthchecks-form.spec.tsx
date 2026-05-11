import { FormProvider, useForm } from 'react-hook-form'
import { ProbeTypeEnum } from '@qovery/shared/enums'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ApplicationContainerHealthchecksForm } from './application-container-healthchecks-form'

function Wrapper() {
  const methods = useForm({
    defaultValues: {
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
})
