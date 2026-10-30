import { type FieldSchemaResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { OperatorConfigurationField } from './operator-configuration-field'

const taintsField = {
  key: 'taints',
  label: 'Node group taints to tolerate',
  type: 'array',
  required: false,
  sensitive: false,
  constraints: {},
  items: {
    type: 'object',
    fields: [
      { key: 'key', label: 'Taint key', type: 'string', required: true, sensitive: false, constraints: {} },
      { key: 'value', label: 'Taint value', type: 'string', required: false, sensitive: false, constraints: {} },
      {
        key: 'effect',
        label: 'Effect',
        type: 'string',
        required: true,
        sensitive: false,
        defaultValue: 'NoSchedule',
        constraints: { allowedValues: ['NoSchedule', 'PreferNoSchedule', 'NoExecute'] },
      },
    ],
  },
  itemFields: [],
} as FieldSchemaResponse

describe('OperatorConfigurationField', () => {
  it('adds, edits and removes taints while keeping their summaries in sync', async () => {
    function Form() {
      const [value, setValue] = useState<unknown>([])
      return <OperatorConfigurationField field={taintsField} value={value} violations={[]} onChange={setValue} />
    }
    const { userEvent } = renderWithProviders(<Form />)
    expect(screen.getByText('No group taints added')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Add taint', exact: true }))
    await userEvent.type(await screen.findByLabelText('Taint key'), 'https')
    await userEvent.click(screen.getByRole('button', { name: 'Add', exact: true }))
    expect(await screen.findByText('Taint key: https')).toBeInTheDocument()
    expect(screen.getByText('Node group taint 1')).toBeInTheDocument()
    expect(screen.getByText('Effect: NoSchedule')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Edit https' }))
    await userEvent.clear(await screen.findByLabelText('Taint key'))
    await userEvent.type(screen.getByLabelText('Taint key'), 'http')
    await userEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
    expect(await screen.findByText('Taint key: http')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remove http' }))
    expect(screen.getByText('No group taints added')).toBeInTheDocument()
  })
})
