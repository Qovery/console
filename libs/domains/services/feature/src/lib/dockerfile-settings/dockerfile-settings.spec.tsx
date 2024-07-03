import { useForm } from 'react-hook-form'
import selectEvent from 'react-select-event'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { DockerfileSettings, type DockerfileSettingsProps } from './dockerfile-settings'

// https://github.com/suren-atoyan/monaco-react/issues/88
// https://github.com/suren-atoyan/monaco-react/issues/88#issuecomment-887055307
jest.mock('@monaco-editor/react', () => {
  const { forwardRef } = jest.requireActual('react')
  const FakeEditor = forwardRef((props: any, ref: any) => (
    <textarea
      ref={ref}
      data-auto={props.wrapperClassName}
      onChange={(e) => props.onChange(e.target.value)}
      value={props.value}
    />
  ))
  return { Editor: FakeEditor }
})

type FormValues = {
  dockerfile_source: 'GIT_REPOSITORY' | 'DOCKERFILE_RAW'
  dockerfile_path: string | null
  dockerfile_raw: string | null
}

function DockerfileSettingsWithForm({
  onSubmit,
  ...props
}: Omit<DockerfileSettingsProps, 'methods' | 'onSubmit'> & {
  onSubmit: (data: FormValues) => void
}) {
  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      dockerfile_source: 'GIT_REPOSITORY',
    },
  })
  const _onSubmit = form.handleSubmit((data) => {
    onSubmit(data as FormValues)
  })
  return <DockerfileSettings methods={form} onSubmit={_onSubmit} {...props} />
}

describe('DockerfileSettings', () => {
  it('should match snapshot without children', () => {
    const onSubmit = jest.fn()
    const { baseElement } = renderWithProviders(<DockerfileSettingsWithForm onSubmit={onSubmit} />)
    expect(baseElement).toMatchSnapshot()
  })

  it('should match snapshot with children', () => {
    const onSubmit = jest.fn()
    const { baseElement } = renderWithProviders(
      <DockerfileSettingsWithForm onSubmit={onSubmit}>
        <button type="submit">Submit</button>
      </DockerfileSettingsWithForm>
    )
    expect(baseElement).toMatchSnapshot()
  })

  it('should submit dockerfile path', async () => {
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(
      <DockerfileSettingsWithForm onSubmit={onSubmit}>
        <button type="submit">Submit</button>
      </DockerfileSettingsWithForm>
    )
    await userEvent.clear(screen.getByRole('textbox'))
    await userEvent.type(screen.getByRole('textbox'), 'CustomDockerfile')
    await userEvent.click(screen.getByRole('button', { name: /Submit/i }))
    expect(onSubmit).toHaveBeenCalledWith({
      dockerfile_source: 'GIT_REPOSITORY',
      dockerfile_raw: null,
      dockerfile_path: 'CustomDockerfile',
    })
  })

  it('should submit dockerfile raw', async () => {
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(
      <DockerfileSettingsWithForm onSubmit={onSubmit}>
        <button type="submit">Submit</button>
      </DockerfileSettingsWithForm>
    )
    const realSelect = screen.getByLabelText('File source')
    await selectEvent.select(realSelect, 'Raw Dockerfile')
    await userEvent.click(screen.getByRole('button', { name: /Create/i }))
    await userEvent.type(screen.getAllByRole('textbox')[0], 'my dockerfile content')
    await userEvent.click(screen.getByRole('button', { name: /Save/i }))
    await userEvent.click(screen.getByRole('button', { name: /Submit/i }))
    expect(onSubmit).toHaveBeenCalledWith({
      dockerfile_source: 'DOCKERFILE_RAW',
      dockerfile_path: null,
      dockerfile_raw: 'my dockerfile content',
    })
  })
})
