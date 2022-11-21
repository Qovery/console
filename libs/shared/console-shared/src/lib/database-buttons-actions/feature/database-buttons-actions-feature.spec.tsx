import { render } from '__tests__/utils/setup-jest'
import { databaseFactoryMock } from '@qovery/domains/database'
import DatabaseButtonsActionsFeature, { DatabaseButtonsActionsFeatureProps } from './database-buttons-actions-feature'

const mockDatabase = databaseFactoryMock(1)[0]
const props: DatabaseButtonsActionsFeatureProps = {
  database: mockDatabase,
  environmentMode: 'development',
  inHeader: false,
}

describe('DatabaseButtonsActionsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DatabaseButtonsActionsFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
