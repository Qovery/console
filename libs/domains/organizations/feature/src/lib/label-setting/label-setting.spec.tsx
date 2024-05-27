import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { LabelSetting } from './label-setting'

jest.mock('../hooks/use-labels-groups/use-labels-groups', () => {
  return {
    ...jest.requireActual('../hooks/use-labels-groups/use-labels-groups'),
    useGitTokens: () => ({
      data: [
        {
          id: '0000-1111-2222',
          name: 'Label Group 1',
          labels: [
            { key: 'key1', value: 'value1', propagate_to_cloud_provider: false },
            { key: 'key2', value: 'value2', propagate_to_cloud_provider: true },
          ],
        },
      ],
    }),
  }
})

describe('LabelSetting', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<LabelSetting />))
    expect(baseElement).toMatchSnapshot()
  })
})
