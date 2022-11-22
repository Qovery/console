import { getByTestId, render } from '@testing-library/react'
import { databaseFactoryMock } from '@qovery/domains/database'
import DatabaseButtonsActions, { DatabaseButtonsActionsProps } from './database-buttons-actions'

const mockDatabase = databaseFactoryMock(1)[0]
const props: DatabaseButtonsActionsProps = {
  database: mockDatabase,
  environmentMode: 'development',
  inHeader: false,
}

describe('DatabaseButtonsActions', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DatabaseButtonsActions {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render with a bigger height in header', () => {
    const { baseElement } = render(<DatabaseButtonsActions {...props} inHeader={true} />)

    expect(getByTestId(baseElement, 'button-icon-action').classList).toContain('!h-8')
  })
})
