import { ServiceTypeEnum } from '@qovery/shared/enums'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { JobContainerCreateContext } from '../page-job-create-feature'
import StepIntroductionFeature from './step-introduction-feature'

describe('StepIntroductionFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
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
        <StepIntroductionFeature />
      </JobContainerCreateContext.Provider>
    )
    expect(baseElement).toBeTruthy()
  })
})
