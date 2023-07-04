import { render } from '__tests__/utils/setup-jest'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { ApplicationContainerCreateContext } from '../page-application-create-feature'
import StepPortFeature from './step-port-feature'

describe('PageApplicationCreatePortFeature', () => {
  let context: any

  beforeEach(() => {
    context = {
      currentStep: 1,
      setCurrentStep: jest.fn(),
      generalData: { name: 'test', applicationSource: ServiceTypeEnum.APPLICATION },
      setGeneralData: jest.fn(),
      resourcesData: undefined,
      setResourcesData: jest.fn(),
      setPortData: jest.fn(),
      portData: {
        ports: [
          {
            application_port: 3000,
            external_port: 3000,
            is_public: false,
          },
        ],
      },
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(
      <ApplicationContainerCreateContext.Provider value={context}>
        <StepPortFeature />
      </ApplicationContainerCreateContext.Provider>
    )
    expect(baseElement).toBeTruthy()
  })
})
