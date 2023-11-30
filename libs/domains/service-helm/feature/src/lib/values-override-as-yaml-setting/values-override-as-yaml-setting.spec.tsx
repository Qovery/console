import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { ValuesOverrideAsYamlSetting } from './values-override-as-yaml-setting'

describe('ValuesOverrideAsYamlSetting', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<ValuesOverrideAsYamlSetting />))
    expect(baseElement).toMatchSnapshot()
  })
})
