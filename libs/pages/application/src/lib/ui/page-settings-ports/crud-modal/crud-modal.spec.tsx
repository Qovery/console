import { act, findByTestId, getByDisplayValue, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CustomDomainStatusEnum } from 'qovery-typescript-axios'
import CrudModal, { CrudModalProps } from './crud-modal'

const props: CrudModalProps = {
  loading: false,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
  customDomain: {
    id: 'ae20a043-12d3-4e46-89f3-a665f3e486fe',
    created_at: '2022-08-10T14:55:21.382761Z',
    updated_at: '2022-08-10T14:55:21.382762Z',
    domain: 'test.qovery.com',
    validation_domain: 'test.qovery.com.zc531a994.rustrocks.cloud',
    status: CustomDomainStatusEnum.VALIDATION_PENDING,
  },
}

describe('CrudModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<CrudModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form', async () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: { domain: 'test.qovery.com' },
      })
    )
    await act(() => {
      getByDisplayValue(baseElement, 'test.qovery.com')
    })
  })

  it('should submit the form', async () => {
    const spy = jest.fn().mockImplementation((e) => e.preventDefault())
    props.onSubmit = spy
    const { baseElement } = render(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: { domain: 'test.qovery.com' },
      })
    )

    const button = await findByTestId(baseElement, 'submit-button')

    await waitFor(() => {
      button.click()
      expect(button).not.toBeDisabled()
      expect(spy).toHaveBeenCalled()
    })
  })
})
