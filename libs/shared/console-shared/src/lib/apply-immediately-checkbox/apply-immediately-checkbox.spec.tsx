import { FormProvider, useForm } from 'react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ApplyImmediatelyCheckbox } from './apply-immediately-checkbox'

function Wrapper({ children, defaultValues = {} }: { children: React.ReactNode; defaultValues?: any }) {
  const methods = useForm({
    defaultValues: {
      apply_immediately: false,
      ...defaultValues,
    },
  })

  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('ApplyImmediatelyCheckbox', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <Wrapper>
        <ApplyImmediatelyCheckbox />
      </Wrapper>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should display warning when checkbox is checked', async () => {
    const { userEvent } = renderWithProviders(
      <Wrapper>
        <ApplyImmediatelyCheckbox />
      </Wrapper>
    )

    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)

    expect(screen.getByTestId('apply-immediately-warning')).toBeInTheDocument()
  })

  it('should not display warning when checkbox is unchecked', () => {
    renderWithProviders(
      <Wrapper>
        <ApplyImmediatelyCheckbox />
      </Wrapper>
    )

    expect(screen.queryByTestId('apply-immediately-warning')).not.toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    renderWithProviders(
      <Wrapper>
        <ApplyImmediatelyCheckbox disabled />
      </Wrapper>
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })
})
