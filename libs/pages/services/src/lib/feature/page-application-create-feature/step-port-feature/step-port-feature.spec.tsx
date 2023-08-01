import { render } from '__tests__/utils/setup-jest'
import { PortProtocolEnum } from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { ApplicationContainerCreateContext } from '../page-application-create-feature'
import StepPortFeature from './step-port-feature'

const context = {
  currentStep: 1,
  setCurrentStep: jest.fn(),
  generalData: { name: 'test', serviceType: ServiceTypeEnum.APPLICATION },
  setGeneralData: jest.fn(),
  resourcesData: undefined,
  setResourcesData: jest.fn(),
  setPortData: jest.fn(),
  portData: {
    ports: [
      {
        protocol: PortProtocolEnum.HTTP,
        name: 'p3000',
        application_port: 3000,
        external_port: 3000,
        is_public: false,
      },
    ],
  },
}

describe('PageApplicationCreatePortFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ApplicationContainerCreateContext.Provider value={context}>
        <StepPortFeature />
      </ApplicationContainerCreateContext.Provider>
    )
    expect(baseElement).toBeTruthy()
  })
})
