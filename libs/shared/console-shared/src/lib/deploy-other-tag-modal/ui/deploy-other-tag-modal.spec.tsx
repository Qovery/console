import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import DeployOtherTagModal from './deploy-other-tag-modal'

describe('DeployOtherTagModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<{ tag: string }>(
        <DeployOtherTagModal isLoading={false} onSubmit={jest.fn()} serviceName="My Job Container" />,
        { defaultValues: { tag: 'v3' } }
      )
    )
    expect(baseElement).toBeTruthy()
  })
})
