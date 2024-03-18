import selectEvent from 'react-select-event'
import { environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as servicesDomains from '../hooks/use-clone-service/use-clone-service'
import ServiceCloneModal, { type ServiceCloneModalProps } from './service-clone-modal'

const useCloneServiceMockSpy = jest.spyOn(servicesDomains, 'useCloneService') as jest.Mock
const mockNavigate = jest.fn()
const mockEnvironments = environmentFactoryMock(3)

jest.mock('../hooks/use-service/use-service', () => ({
  ...jest.requireActual('../hooks/use-service/use-service'),
  useService: () => ({
    data: {
      id: '1',
      serviceType: 'APPLICATION',
      name: 'my-service',
    },
  }),
}))

jest.mock('../hooks/use-environments/use-environments', () => ({
  ...jest.requireActual('../hooks/use-environments/use-environments'),
  useEnvironments: () => ({ data: mockEnvironments, isLoading: false }),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const props: ServiceCloneModalProps = {
  onClose: jest.fn(),
  serviceId: '1',
  organizationId: '0',
  projectId: '1',
}

describe('ServiceCloneModal', () => {
  it('should match snapshot', async () => {
    const { container } = renderWithProviders(<ServiceCloneModal {...props} />)
    expect(container).toMatchSnapshot()
  })

  it('should submit form on click on button', async () => {
    useCloneServiceMockSpy.mockReturnValue({
      mutateAsync: jest.fn(async () => ({
        id: 1,
      })),
    })

    const { userEvent } = renderWithProviders(<ServiceCloneModal {...props} />)

    const input = screen.getByRole('textbox', { name: /new service name/i })
    await userEvent.clear(input)
    await userEvent.type(input, 'test')

    await selectEvent.select(screen.getByLabelText(/environment/i), mockEnvironments[2].name, {
      container: document.body,
    })

    const submitButton = screen.getByRole('button', { name: /clone/i })
    await userEvent.click(submitButton)

    expect(useCloneServiceMockSpy().mutateAsync).toHaveBeenCalledWith({
      serviceId: '1',
      serviceType: 'APPLICATION',
      payload: {
        environment_id: mockEnvironments[2].id,
        name: 'test',
      },
    })
    expect(mockNavigate).toHaveBeenCalledWith(
      '/organization/0/project/1/environment/2951580907208704/application/1/general'
    )
  })
})
