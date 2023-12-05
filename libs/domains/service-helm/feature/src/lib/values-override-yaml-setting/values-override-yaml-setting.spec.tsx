import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { ValuesOverrideYamlSetting } from './values-override-yaml-setting'

describe('ValuesOverrideAsYamlSetting', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<ValuesOverrideYamlSetting />))
    expect(baseElement).toMatchSnapshot()
  })
})
