import { useNavigate } from 'react-router-dom'
import selectEvent from 'react-select-event'
import { environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useCloneService } from '../hooks/use-clone-service/use-clone-service'
import ServiceCloneModal, { type ServiceCloneModalProps } from './service-clone-modal'

const mockEnvironments = environmentFactoryMock(3)

jest.mock('../hooks/use-clone-service/use-clone-service', () => {
  const mock = {
    // https://github.com/jestjs/jest/issues/10894
    mutateAsync: jest.fn(),
  }
  return {
    ...jest.requireActual('../hooks/use-clone-service/use-clone-service'),
    useCloneService: () => mock,
  }
})

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

jest.mock('react-router-dom', () => {
  const navigate = jest.fn()
  return {
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => navigate,
  }
})

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
    // https://github.com/jestjs/jest/issues/10894
    useCloneService().mutateAsync = jest.fn().mockResolvedValue({ id: 1 })

    const { userEvent } = renderWithProviders(<ServiceCloneModal {...props} />)

    const input = screen.getByRole('textbox', { name: /new service name/i })
    await userEvent.clear(input)
    await userEvent.type(input, 'test')

    await selectEvent.select(screen.getByLabelText(/environment/i), mockEnvironments[2].name, {
      container: document.body,
    })

    const submitButton = screen.getByRole('button', { name: /clone/i })
    await userEvent.click(submitButton)

    expect(useCloneService().mutateAsync).toHaveBeenCalledWith({
      serviceId: '1',
      serviceType: 'APPLICATION',
      payload: {
        environment_id: mockEnvironments[2].id,
        name: 'test',
      },
    })
    expect(useNavigate()).toHaveBeenCalledWith(
      '/organization/0/project/1/environment/2951580907208704/application/1/general'
    )
  })
})
