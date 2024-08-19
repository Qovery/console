import { useForm } from 'react-hook-form'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { type FlowVariableData } from '@qovery/shared/interfaces'
import { renderHook, renderWithProviders } from '@qovery/shared/util-tests'
import { ApplicationContainerCreateContext } from '../page-application-create-feature'
import { StepVariableFeature } from './step-variable-feature'

describe('StepVariableFeature', () => {
  const { result: variablesForm } = renderHook(() =>
    useForm<FlowVariableData>({
      mode: 'onChange',
      defaultValues: {
        variables: [
          {
            variable: 'test',
            value: 'test',
            scope: 'PROJECT',
          },
        ],
      },
    })
  )
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <ApplicationContainerCreateContext.Provider
        value={{
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
                protocol: 'HTTP',
                name: 'p3000',
                application_port: 3000,
                external_port: 3000,
                is_public: false,
              },
            ],
          },
          variablesForm: variablesForm.current,
        }}
      >
        <StepVariableFeature />
      </ApplicationContainerCreateContext.Provider>
    )
    expect(baseElement).toBeTruthy()
  })
})
