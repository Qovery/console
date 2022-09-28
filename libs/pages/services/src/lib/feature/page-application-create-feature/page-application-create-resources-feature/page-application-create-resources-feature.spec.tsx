import ResizeObserver from '__tests__/utils/resize-observer'
import { render } from '__tests__/utils/setup-jest'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { ApplicationContainerCreateContext } from '../page-application-create-feature'
import PageApplicationCreateResourcesFeature from './page-application-create-resources-feature'

describe('PageApplicationCreateResourcesFeature', () => {
  it('should render successfully', () => {
    window.ResizeObserver = ResizeObserver
    const { baseElement } = render(
      <ApplicationContainerCreateContext.Provider
        value={{
          currentStep: 1,
          setCurrentStep: jest.fn(),
          generalData: { name: 'test', serviceType: ServiceTypeEnum.APPLICATION },
          setGeneralData: jest.fn(),
          resourcesData: {
            memory_unit: 'MB',
            memory: 512,
            cpu: [0.5],
            instances: [1, 12],
          },
          setResourcesData: jest.fn(),
          setPortData: jest.fn(),
          portData: undefined,
        }}
      >
        <PageApplicationCreateResourcesFeature />
      </ApplicationContainerCreateContext.Provider>
    )
    expect(baseElement).toBeTruthy()
  })
})
