import { act, getByTestId, render } from '__tests__/utils/setup-jest'
import { PortProtocolEnum } from 'qovery-typescript-axios'
import { ProbeTypeEnum, ServiceTypeEnum } from '@qovery/shared/enums'
import { ApplicationContainerCreateContext } from '../page-application-create-feature'
import StepHealthchecksFeature from './step-healthchecks-feature'

const context = {
  currentStep: 1,
  setCurrentStep: jest.fn(),
  generalData: { name: 'test', serviceType: ServiceTypeEnum.APPLICATION },
  setGeneralData: jest.fn(),
  resourcesData: undefined,
  setResourcesData: jest.fn(),
  setPortData: jest.fn(),
  portData: {
    healthchecks: {
      typeLiveness: ProbeTypeEnum.TCP,
      typeReadiness: ProbeTypeEnum.TCP,
      item: {
        liveness_probe: {
          type: {
            tcp: {
              port: 3000,
            },
          },
          initial_delay_seconds: 1,
          period_seconds: 1,
          timeout_seconds: 1,
          failure_threshold: 1,
          success_threshold: 1,
        },
        readiness_probe: {
          initial_delay_seconds: 1,
          period_seconds: 1,
          timeout_seconds: 1,
          failure_threshold: 1,
          success_threshold: 1,
        },
      },
    },
    ports: [
      {
        protocol: PortProtocolEnum.HTTP,
        name: 'dummy port',
        application_port: 3000,
        external_port: 3000,
        is_public: false,
      },
    ],
  },
}

describe('PageApplicationCreateHealthchecksFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ApplicationContainerCreateContext.Provider value={context}>
        <StepHealthchecksFeature />
      </ApplicationContainerCreateContext.Provider>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should submit the data to the context', async () => {
    const { baseElement } = render(
      <ApplicationContainerCreateContext.Provider value={context}>
        <StepHealthchecksFeature />
      </ApplicationContainerCreateContext.Provider>
    )

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await act(() => {})

    const button = getByTestId(baseElement, 'button-submit')
    expect(button).toBeEnabled()

    await act(() => {
      button.click()
    })

    expect(context.setPortData).toHaveBeenCalled()
  })
})
