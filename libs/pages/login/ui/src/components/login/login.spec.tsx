import { AuthEnum } from '@console/shared/auth'
import { render } from '__tests__/utils/setup-jest'

import Login, { ILoginProps } from './login'

describe('Login', () => {
  const props: ILoginProps = {
    onClickAuthLogin: (provider: string) => {
      return
    },
    githubType: AuthEnum.GITHUB,
    gitlabType: AuthEnum.GITLAB,
    bitbucketType: AuthEnum.BITBUCKET,
  }

  it('should render successfully', () => {
    const { baseElement } = render(<Login {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
