import { render, screen } from '__tests__/utils/setup-jest'
import InputSelectSmall, { type InputSelectSmallProps } from './input-select-small'

describe('InputSelectSmall', () => {
  let props: InputSelectSmallProps

  beforeEach(() => {
    props = {
      name: '',
      label: '',
      items: [{ label: '', value: '' }],
    }
  })
  it('should render successfully', () => {
    const { baseElement } = render(<InputSelectSmall {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('names the select after its visible label', () => {
    render(<InputSelectSmall {...props} name="storage" label="Storage" items={[{ label: 'PVC', value: 'pvc' }]} />)

    expect(screen.getByRole('combobox', { name: 'Storage' })).toBeInTheDocument()
  })

  it('prefers an explicit accessible name', () => {
    render(
      <InputSelectSmall
        {...props}
        name="storage"
        label="Storage"
        ariaLabel="Loki storage"
        items={[{ label: 'PVC', value: 'pvc' }]}
      />
    )

    expect(screen.getByRole('combobox', { name: 'Loki storage' })).toBeInTheDocument()
  })
})
