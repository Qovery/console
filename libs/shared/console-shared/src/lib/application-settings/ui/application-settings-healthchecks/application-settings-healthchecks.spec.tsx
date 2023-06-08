import { render } from '@testing-library/react'
import ApplicationSettingsHealthchecks from './application-settings-healthchecks'

describe('ApplicationSettingsHealthchecks', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ApplicationSettingsHealthchecks />)
    expect(baseElement).toBeTruthy()
  })
})
