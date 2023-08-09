import selectEvent from 'react-select-event'
import * as servicesDomains from '@qovery/domains/services'
import { applicationFactoryMock, environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CloneServiceModalFeature, { CloneServiceModalFeatureProps } from './clone-service-modal-feature'

let props: CloneServiceModalFeatureProps

const useCloneServiceMockSpy = jest.spyOn(servicesDomains, 'useCloneService') as jest.Mock

const mockEnvironments = environmentFactoryMock(3)
const mockNavigate = jest.fn()

jest.mock('@qovery/domains/environment', () => ({
  ...jest.requireActual('@qovery/domains/organization'),
  useFetchEnvironments: () => ({ data: mockEnvironments, isLoading: false }),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ projectId: '1', organizationId: '0' }),
  useNavigate: () => mockNavigate,
}))

const serviceToClone = applicationFactoryMock(1)[0]

describe('CloneServiceModalFeature', () => {
  beforeEach(() => {
    props = {
      onClose: jest.fn(),
      serviceToClone,
      organizationId: '0',
      projectId: '1',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<CloneServiceModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should submit form on click on button', async () => {
    useCloneServiceMockSpy.mockReturnValue({
      mutateAsync: jest.fn(async () => ({
        id: 1,
      })),
    })

    const { userEvent } = renderWithProviders(<CloneServiceModalFeature {...props} />)

    const input = screen.getByRole('textbox', { name: /new service name/i })
    await userEvent.clear(input)
    await userEvent.type(input, 'test')

    await selectEvent.select(screen.getByLabelText(/environment/i), mockEnvironments[2].name, {
      container: document.body,
    })

    const submitButton = screen.getByRole('button', { name: /clone/i })
    await userEvent.click(submitButton)

    expect(useCloneServiceMockSpy().mutateAsync).toHaveBeenCalledWith({
      serviceId: serviceToClone.id,
      serviceType: 'APPLICATION',
      cloneRequest: {
        environment_id: mockEnvironments[2].id,
        name: 'test',
      },
    })
    expect(mockNavigate).toHaveBeenCalledWith(
      '/organization/0/project/1/environment/2951580907208704/application/1/general'
    )
  })
})
