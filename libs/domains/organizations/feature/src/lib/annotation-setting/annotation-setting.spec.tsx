import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { AnnotationSetting } from './annotation-setting'

jest.mock('../hooks/use-annotations-groups/use-annotations-groups', () => {
  return {
    ...jest.requireActual('../hooks/use-annotations-groups/use-annotations-groups'),
    useAnnotationsGroups: () => ({
      data: [
        {
          id: '0000-1111-2222',
          name: 'Annotation Group 1',
          annotations: [
            { key: 'key1', value: 'value1' },
            { key: 'key2', value: 'value2' },
          ],
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
