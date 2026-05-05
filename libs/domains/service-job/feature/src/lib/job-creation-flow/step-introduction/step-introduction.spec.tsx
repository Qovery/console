import { ServiceTypeEnum } from '@qovery/shared/enums'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { JobCreateContext } from '../job-creation-flow'
import { StepIntroduction } from './step-introduction'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'proj-1',
    environmentId: 'env-1',
  }),
}))

describe('StepIntroduction', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <JobCreateContext.Provider
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
        <StepIntroduction />
      </JobCreateContext.Provider>
    )
    expect(baseElement).toBeTruthy()
  })
})
