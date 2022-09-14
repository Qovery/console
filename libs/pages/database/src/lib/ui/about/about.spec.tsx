import { render } from '@testing-library/react'
import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { LoadingStatus } from '@qovery/shared/interfaces'
import About from './about'

describe('About', () => {
  const props = {
    description: 'Some Desc',
    type: DatabaseTypeEnum.POSTGRESQL,
    version: '10.3',
    mode: DatabaseModeEnum.CONTAINER,
    accessibility: DatabaseAccessibilityEnum.PUBLIC,
    credentials: {
      login: 'someUser',
      password: 'somePassword',
    },
    loadingStatus: 'loaded' as LoadingStatus,
  }
  it('should render successfully', () => {
    const { baseElement } = render(<About {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
