import { render } from '@testing-library/react'
import PageSettingsHealthchecks from './page-settings-healthchecks'

describe('PageSettingsHealthchecks', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsHealthchecks />)
    expect(baseElement).toBeTruthy()
  })
})
