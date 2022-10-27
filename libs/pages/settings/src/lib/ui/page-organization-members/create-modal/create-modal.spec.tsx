import { act, fireEvent, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { InviteMemberRoleEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import CreateModal, { CreateModalProps } from './create-modal'

const props: CreateModalProps = {
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
  loading: false,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
}

describe('CreateModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<CreateModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form', async () => {
    const { getByDisplayValue, getAllByDisplayValue } = render(
      wrapWithReactHookForm(<CreateModal {...props} />, {
        defaultValues: {
          email: 'test@qovery.com',
          role_id: '1111-1111-1111-1111',
        },
      })
    )

    await act(() => {
      getByDisplayValue('test@qovery.com')
      getAllByDisplayValue('1111-1111-1111-1111')
    })
  })

  it('should submit the form', async () => {
    const spy = jest.fn().mockImplementation((e) => e.preventDefault())
    props.onSubmit = spy
    const { getByTestId } = render(
      wrapWithReactHookForm(<CreateModal {...props} />, {
        defaultValues: {
          email: 'test@qovery.com',
          role_id: '1111-1111-1111-1111',
        },
      })
    )

    await act(() => {
      const inputEmail = getByTestId('input-email')
      fireEvent.input(inputEmail, { target: { value: 'test-2@qovery.com' } })
      selectEvent.select(getByTestId('input-role'), '2222-2222-2222-2222', { container: document.body })
    })

    const button = getByTestId('submit-button')

    await waitFor(() => {
      button.click()
      expect(button).not.toBeDisabled()
      expect(spy).toHaveBeenCalled()
    })
  })
})
