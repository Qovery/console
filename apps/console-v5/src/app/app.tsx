import { Button, DropdownMenu } from '@qovery/shared/ui'
import { useTheme } from './components/theme-provider/theme-provider'

export function App() {
  const { setTheme } = useTheme()

  return (
    <div className="h-screen w-screen bg-background text-neutral">
      <h1 className="text-3xl font-bold text-brand">Console V5</h1>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="outline">Toggle theme</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item onClick={() => setTheme('light')}>Light</DropdownMenu.Item>
          <DropdownMenu.Item onClick={() => setTheme('dark')}>Dark</DropdownMenu.Item>
          <DropdownMenu.Item onClick={() => setTheme('system')}>System</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  )
}

export default App
