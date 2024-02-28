import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import {
  ValuesOverrideArgumentsSetting,
  type ValuesOverrideArgumentsSettingProps,
} from './values-override-arguments-setting'

describe('ValuesOverrideArgumentsSetting', () => {
  const props: ValuesOverrideArgumentsSettingProps = {
    onSubmit: jest.fn(),
    methods: {
      handleSubmit: jest.fn(),
      watch: jest.fn(),
      getValues: jest.fn(),
      setValue: jest.fn(),
      register: jest.fn(),
      unregister: jest.fn(),
      formState: {
        errors: {},
        isDirty: false,
        isValid: false,
        isSubmitting: false,
        touched: {},
        submitCount: 0,
      },
    },
  }

  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<ValuesOverrideArgumentsSetting {...props} />, {
        defaultValues: {
          arguments: [
            {
              key: 'test',
              type: '--set',
              value: 'test',
            },
            {
              key: 'test2',
              type: '--set-json',
              value: 'test',
              json: '{"test": "test"}',
            },
            {
              key: 'test3',
              type: '--set-string',
              value: 'test',
              json: 'test',
            },
          ],
        },
      })
    )
    expect(baseElement).toMatchSnapshot()
  })
})
