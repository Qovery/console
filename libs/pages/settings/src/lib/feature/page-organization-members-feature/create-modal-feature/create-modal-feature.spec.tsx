import { act, fireEvent, render } from '@testing-library/react'
import { InviteMemberRoleEnum } from 'qovery-typescript-axios'
import * as storeOrganization from '@qovery/domains/organization'
import CreateModalFeature, { CreateModalFeatureProps } from './create-modal-feature'

import SpyInstance = jest.SpyInstance

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    postInviteMember: jest.fn(),
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
    availableRoles: [
      {
        id: '1111-1111-1111-1111',
        name: InviteMemberRoleEnum.ADMIN,
      },
      {
        id: '2222-2222-2222-2222',
        name: InviteMemberRoleEnum.VIEWER,
      },
    ],
    organizationId: '1',
  }

  it('should render successfully', async () => {
    const { baseElement } = render(<CreateModalFeature {...props} />)
    await act(() => {
      expect(baseElement).toBeTruthy()
    })
  })

  it('should dispatch postInviteMember if form is submitted', async () => {
    const postInviteMember: SpyInstance = jest.spyOn(storeOrganization, 'postInviteMember')

    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { getByTestId } = render(<CreateModalFeature {...props} />)

    await act(() => {
      const inputEmail = getByTestId('input-email')
      fireEvent.input(inputEmail, { target: { value: 'test@qovery.com' } })
    })

    await act(() => {
      getByTestId('submit-button').click()
    })

    expect(postInviteMember).toHaveBeenCalledWith({
      data: {
        email: 'test@qovery.com',
        role_id: '1111-1111-1111-1111',
      },
      organizationId: '1',
    })
  })
})
