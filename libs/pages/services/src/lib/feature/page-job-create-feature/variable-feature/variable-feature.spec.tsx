import { render } from '__tests__/utils/setup-jest'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { JobContainerCreateContext } from '../page-job-create-feature'
import VariableFeature from './variable-feature'

describe('VariableFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <JobContainerCreateContext.Provider
        value={{
          currentStep: 1,
          setCurrentStep: jest.fn(),
          generalData: { name: 'test', serviceType: ServiceTypeEnum.APPLICATION, description: 'Remi is a bg' },
          setGeneralData: jest.fn(),
          resourcesData: undefined,
          setResourcesData: jest.fn(),
          jobType: 'CRON',
          jobURL: '#',
          variableData: undefined,
          setVariableData: jest.fn(),
        }}
      >
        <VariableFeature />
      </JobContainerCreateContext.Provider>
    )
    expect(baseElement).toBeTruthy()
  })
})
