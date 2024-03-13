import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ShowUsageValueModal, type ShowUsageValueModalProps } from './show-usage-value-modal'

const props: ShowUsageValueModalProps = {
  onClose: jest.fn(),
  url: 'http://example.com',
  url_expires_in_hours: 1,
}

describe('ShowUsageValueModal', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<ShowUsageValueModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render copy paste widget', () => {
    renderWithProviders(wrapWithReactHookForm(<ShowUsageValueModal {...props} />))
    screen.getByTestId('copy-container')
  })

  it('should render token value', () => {
    renderWithProviders(wrapWithReactHookForm(<ShowUsageValueModal {...props} />))
    screen.getByDisplayValue(props.url)
  })
})
