import { render } from '@testing-library/react'
import PagesSettingsDomains from './pages-settings-domains'

describe('PagesSettingsDomains', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PagesSettingsDomains />)
    expect(baseElement).toBeTruthy()
  })
})
