import { render } from '@testing-library/react'
import PageSettingsPorts from './page-settings-ports'

describe('PageSettingsPorts', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsPorts />)
    expect(baseElement).toBeTruthy()
  })
})
