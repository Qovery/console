import { type TfVarsFileResponse } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { type TerraformGeneralData } from '../terraform-configuration-settings/terraform-configuration-settings'
import {
  CUSTOM_SOURCE,
  TerraformVariablesContext,
  type TerraformVariablesContextType,
} from '../terraform-variables-context'
import { TerraformVariablesTable } from './terraform-variables-table'

const mockTfVarsFromRepo: TfVarsFileResponse[] = []

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
    errors: new Map(),
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

describe('TerraformVariablesTable', () => {
  beforeEach(() => {
    jest.mock('@qovery/domains/organizations/feature', () => ({
      ...jest.requireActual('@qovery/domains/organizations/feature'),
      useListTfVarsFilesFromGitRepo: () => ({
        mutateAsync: jest.fn().mockResolvedValue(mockTfVarsFromRepo),
        isLoading: false,
        status: 'success',
      }),
    }))
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <WrapperComponent>
        <TerraformVariablesTable />
      </WrapperComponent>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should not display delete button when variables are not selected', () => {
    renderWithProviders(
      <WrapperComponent
        overrideValues={{
          vars: [
            {
              id: 'variable-1',
              key: 'variable-1',
              value: 'value-1',
              source: CUSTOM_SOURCE,
              secret: false,
            },
          ],
          selectedRows: [],
        }}
      >
        <TerraformVariablesTable />
      </WrapperComponent>
    )

    expect(screen.queryByText('Delete selected')).not.toBeInTheDocument()
    expect(screen.getByText('Add variable')).toBeInTheDocument()
  })

  it('should display delete button when variables are selected', () => {
    renderWithProviders(
      <WrapperComponent
        overrideValues={{
          vars: [
            {
              id: 'variable-1',
              key: 'variable-1',
              value: 'value-1',
              source: CUSTOM_SOURCE,
              secret: false,
            },
          ],
          selectedRows: ['variable-1'],
        }}
      >
        <TerraformVariablesTable />
      </WrapperComponent>
    )

    expect(screen.getByText('Delete selected')).toBeInTheDocument()
  })

  it('should display description icon when variable has a description', () => {
    renderWithProviders(
      <WrapperComponent
        overrideValues={{
          vars: [
            {
              id: 'variable-1',
              key: 'variable-1',
              value: 'value-1',
              source: CUSTOM_SOURCE,
              secret: false,
              description: 'This is a test description',
            },
          ],
        }}
      >
        <TerraformVariablesTable />
      </WrapperComponent>
    )

    expect(screen.getByRole('img', { name: 'Variable description' })).toBeInTheDocument()
  })

  it('should not display description icon when variable has no description', () => {
    renderWithProviders(
      <WrapperComponent
        overrideValues={{
          vars: [
            {
              id: 'variable-1',
              key: 'variable-1',
              value: 'value-1',
              source: CUSTOM_SOURCE,
              secret: false,
            },
          ],
        }}
      >
        <TerraformVariablesTable />
      </WrapperComponent>
    )

    expect(screen.queryByRole('img', { name: 'Variable description' })).not.toBeInTheDocument()
  })

  it('should display description icon when variable is overridden by tfvars file but has description from terraform definition', () => {
    // This tests that descriptions are preserved even when the variable value
    // comes from a .tfvars file (which doesn't have descriptions)
    renderWithProviders(
      <WrapperComponent
        overrideValues={{
          vars: [
            {
              id: 'variable-1',
              key: 'aws_region',
              value: 'eu-west-1', // Value from tfvars file
              source: 'terraform/variables.tfvars', // Source is tfvars file
              secret: false,
              description: 'The AWS region to deploy to', // Description from terraform definition
            },
          ],
        }}
      >
        <TerraformVariablesTable />
      </WrapperComponent>
    )

    expect(screen.getByRole('img', { name: 'Variable description' })).toBeInTheDocument()
  })

  it('should display description icon when variable is manually overridden but has description from terraform definition', () => {
    // This tests that descriptions are preserved even when the variable value
    // has been manually overridden by the user
    renderWithProviders(
      <WrapperComponent
        overrideValues={{
          vars: [
            {
              id: 'variable-1',
              key: 'instance_type',
              value: 't3.large', // Manually overridden value
              originalValue: 't2.micro', // Original value from terraform
              source: 'terraform/main.tf',
              secret: false,
              description: 'The EC2 instance type', // Description should still be visible
            },
          ],
        }}
      >
        <TerraformVariablesTable />
      </WrapperComponent>
    )

    expect(screen.getByRole('img', { name: 'Variable description' })).toBeInTheDocument()
  })
})
