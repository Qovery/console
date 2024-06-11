import { findByLabelText, findByTestId, render, waitFor } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { StorageTypeEnum } from 'qovery-typescript-axios'
import StorageModal, { type StorageModalProps } from './storage-modal'

const props: StorageModalProps = {
  onClose: jest.fn(),
  loading: false,
  onSubmit: jest.fn((e) => e.preventDefault()),
  isEdit: false,
}

describe('StorageModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<StorageModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form', async () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<StorageModal {...props} />, {
        defaultValues: { size: '54', type: 'FAST_SSD', mount_point: '/test' },
      })
    )

    const sizeInput = await findByLabelText(baseElement, 'Size in GiB')
    const pathInput = await findByLabelText(baseElement, 'Mounting Path')
    findByLabelText(baseElement, 'Type')

    expect(sizeInput).toHaveValue(54)
    expect(pathInput).toHaveValue('/test')
  })

  it('should submit the form', async () => {
    const spy = jest.fn((e) => e.preventDefault())
    props.onSubmit = spy
    const { baseElement } = render(
      wrapWithReactHookForm(<StorageModal {...props} />, {
        defaultValues: { size: 54, type: StorageTypeEnum.FAST_SSD, mount_point: '/test' },
      })
    )

    const button = await findByTestId(baseElement, 'submit-button')

    await waitFor(() => {
      button.click()
      expect(button).toBeEnabled()
      expect(spy).toHaveBeenCalled()
    })
  })
})
