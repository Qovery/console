import { render } from '@testing-library/react'
import PageSettingsGeneral, { PageSettingsGeneralProps } from './page-settings-general'

describe('PageSettingsGeneral', () => {
  const props: PageSettingsGeneralProps = {
    onSubmit: jest.fn(),
  }

  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsGeneral {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
