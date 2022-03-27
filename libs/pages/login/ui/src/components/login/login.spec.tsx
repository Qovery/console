import { AuthEnum } from '@console/shared/utils'
import { render } from '__tests__/utils/setup-jest'

import Login, { ILoginProps } from './login'

describe('Login', () => {
  const props: ILoginProps = {
    authLogin: (provider: string) => {
      return
    },
    githubType: AuthEnum.GITHUB,
    gitlabType: AuthEnum.GITLAB,
    bitbucketType: AuthEnum.BITBUCKET,
  }

  it('should render successfully', () => {
    const { baseElement } = render(<Login authLogin={props.authLogin} />)
    expect(baseElement).toBeTruthy()
  })
})
