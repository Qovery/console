import { getAllByTestId, queryAllByTestId, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { lifecycleJobFactoryMock } from '@qovery/shared/factories'
import ForceRunModal, { type ForceRunModalProps } from './force-run-modal'

const props: ForceRunModalProps = {
  service: lifecycleJobFactoryMock(1)[0],
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
  isCronJob: false,
}

describe('ForceRunModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<{ selected: string }>(<ForceRunModal {...props} />, {
        defaultValues: { selected: 'start' },
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render 3 radios boxes if job is lifecycle', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<{ selected: string }>(<ForceRunModal {...props} />, {
        defaultValues: { selected: 'start' },
      })
    )
    expect(getAllByTestId(baseElement, 'input-radio-box')).toHaveLength(3)
  })

  it('should render 0 radios boxes if job is cron', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<{ selected: string }>(<ForceRunModal {...props} isCronJob={true} />, {
        defaultValues: { selected: 'start' },
      })
    )
    expect(queryAllByTestId(baseElement, 'input-radio-box')).toHaveLength(0)
  })
})
