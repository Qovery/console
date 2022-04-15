import { render } from '@testing-library/react'

import PagesSettingsUi from './pages-settings-ui'

describe('PagesSettingsUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PagesSettingsUi />)
    expect(baseElement).toBeTruthy()
  })
})
