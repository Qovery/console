import posthog from 'posthog-js'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { EnableObservabilityButtonContactUs } from './enable-observability-modal'

jest.mock('posthog-js', () => ({
  capture: jest.fn(),
}))

const mockShowPylonForm = jest.fn()

jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useSupportChat: () => ({ showPylonForm: mockShowPylonForm }),
}))

describe('EnableObservabilityButtonContactUs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should capture the click event with its source and open the Pylon form', async () => {
    const callback = jest.fn()
    const { userEvent } = renderWithProviders(
      <EnableObservabilityButtonContactUs source="logs-placeholder" callback={callback} />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Contact us' }))

    expect(callback).toHaveBeenCalledTimes(1)
    expect(posthog.capture).toHaveBeenCalledWith('observe-contact-us-clicked', { source: 'logs-placeholder' })
    expect(mockShowPylonForm).toHaveBeenCalledWith('request-access-observability')
  })
})
