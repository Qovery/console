import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { DatabaseCreateContext } from '../page-database-create-feature'
import StepSummaryFeature from './step-summary-feature'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1', projectId: '2', environmentId: '3' }),
  useNavigate: () => mockNavigate,
}))

const mockCreateService = jest.fn()

jest.mock('@qovery/domains/services/feature', () => ({
  useCreateService: () => ({
    mutateAsync: mockCreateService,
  }),
  useAddAnnotationsGroup: () => ({
    mutate: jest.fn(),
  }),
  useDeployService: () => ({
    mutate: jest.fn(),
  }),
}))

const mockSetResourcesData = jest.fn()
const ContextWrapper = (props: { children: ReactNode }) => {
  return (
    <DatabaseCreateContext.Provider
      value={{
        currentStep: 1,
        setCurrentStep: jest.fn(),
        generalData: {
          name: 'test',
          accessibility: DatabaseAccessibilityEnum.PRIVATE,
          version: '1',
          type: DatabaseTypeEnum.MYSQL,
          mode: DatabaseModeEnum.CONTAINER,
        },
        setGeneralData: jest.fn(),
        resourcesData: {
          storage: 1,
          cpu: 100000,
          memory: 100,
        },
        setResourcesData: mockSetResourcesData,
      }}
    >
      {props.children}
    </DatabaseCreateContext.Provider>
  )
}

describe('StepSummaryFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <ContextWrapper>
        <StepSummaryFeature />
      </ContextWrapper>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should post the request with expected form values', async () => {
    const { userEvent } = renderWithProviders(
      <ContextWrapper>
        <StepSummaryFeature />
      </ContextWrapper>
    )

    const button = screen.getByText('Create')
    await userEvent.click(button)

    expect(mockCreateService).toHaveBeenCalledWith({
      environmentId: '3',
      payload: {
        serviceType: 'DATABASE',
        accessibility: DatabaseAccessibilityEnum.PRIVATE,
        cpu: 100000,
        memory: 100,
        mode: DatabaseModeEnum.CONTAINER,
        name: 'test',
        storage: 1,
        type: DatabaseTypeEnum.MYSQL,
        version: '1',
        description: '',
        annotations_groups: [],
        labels_groups: [],
      },
    })
    expect(mockNavigate).toHaveBeenCalledWith('/organization/1/project/2/environment/3')
  })
})
