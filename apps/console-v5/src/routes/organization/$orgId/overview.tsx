import { createFileRoute, useParams } from '@tanstack/react-router'
import { Button, DropdownMenu } from '../../../../../../libs/shared/ui/src'
import { useTheme } from '../../../app/components/theme-provider/theme-provider'

export const Route = createFileRoute('/organization/$orgId/overview')({
  component: RouteComponent,
})

function RouteComponent() {
  const { orgId } = useParams({ strict: false })
  const { setTheme } = useTheme()

  return (
    <div className="flex flex-col gap-4">
      <p className="text-neutral">Overview page for organization {orgId}</p>

      <div>
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
    </div>
  )
}
