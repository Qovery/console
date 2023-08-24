import { act, fireEvent, getAllByRole, getByTestId, render } from '__tests__/utils/setup-jest'
import * as storeOrganization from '@qovery/domains/organization'
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
    const { baseElement } = render(<CrudModalFeature {...props} />)
    await act(() => {
      expect(baseElement).toBeTruthy()
    })
  })

  it('should render 2 inputs', async () => {
    const { baseElement } = render(<CrudModalFeature {...props} />)
    expect(getAllByRole(baseElement, 'textbox')).toHaveLength(2)
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
    const { baseElement } = render(<CrudModalFeature {...props} />)
    const inputs = getAllByRole(baseElement, 'textbox')

    await act(() => {
      fireEvent.change(inputs[0], { target: { value: 'test' } })
      fireEvent.change(inputs[1], { target: { value: 'description' } })
    })

    const button = getByTestId(baseElement, 'submit-button')

    expect(button).not.toBeDisabled()
    await act(() => {
      button.click()
    })

    expect(postApiTokenSpy).toHaveBeenCalledWith({
      organizationId: props.organizationId,
      token: {
        name: 'test',
        description: 'description',
      },
    })
  })
})
