import { fireEvent, render, waitFor } from '__tests__/utils/setup-jest'
import { type ReactNode } from 'react'
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
    const { baseElement } = render(
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

    await waitFor(() => {
      const selectReadiness = getByTestId('input-readiness-probe-current-type')
      fireEvent.change(selectReadiness, { target: { value: ProbeTypeEnum.EXEC } })

      const selectLiveness = getByTestId('input-liveness-probe-current-type')
      fireEvent.change(selectLiveness, { target: { value: ProbeTypeEnum.EXEC } })
    })

    // Port is not displayed for EXEC type
    expect(queryByTestId('input-readiness-probe-port')).toBeNull()
    expect(queryByTestId('input-liveness-probe-port')).toBeNull()

    // Render specific fields for EXEC type
    getByTestId('input-readiness-probe-command')
    getByTestId('input-liveness-probe-command')

    // Common Readiness fields
    getByTestId('input-readiness-probe-delay')
    getByTestId('input-readiness-probe-timeout')
    getByTestId('input-readiness-probe-period')
    getByTestId('input-readiness-probe-timeout')
    getByTestId('input-readiness-probe-threshold')
    getByTestId('input-readiness-probe-fail-threshold')
    // Common Liveness fields
    getByTestId('input-liveness-probe-delay')
    getByTestId('input-liveness-probe-timeout')
    getByTestId('input-liveness-probe-period')
    getByTestId('input-liveness-probe-timeout')
    getByTestId('input-liveness-probe-threshold')
    getByTestId('input-liveness-probe-fail-threshold')
  })

  it('should display probe with HTTP type', async () => {
    const defaultTypeReadiness = ProbeTypeEnum.TCP
    const defaultTypeLiveness = ProbeTypeEnum.TCP
    const ports = [80, 443]
    const jobPort = null
    const isJob = false

    const { getByTestId } = render(
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
      const selectReadiness = getByTestId('input-readiness-probe-current-type')
      fireEvent.change(selectReadiness, { target: { value: ProbeTypeEnum.HTTP } })

      const selectLiveness = getByTestId('input-liveness-probe-current-type')
      fireEvent.change(selectLiveness, { target: { value: ProbeTypeEnum.HTTP } })
    })

    // Port is displayed for HTTP type
    getByTestId('input-readiness-probe-port')
    getByTestId('input-liveness-probe-port')

    // Render specific fields for HTTP type
    getByTestId('input-readiness-probe-path')
    getByTestId('input-liveness-probe-path')

    // Common Readiness fields
    getByTestId('input-readiness-probe-delay')
    getByTestId('input-readiness-probe-timeout')
    getByTestId('input-readiness-probe-period')
    getByTestId('input-readiness-probe-timeout')
    getByTestId('input-readiness-probe-threshold')
    getByTestId('input-readiness-probe-fail-threshold')
    // Common Liveness fields
    getByTestId('input-liveness-probe-delay')
    getByTestId('input-liveness-probe-timeout')
    getByTestId('input-liveness-probe-period')
    getByTestId('input-liveness-probe-timeout')
    getByTestId('input-liveness-probe-threshold')
    getByTestId('input-liveness-probe-fail-threshold')
  })

  it('should display probe with GRPC type', async () => {
    const defaultTypeReadiness = ProbeTypeEnum.TCP
    const defaultTypeLiveness = ProbeTypeEnum.TCP
    const ports = [80, 443]
    const jobPort = null
    const isJob = false

    const { getByTestId } = render(
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
      const selectReadiness = getByTestId('input-readiness-probe-current-type')
      fireEvent.change(selectReadiness, { target: { value: ProbeTypeEnum.GRPC } })

      const selectLiveness = getByTestId('input-liveness-probe-current-type')
      fireEvent.change(selectLiveness, { target: { value: ProbeTypeEnum.GRPC } })
    })

    // Port is displayed for GRPC type
    getByTestId('input-readiness-probe-port')
    getByTestId('input-liveness-probe-port')

    // Render specific fields for GRPC type
    getByTestId('input-readiness-probe-service')
    getByTestId('input-liveness-probe-service')

    // Common Readiness fields
    getByTestId('input-readiness-probe-delay')
    getByTestId('input-readiness-probe-timeout')
    getByTestId('input-readiness-probe-period')
    getByTestId('input-readiness-probe-timeout')
    getByTestId('input-readiness-probe-threshold')
    getByTestId('input-readiness-probe-fail-threshold')
    // Common Liveness fields
    getByTestId('input-liveness-probe-delay')
    getByTestId('input-liveness-probe-timeout')
    getByTestId('input-liveness-probe-period')
    getByTestId('input-liveness-probe-timeout')
    getByTestId('input-liveness-probe-threshold')
    getByTestId('input-liveness-probe-fail-threshold')
  })

  it('should display probe with TCP type', async () => {
    const defaultTypeReadiness = ProbeTypeEnum.EXEC
    const defaultTypeLiveness = ProbeTypeEnum.EXEC
    const ports = [80, 443]
    const jobPort = null
    const isJob = false

    const { getByTestId } = render(
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
      const selectReadiness = getByTestId('input-readiness-probe-current-type')
      fireEvent.change(selectReadiness, { target: { value: ProbeTypeEnum.TCP } })

      const selectLiveness = getByTestId('input-liveness-probe-current-type')
      fireEvent.change(selectLiveness, { target: { value: ProbeTypeEnum.TCP } })
    })

    // Port is displayed for TCP type
    getByTestId('input-readiness-probe-port')
    getByTestId('input-liveness-probe-port')

    // Common Readiness fields
    getByTestId('input-readiness-probe-delay')
    getByTestId('input-readiness-probe-timeout')
    getByTestId('input-readiness-probe-period')
    getByTestId('input-readiness-probe-timeout')
    getByTestId('input-readiness-probe-threshold')
    getByTestId('input-readiness-probe-fail-threshold')
    // Common Liveness fields
    getByTestId('input-liveness-probe-delay')
    getByTestId('input-liveness-probe-timeout')
    getByTestId('input-liveness-probe-period')
    getByTestId('input-liveness-probe-timeout')
    getByTestId('input-liveness-probe-threshold')
    getByTestId('input-liveness-probe-fail-threshold')
  })
})
