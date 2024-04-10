import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { AnnotationSetting } from './annotation-setting'

jest.mock('../hooks/use-git-tokens/use-git-tokens', () => {
  return {
    ...jest.requireActual('../hooks/use-git-tokens/use-git-tokens'),
    useGitTokens: () => ({
      data: [
        {
          id: '0000-1111-2222',
          created_at: '',
          name: 'my-token',
          type: 'GITHUB',
        },
      ],
    }),
  }
})

describe('AnnotationSetting', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<AnnotationSetting />))
    expect(baseElement).toMatchSnapshot()
  })
})
