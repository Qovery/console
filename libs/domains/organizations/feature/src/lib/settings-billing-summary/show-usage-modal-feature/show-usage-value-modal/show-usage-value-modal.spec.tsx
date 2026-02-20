import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ShowUsageValueModal, type ShowUsageValueModalProps } from './show-usage-value-modal'

const props: ShowUsageValueModalProps = {
  onClose: jest.fn(),
  url: 'http://example.com',
  url_expires_in_hours: 1,
}

describe('ShowUsageValueModal', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ShowUsageValueModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render copy paste widget', () => {
    renderWithProviders(<ShowUsageValueModal {...props} />)
    screen.getByTestId('copy-container')
  })

  it('should render token value', () => {
    renderWithProviders(<ShowUsageValueModal {...props} />)
    screen.getByDisplayValue(props.url)
  })

  it('should display the expiration time', () => {
    renderWithProviders(<ShowUsageValueModal {...props} />)
    screen.getByText((content) =>
      content.replace(/\s+/g, ' ').includes(`This link expires in ${props.url_expires_in_hours} hours.`)
    )
  })
})
