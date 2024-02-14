import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import * as clustersDomain from '@qovery/domains/clusters/feature'
import { clusterFactoryMock, environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useCloneEnvironment from '../hooks/use-clone-environment/use-clone-environment'
import * as useCreateEnvironment from '../hooks/use-create-environment/use-create-environment'
import CreateCloneEnvironmentModal, { type CreateCloneEnvironmentModalProps } from './create-clone-environment-modal'

let props: CreateCloneEnvironmentModalProps

const useClustersMockSpy = jest.spyOn(clustersDomain, 'useClusters') as jest.Mock
const useCloneEnvironmentMockSpy = jest.spyOn(useCloneEnvironment, 'useCloneEnvironment') as jest.Mock
const useCreateEnvironmentMockSpy = jest.spyOn(useCreateEnvironment, 'useCreateEnvironment') as jest.Mock

const mockClusters = clusterFactoryMock(3, 'AWS')

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ projectId: '1', organizationId: '0' }),
}))

describe('CreateCloneEnvironmentModal', () => {
  beforeEach(() => {
    props = {
      onClose: jest.fn(),
      environmentToClone: undefined,
      organizationId: '0',
      projectId: '1',
    }

    useClustersMockSpy.mockReturnValue({
      data: mockClusters,
    })
    useCloneEnvironmentMockSpy.mockReturnValue({
      mutateAsync: jest.fn(() => Promise.resolve({ id: '1' })),
    })
    useCreateEnvironmentMockSpy.mockReturnValue({
      mutateAsync: jest.fn(() => Promise.resolve({ id: '1' })),
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<CreateCloneEnvironmentModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshots', () => {
    const { baseElement } = renderWithProviders(<CreateCloneEnvironmentModal {...props} />)
    expect(baseElement).toMatchSnapshot()
  })

  describe('creation mode', function () {
    it('should submit form on click on button', async () => {
      const { userEvent } = renderWithProviders(<CreateCloneEnvironmentModal {...props} />)

      const input = screen.getByTestId('input-text')

      await userEvent.type(input, 'test')

      await selectEvent.select(screen.getByLabelText('Cluster'), `${mockClusters[2].name} - Managed (EKS)`, {
        container: document.body,
      })

      await selectEvent.select(screen.getByLabelText('Type'), 'Staging', { container: document.body })

      const submitButton = screen.getByTestId('submit-button')
      await userEvent.click(submitButton)

      expect(useCreateEnvironmentMockSpy().mutateAsync).toHaveBeenCalledWith({
        projectId: '1',
        payload: {
          cluster: mockClusters[2].id,
          mode: EnvironmentModeEnum.STAGING,
          name: 'test',
        },
      })
    })
  })

  describe('cloning mode', function () {
    it('should submit form on click on button', async () => {
      const mockEnv = environmentFactoryMock(1)[0]
      const { userEvent } = renderWithProviders(<CreateCloneEnvironmentModal {...props} environmentToClone={mockEnv} />)

      const inputs = screen.getAllByTestId('input-text')

      await userEvent.clear(inputs[1])
      await userEvent.type(inputs[1], 'test')

      await selectEvent.select(screen.getByLabelText('Cluster'), `${mockClusters[2].name} - Managed (EKS)`, {
        container: document.body,
      })

      await selectEvent.select(screen.getByLabelText('Type'), 'Staging', { container: document.body })

      const submitButton = screen.getByTestId('submit-button')
      await userEvent.click(submitButton)

      expect(useCloneEnvironmentMockSpy().mutateAsync).toHaveBeenCalledWith({
        environmentId: mockEnv.id,
        payload: {
          cluster_id: mockClusters[2].id,
          mode: EnvironmentModeEnum.STAGING,
          name: 'test',
        },
      })
    })
  })
})
