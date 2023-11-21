import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { SourceSetting } from './source-setting'

describe('SourceSetting', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<SourceSetting />))
    expect(baseElement).toMatchSnapshot()
  })
})
