import { act, fireEvent, queryByText, render, screen, waitFor } from '@testing-library/react'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import PageSettingsGeneral, { PageSettingsGeneralProps } from './page-settings-general'

describe('PageSettingsGeneral', () => {
  const props: PageSettingsGeneralProps = {
    onSubmit: jest.fn(),
  }

  const WrapperForm = ({ children }) => {
    const methods = useForm({
      defaultValues: {
        name: 'hello',
      },
      mode: 'onChange',
    })

    return <FormProvider {...methods}>{children}</FormProvider>
  }
  it('should render successfully', async () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageSettingsGeneral {...props} />))

    await waitFor(() => {
      expect(baseElement).toBeTruthy()
    })
  })

  it('should edit the name', async () => {
    const { baseElement } = render(
      <WrapperForm>
        <PageSettingsGeneral {...props} />
      </WrapperForm>
    )

    await act(() => {
      const inputName = screen.getByTestId('input-name')
      fireEvent.change(inputName, { target: { value: 'aaa' } })
      fireEvent.change(inputName, { target: { value: '' } })
    })

    expect(queryByText(baseElement, 'Please enter a name.')).toBeNull()
  })
})
