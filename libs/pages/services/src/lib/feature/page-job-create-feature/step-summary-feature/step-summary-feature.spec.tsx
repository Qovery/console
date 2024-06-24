import { ServiceTypeEnum } from '@qovery/shared/enums'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { JobContainerCreateContext } from '../page-job-create-feature'
import StepSummaryFeature from './step-summary-feature'

describe('PostFeature', () => {
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
          dockerfileForm: {
            getValues: jest.fn(),
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
        <StepSummaryFeature />
      </JobContainerCreateContext.Provider>
    )
    expect(baseElement).toBeTruthy()
  })
})
