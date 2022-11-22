import { render } from '@testing-library/react'
import { applicationFactoryMock } from '@qovery/domains/application'
import { ApplicationButtonsActions, ApplicationButtonsActionsProps } from './application-buttons-actions'

const mockApplication = applicationFactoryMock(1)[0]
const props: ApplicationButtonsActionsProps = {
  application: mockApplication,
  environmentMode: 'development',
  buttonActionsDefault: [],
}

describe('ApplicationButtonsActions', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ApplicationButtonsActions {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
