import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { ValuesOverrideFilesSetting, type ValuesOverrideFilesSettingProps } from './values-override-files-setting'

describe('ValuesOverrideFilesSetting', () => {
  const props: ValuesOverrideFilesSettingProps = {
    type: 'NONE',
    source: {
      git_repository: {
        url: 'github.com',
        branch: 'main',
        root_path: 'root',
        git_token_id: 'token',
      },
    },
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
    watchFieldType: 'NONE',
    gitRepositorySettings: <div>git repository dom</div>,
  }

  it('should match snapshot with NONE type', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<ValuesOverrideFilesSetting {...props} />))
    expect(baseElement).toMatchSnapshot()
  })

  it('should match snapshot with YAML type', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<ValuesOverrideFilesSetting {...props} watchFieldType="YAML" />)
    )
    expect(baseElement).toMatchSnapshot()
  })

  it('should match snapshot with GIT_REPOSITORY type', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<ValuesOverrideFilesSetting {...props} watchFieldType="GIT_REPOSITORY" />)
    )
    expect(baseElement).toMatchSnapshot()
  })
})
