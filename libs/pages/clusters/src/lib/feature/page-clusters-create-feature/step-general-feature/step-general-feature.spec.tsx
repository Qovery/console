import { render } from '__tests__/utils/setup-jest'
import { ClusterContainerCreateContext } from '../page-clusters-create-feature'
import StepGeneralFeature from './step-general-feature'

describe('StepGeneralFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ClusterContainerCreateContext.Provider
        value={{
          currentStep: 1,
          setCurrentStep: jest.fn(),
          generalData: { name: 'test', description: 'hello' },
          setGeneralData: jest.fn(),
          // resourcesData: undefined,
          // setResourcesData: jest.fn(),
        }}
      >
        <StepGeneralFeature />
      </ClusterContainerCreateContext.Provider>
    )
    expect(baseElement).toBeTruthy()
  })
})
