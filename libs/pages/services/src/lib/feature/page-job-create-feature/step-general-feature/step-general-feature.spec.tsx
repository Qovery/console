import { render } from '__tests__/utils/setup-jest'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { JobContainerCreateContext } from '../page-job-create-feature'
import StepGeneralFeature from './step-general-feature'

describe('GeneralFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <JobContainerCreateContext.Provider
        value={{
          currentStep: 1,
          setCurrentStep: jest.fn(),
          generalData: {
            name: 'test',
            serviceType: ServiceTypeEnum.APPLICATION,
            description: 'Application Description',
          },
          setGeneralData: jest.fn(),
          resourcesData: undefined,
          setResourcesData: jest.fn(),
          jobType: ServiceTypeEnum.CRON_JOB,
          jobURL: '#',
          variableData: undefined,
          setVariableData: jest.fn(),
        }}
      >
        <StepGeneralFeature />
      </JobContainerCreateContext.Provider>
    )
    expect(baseElement).toBeTruthy()
  })
})
