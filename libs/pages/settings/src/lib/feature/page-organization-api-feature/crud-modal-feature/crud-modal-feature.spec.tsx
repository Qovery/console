import * as storeOrganization from '@qovery/domains/organization'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { CrudModalFeature, type CrudModalFeatureProps } from './crud-modal-feature'

import SpyInstance = jest.SpyInstance

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

describe('CrudModalFeature', () => {
  const props: CrudModalFeatureProps = {
    onClose: jest.fn(),
    organizationId: '1',
  }

  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(<CrudModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render 2 inputs', async () => {
    renderWithProviders(<CrudModalFeature {...props} />)
    expect(screen.getAllByRole('textbox')).toHaveLength(2)
  })

  it('should render submit and call good api endpoint', async () => {
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          results: {
            data: {},
          },
        }),
    }))

    const postApiTokenSpy: SpyInstance = jest.spyOn(storeOrganization, 'postApiToken')
    const { userEvent } = renderWithProviders(<CrudModalFeature {...props} />)
    const inputs = screen.getAllByRole('textbox')

    await userEvent.type(inputs[0], 'test')
    await userEvent.type(inputs[1], 'description')

    const button = screen.getByTestId('submit-button')

    expect(button).not.toBeDisabled()
    await userEvent.click(button)

    expect(postApiTokenSpy).toHaveBeenCalledWith({
      organizationId: props.organizationId,
      token: {
        name: 'test',
        description: 'description',
      },
    })
  })
})
