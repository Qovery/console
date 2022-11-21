import { render } from '__tests__/utils/setup-jest'
import { applicationFactoryMock } from '@qovery/domains/application'
import {
  ApplicationButtonsActionsFeature,
  ApplicationButtonsActionsFeatureProps,
} from './application-buttons-actions-feature'

const mockApplication = applicationFactoryMock(1)[0]
const props: ApplicationButtonsActionsFeatureProps = {
  inHeader: false,
  application: mockApplication,
  environmentMode: 'development',
}

describe('ApplicationButtonsActionsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ApplicationButtonsActionsFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
