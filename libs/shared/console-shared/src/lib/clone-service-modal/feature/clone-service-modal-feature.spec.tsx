import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '__tests__/utils/setup-jest'
import { act } from 'react-dom/test-utils'
import selectEvent from 'react-select-event'
import * as applicationDomains from '@qovery/domains/application'
import { applicationFactoryMock, environmentFactoryMock } from '@qovery/shared/factories'
import CloneServiceModalFeature, { CloneServiceModalFeatureProps } from './clone-service-modal-feature'

let props: CloneServiceModalFeatureProps

const useCloneServiceMockSpy = jest.spyOn(applicationDomains, 'useCloneService') as jest.Mock

const mockEnvironments = environmentFactoryMock(3)

jest.mock('@qovery/domains/environment', () => ({
  ...jest.requireActual('@qovery/domains/organization'),
  useFetchEnvironments: () => ({ data: mockEnvironments, isLoading: false }),
}))

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: () => ({ projectId: '1', organizationId: '0' }),
}))

const serviceToClone = applicationFactoryMock(1)[0]

describe('CloneServiceModalFeature', () => {
  beforeEach(() => {
    props = {
      onClose: jest.fn(),
      serviceToClone,
      organizationId: '0',
      projectId: '1',
      environmentId: '1',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<CloneServiceModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should submit form on click on button', async () => {
    useCloneServiceMockSpy.mockReturnValue({
      mutateAsync: jest.fn(async () => ({
        id: 1,
      })),
    })

    render(<CloneServiceModalFeature {...props} />)

    const input = screen.getByRole('textbox', { name: /new service name/i })
    await userEvent.clear(input)
    await userEvent.type(input, 'test')

    await act(() => {
      selectEvent.select(screen.getByLabelText(/environment/i), mockEnvironments[2].name, {
        container: document.body,
      })
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
  })
})
