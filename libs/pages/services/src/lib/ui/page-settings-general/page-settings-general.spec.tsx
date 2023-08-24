import { render } from '__tests__/utils/setup-jest'
import { type ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import PageSettingsGeneral, { type PageSettingsGeneralProps } from './page-settings-general'

describe('PageSettingsGeneral', () => {
  let props: PageSettingsGeneralProps

  const WrapperForm = ({ children }: { children: ReactNode }) => {
    const methods = useForm()
    return <FormProvider {...methods}>{children}</FormProvider>
  }

  it('should render successfully', () => {
    const { baseElement } = render(
      <WrapperForm>
        <PageSettingsGeneral {...props} />
      </WrapperForm>
    )
    expect(baseElement).toBeTruthy()
  })
})
