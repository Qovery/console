import { getByTestId, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import PageSettingsGeneral, { PageSettingsGeneralProps } from './page-settings-general'

describe('PageSettingsGeneral', () => {
  const props: PageSettingsGeneralProps = {
    onSubmit: jest.fn((e) => e.preventDefault()),
    loading: false,
  }

  const defaultValues = {
    name: 'hello-world',
    type: DatabaseTypeEnum.POSTGRESQL,
    mode: DatabaseModeEnum.CONTAINER,
    accessibility: DatabaseAccessibilityEnum.PUBLIC,
    version: '12',
  }

  it('should render successfully', async () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageSettingsGeneral {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form', async () => {
    const spy = jest.fn((e) => e.preventDefault())
    props.onSubmit = spy
    const { baseElement } = render(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )

    const button = getByTestId(baseElement, 'submit-button')

    await waitFor(() => {
      button.click()
      expect(spy).toHaveBeenCalled()
    })
  })
})
