import { Button, DropdownMenu } from '@qovery/shared/ui'
import { LayoutOrganization } from './components/layout-organization/layout-organization'
import { useTheme } from './components/theme-provider/theme-provider'

export function App() {
  const { setTheme } = useTheme()

  return (
    <div className="h-full min-h-screen w-full bg-background text-neutral">
      <LayoutOrganization>
        <div className="h-[200vh] p-10">
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
      </LayoutOrganization>
    </div>
  )
}

export default App
