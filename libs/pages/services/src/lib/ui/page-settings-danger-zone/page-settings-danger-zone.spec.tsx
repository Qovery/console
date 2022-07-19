import { render } from '@testing-library/react'

import PageSettingsDangerZone, { PageSettingsDangerZoneProps } from './page-settings-danger-zone'

const props: PageSettingsDangerZoneProps = {
  deleteEnvironment: jest.fn(),
}

describe('PageSettingsDangerZone', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsDangerZone {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
