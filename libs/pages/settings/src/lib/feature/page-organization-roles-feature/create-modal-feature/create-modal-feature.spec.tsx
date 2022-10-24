import { act, fireEvent } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import * as storeOrganization from '@qovery/domains/organization'
import CreateModalFeature, { CreateModalFeatureProps } from './create-modal-feature'

import SpyInstance = jest.SpyInstance

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    postCustomRoles: jest.fn(),
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

describe('CreateModalFeature', () => {
  const props: CreateModalFeatureProps = {
    onClose: jest.fn(),
    organizationId: '1',
  }

  it('should render successfully', async () => {
    const { baseElement } = render(<CreateModalFeature {...props} />)
    await act(() => {
      expect(baseElement).toBeTruthy()
    })
  })

  it('should dispatch postCustomRoles if form is submitted', async () => {
    const postCustomRoles: SpyInstance = jest.spyOn(storeOrganization, 'postCustomRoles')

    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { getByTestId } = render(<CreateModalFeature {...props} />)

    await act(() => {
      const inputName = getByTestId('input-name')
      fireEvent.input(inputName, { target: { value: 'my-role' } })

      expect(getByTestId('input-description')).toBeInTheDocument()
    })

    expect(getByTestId('submit-button')).not.toBeDisabled()

    await act(() => {
      getByTestId('submit-button').click()
    })

    expect(postCustomRoles).toHaveBeenCalledWith({
      data: {
        name: 'my-role',
      },
      organizationId: '1',
    })
  })
})
