import { useForm } from 'react-hook-form'
import { type DockerfileSettingsData } from '@qovery/domains/services/feature'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { renderHook, renderWithProviders } from '@qovery/shared/util-tests'
import { JobContainerCreateContext } from '../page-job-create-feature'
import { StepDockerfileFeature } from './step-dockerfile-feature'

describe('DockerfileSettings', () => {
  it('should match snapshot', () => {
    const { result } = renderHook(() =>
      useForm<DockerfileSettingsData>({
        mode: 'onChange',
        defaultValues: {
          dockerfile_source: 'DOCKERFILE_RAW',
          dockerfile_path: null,
          dockerfile_raw: 'my custom content',
        },
      })
    )

    const { baseElement } = renderWithProviders(
      <JobContainerCreateContext.Provider
        value={{
          currentStep: 1,
          setCurrentStep: jest.fn(),
          generalData: {
            name: 'test',
            serviceType: ServiceTypeEnum.JOB,
            description: 'Job Description',
            auto_deploy: false,
          },
          setGeneralData: jest.fn(),
          dockerfileForm: result.current,
          resourcesData: undefined,
          setResourcesData: jest.fn(),
          jobType: ServiceTypeEnum.LIFECYCLE_JOB,
          jobURL: '#',
          variableData: undefined,
          setVariableData: jest.fn(),
        }}
      >
        <StepDockerfileFeature />
      </JobContainerCreateContext.Provider>
    )
    expect(baseElement).toMatchSnapshot()
  })
})
