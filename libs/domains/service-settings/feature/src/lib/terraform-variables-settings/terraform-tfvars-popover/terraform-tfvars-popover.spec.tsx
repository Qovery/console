import { FormProvider, useForm } from 'react-hook-form'
import { renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import { type TerraformGeneralData } from '../terraform-configuration-settings/terraform-configuration-settings'
import { TerraformVariablesContext, type TerraformVariablesContextType } from '../terraform-variables-context'
import { TfvarsFilesPopover } from './terraform-tfvars-popover'

const WrapperComponent = ({
  children,
  overrideValues = {},
}: {
  children: React.ReactNode
  overrideValues?: Partial<TerraformVariablesContextType>
}) => {
  const methods = useForm<TerraformGeneralData>({ defaultValues: {}, mode: 'all' })
  const value: TerraformVariablesContextType = {
    vars: [],
    addVariable: jest.fn(),
    updateKey: jest.fn(),
    updateValue: jest.fn(),
    toggleSecret: jest.fn(),
    revertValue: jest.fn(),
    removeVariable: jest.fn(),
    serializeForApi: jest.fn(),
    errors: new Map<string, { message: string; field: 'key' | 'value' }>(),
    fetchTfVarsFiles: jest.fn(),
    tfVarFiles: [],
    setTfVarFiles: jest.fn(),
    newPath: '',
    setNewPath: jest.fn(),
    submitNewPath: jest.fn(),
    areTfVarsFilesLoading: false,
    newPathErrorMessage: undefined,
    setNewPathErrorMessage: jest.fn(),
    setFileListOrder: jest.fn(),
    selectedRows: [],
    setSelectedRows: jest.fn(),
    deleteSelectedRows: jest.fn(),
    isRowSelected: jest.fn(),
    selectRow: jest.fn(),
    hoveredRow: undefined,
    setHoveredRow: jest.fn(),
    ...overrideValues,
  }

  return (
    <FormProvider {...methods}>
      <TerraformVariablesContext.Provider value={value}>{children}</TerraformVariablesContext.Provider>
    </FormProvider>
  )
}

describe('TerraformTfvarsPopover', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <WrapperComponent>
        <TfvarsFilesPopover />
      </WrapperComponent>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render the tfvars files in the list', async () => {
    const { userEvent } = renderWithProviders(
      <WrapperComponent
        overrideValues={{
          tfVarFiles: [
            {
              source: 'file-1.tfvars',
              variables: { key: 'value' },
              enabled: true,
            },
            {
              source: 'file-2.tfvars',
              variables: { key: 'value' },
              enabled: false,
            },
          ],
        }}
      >
        <TfvarsFilesPopover />
      </WrapperComponent>
    )

    const openTfvarsFilesButton = screen.getByTestId('open-tfvars-files-button')
    await userEvent.click(openTfvarsFilesButton)

    expect(screen.getAllByTestId('tfvar-item')).toHaveLength(2) // 2 files, 1 enabled, 1 disabled
  })

  it('should render the counter of enabled files', () => {
    renderWithProviders(
      <WrapperComponent
        overrideValues={{
          tfVarFiles: [
            {
              source: 'file-1.tfvars',
              variables: { key: 'value' },
              enabled: true,
            },
            {
              source: 'file-2.tfvars',
              variables: { key: 'value' },
              enabled: false,
            },
          ],
        }}
      >
        <TfvarsFilesPopover />
      </WrapperComponent>
    )
    expect(screen.getByTestId('enabled-files-count')).toHaveTextContent('1') // amount of enabled files should be displayed
  })

  it('should call setFileListOrder when a file is reordered', async () => {
    const setFileListOrder = jest.fn()
    const { userEvent } = renderWithProviders(
      <WrapperComponent
        overrideValues={{
          tfVarFiles: [
            {
              source: 'file-1.tfvars',
              variables: { key: 'value' },
              enabled: true,
            },
            {
              source: 'file-2.tfvars',
              variables: { key: 'value-override' },
              enabled: true,
            },
          ],
          setFileListOrder,
        }}
      >
        <TfvarsFilesPopover />
      </WrapperComponent>
    )

    const openTfvarsFilesButton = screen.getByTestId('open-tfvars-files-button')
    await userEvent.click(openTfvarsFilesButton)

    const varRow = screen.getAllByTestId('tfvar-item')[0]
    const indexInput = within(varRow).getByTestId('index-input')

    // Changing the order of the file in the list (from first to second)
    await userEvent.type(indexInput, '1')
    await userEvent.keyboard('{Enter}')

    expect(setFileListOrder).toHaveBeenCalledWith(['file-2.tfvars', 'file-1.tfvars'])
  })
})
