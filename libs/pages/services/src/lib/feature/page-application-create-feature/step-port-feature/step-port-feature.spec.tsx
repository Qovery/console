import { PortProtocolEnum } from 'qovery-typescript-axios'
import { useForm } from 'react-hook-form'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { type FlowVariableData } from '@qovery/shared/interfaces'
import { renderHook, renderWithProviders } from '@qovery/shared/util-tests'
import { ApplicationContainerCreateContext } from '../page-application-create-feature'
import StepPortFeature from './step-port-feature'

const context = {
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
        protocol: PortProtocolEnum.HTTP,
        name: 'p3000',
        application_port: 3000,
        external_port: 3000,
        is_public: false,
      },
    ],
  },
}

describe('PageApplicationCreatePortFeature', () => {
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
          ...context,
          variablesForm: variablesForm.current,
        }}
      >
        <StepPortFeature />
      </ApplicationContainerCreateContext.Provider>
    )
    expect(baseElement).toBeTruthy()
  })
})
