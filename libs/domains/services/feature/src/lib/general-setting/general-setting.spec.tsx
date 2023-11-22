import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { GeneralSetting } from './general-setting'

describe('GeneralSetting', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<GeneralSetting source="GIT" />))
    expect(baseElement).toMatchSnapshot()
  })
})
