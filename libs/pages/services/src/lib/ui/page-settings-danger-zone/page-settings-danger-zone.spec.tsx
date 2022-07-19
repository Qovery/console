import { render } from '@testing-library/react'

import PageSettingsDangerZone from './page-settings-danger-zone'

describe('PageSettingsDangerZone', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsDangerZone />)
    expect(baseElement).toBeTruthy()
  })
})
