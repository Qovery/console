import { type ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { ProbeTypeEnum } from '@qovery/shared/enums'
import { fireEvent, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
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
    const { baseElement } = renderWithProviders(
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
  })

  it('should display probe with EXEC type', async () => {
    const defaultTypeReadiness = ProbeTypeEnum.TCP
    const defaultTypeLiveness = ProbeTypeEnum.TCP
    const ports = [80, 443]
    const jobPort = null
    const isJob = false

    renderWithProviders(
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

    await waitFor(() => {
      const selectReadiness = screen.getByTestId('input-readiness-probe-current-type')
      fireEvent.change(selectReadiness, { target: { value: ProbeTypeEnum.EXEC } })

      const selectLiveness = screen.getByTestId('input-liveness-probe-current-type')
      fireEvent.change(selectLiveness, { target: { value: ProbeTypeEnum.EXEC } })
    })

    // Port is not displayed for EXEC type
    expect(screen.queryByTestId('input-readiness-probe-port')).not.toBeInTheDocument()
    expect(screen.queryByTestId('input-liveness-probe-port')).not.toBeInTheDocument()

    // Render specific fields for EXEC type
    screen.getByTestId('input-readiness-probe-command')
    screen.getByTestId('input-liveness-probe-command')

    // Common Readiness fields
    screen.getByTestId('input-readiness-probe-delay')
    screen.getByTestId('input-readiness-probe-timeout')
    screen.getByTestId('input-readiness-probe-period')
    screen.getByTestId('input-readiness-probe-timeout')
    screen.getByTestId('input-readiness-probe-threshold')
    screen.getByTestId('input-readiness-probe-fail-threshold')
    // Common Liveness fields
    screen.getByTestId('input-liveness-probe-delay')
    screen.getByTestId('input-liveness-probe-timeout')
    screen.getByTestId('input-liveness-probe-period')
    screen.getByTestId('input-liveness-probe-timeout')
    screen.getByTestId('input-liveness-probe-threshold')
    screen.getByTestId('input-liveness-probe-fail-threshold')
  })

  it('should display probe with HTTP type', async () => {
    const defaultTypeReadiness = ProbeTypeEnum.TCP
    const defaultTypeLiveness = ProbeTypeEnum.TCP
    const ports = [80, 443]
    const jobPort = null
    const isJob = false

    renderWithProviders(
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

    await waitFor(() => {
      const selectReadiness = screen.getByTestId('input-readiness-probe-current-type')
      fireEvent.change(selectReadiness, { target: { value: ProbeTypeEnum.HTTP } })

      const selectLiveness = screen.getByTestId('input-liveness-probe-current-type')
      fireEvent.change(selectLiveness, { target: { value: ProbeTypeEnum.HTTP } })
    })

    // Port is displayed for HTTP type
    screen.getByTestId('input-readiness-probe-port')
    screen.getByTestId('input-liveness-probe-port')

    // Render specific fields for HTTP type
    screen.getByTestId('input-readiness-probe-path')
    screen.getByTestId('input-liveness-probe-path')

    // Common Readiness fields
    screen.getByTestId('input-readiness-probe-delay')
    screen.getByTestId('input-readiness-probe-timeout')
    screen.getByTestId('input-readiness-probe-period')
    screen.getByTestId('input-readiness-probe-timeout')
    screen.getByTestId('input-readiness-probe-threshold')
    screen.getByTestId('input-readiness-probe-fail-threshold')
    // Common Liveness fields
    screen.getByTestId('input-liveness-probe-delay')
    screen.getByTestId('input-liveness-probe-timeout')
    screen.getByTestId('input-liveness-probe-period')
    screen.getByTestId('input-liveness-probe-timeout')
    screen.getByTestId('input-liveness-probe-threshold')
    screen.getByTestId('input-liveness-probe-fail-threshold')
  })

  it('should display probe with GRPC type', async () => {
    const defaultTypeReadiness = ProbeTypeEnum.TCP
    const defaultTypeLiveness = ProbeTypeEnum.TCP
    const ports = [80, 443]
    const jobPort = null
    const isJob = false

    renderWithProviders(
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

    await waitFor(() => {
      const selectReadiness = screen.getByTestId('input-readiness-probe-current-type')
      fireEvent.change(selectReadiness, { target: { value: ProbeTypeEnum.GRPC } })

      const selectLiveness = screen.getByTestId('input-liveness-probe-current-type')
      fireEvent.change(selectLiveness, { target: { value: ProbeTypeEnum.GRPC } })
    })

    // Port is displayed for GRPC type
    screen.getByTestId('input-readiness-probe-port')
    screen.getByTestId('input-liveness-probe-port')

    // Render specific fields for GRPC type
    screen.getByTestId('input-readiness-probe-service')
    screen.getByTestId('input-liveness-probe-service')

    // Common Readiness fields
    screen.getByTestId('input-readiness-probe-delay')
    screen.getByTestId('input-readiness-probe-timeout')
    screen.getByTestId('input-readiness-probe-period')
    screen.getByTestId('input-readiness-probe-timeout')
    screen.getByTestId('input-readiness-probe-threshold')
    screen.getByTestId('input-readiness-probe-fail-threshold')
    // Common Liveness fields
    screen.getByTestId('input-liveness-probe-delay')
    screen.getByTestId('input-liveness-probe-timeout')
    screen.getByTestId('input-liveness-probe-period')
    screen.getByTestId('input-liveness-probe-timeout')
    screen.getByTestId('input-liveness-probe-threshold')
    screen.getByTestId('input-liveness-probe-fail-threshold')
  })

  it('should display probe with TCP type', async () => {
    const defaultTypeReadiness = ProbeTypeEnum.EXEC
    const defaultTypeLiveness = ProbeTypeEnum.EXEC
    const ports = [80, 443]
    const jobPort = null
    const isJob = false

    renderWithProviders(
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

    await waitFor(() => {
      const selectReadiness = screen.getByTestId('input-readiness-probe-current-type')
      fireEvent.change(selectReadiness, { target: { value: ProbeTypeEnum.TCP } })

      const selectLiveness = screen.getByTestId('input-liveness-probe-current-type')
      fireEvent.change(selectLiveness, { target: { value: ProbeTypeEnum.TCP } })
    })

    // Port is displayed for TCP type
    screen.getByTestId('input-readiness-probe-port')
    screen.getByTestId('input-liveness-probe-port')

    // Common Readiness fields
    screen.getByTestId('input-readiness-probe-delay')
    screen.getByTestId('input-readiness-probe-timeout')
    screen.getByTestId('input-readiness-probe-period')
    screen.getByTestId('input-readiness-probe-timeout')
    screen.getByTestId('input-readiness-probe-threshold')
    screen.getByTestId('input-readiness-probe-fail-threshold')
    // Common Liveness fields
    screen.getByTestId('input-liveness-probe-delay')
    screen.getByTestId('input-liveness-probe-timeout')
    screen.getByTestId('input-liveness-probe-period')
    screen.getByTestId('input-liveness-probe-timeout')
    screen.getByTestId('input-liveness-probe-threshold')
    screen.getByTestId('input-liveness-probe-fail-threshold')
  })
})
