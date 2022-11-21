import { render } from '__tests__/utils/setup-jest'
import { environmentFactoryMock } from '@qovery/domains/environment'
import EnvironmentButtonsActions, { EnvironmentButtonsActionsProps } from './environment-buttons-actions'

const mockEnvironment = environmentFactoryMock(1)[0]

const props: EnvironmentButtonsActionsProps = {
  environment: mockEnvironment,
  hasServices: true,
}

describe('EnvironmentButtonsActions', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EnvironmentButtonsActions {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
