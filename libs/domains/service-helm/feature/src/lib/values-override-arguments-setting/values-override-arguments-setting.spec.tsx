import { type HelmRequestAllOfSource } from 'qovery-typescript-axios'
import { type ChangeEvent } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { type HelmValuesArgumentsData, ValuesOverrideArgumentsSetting } from './values-override-arguments-setting'

interface MockEditorProps {
  value?: string
  onChange?: (value: string) => void
  wrapperClassName?: string
}

jest.mock('@monaco-editor/react', () => {
  const React = jest.requireActual('react')
  const FakeEditor = React.forwardRef((props: MockEditorProps, ref: React.Ref<HTMLTextAreaElement>) => (
    <textarea
      ref={ref}
      data-auto={props.wrapperClassName}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => props.onChange?.(e.target.value)}
      value={props.value}
    />
  ))
  return { Editor: FakeEditor }
})

describe('ValuesOverrideArgumentsSetting', () => {
  const mockSource: HelmRequestAllOfSource = {
    git_repository: {
      url: 'https://github.com/test/repo',
      branch: 'main',
      root_path: '/',
    },
  }
  const onSubmit = jest.fn()

  const defaultValues: HelmValuesArgumentsData = {
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
  }

  it('should match snapshot', () => {
    const Wrapper = () => {
      const methods = useForm<HelmValuesArgumentsData>({ defaultValues, mode: 'all' })
      return (
        <FormProvider {...methods}>
          <ValuesOverrideArgumentsSetting source={mockSource} onSubmit={onSubmit} methods={methods} />
        </FormProvider>
      )
    }

    const { baseElement } = renderWithProviders(<Wrapper />)
    expect(baseElement).toMatchSnapshot()
  })
})
