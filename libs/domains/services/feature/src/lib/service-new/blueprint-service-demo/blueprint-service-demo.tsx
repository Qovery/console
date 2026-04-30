import { useState } from 'react'
import { Badge, Button, Heading, Icon, Section, StatusChip, TabsPrimitives, useModal } from '@qovery/shared/ui'
import { BlueprintDetailModal } from '../blueprint-detail-modal/blueprint-detail-modal'
import { BlueprintServiceContextCard } from '../blueprint-service-context-card/blueprint-service-context-card'
import { BlueprintSettingsSection } from '../blueprint-settings-section/blueprint-settings-section'
import {
  BlueprintUpdateReviewModal,
  type NewSetupParameter,
  type UpdateChange,
} from '../blueprint-update-review-modal/blueprint-update-review-modal'
import { type BlueprintEntry } from '../blueprints'

export interface BlueprintServiceDemoProps {
  /** Pick a blueprint from MOCK_BLUEPRINTS to base the fake service on. */
  blueprint: BlueprintEntry
  /** Fake service name to display. */
  serviceName: string
  /** Currently deployed blueprint version on this fake service. */
  currentVersion: string
  /** Major service version this fake service was provisioned with. */
  majorServiceVersion: string
  onExit: () => void
}

// ─── Mock change set & new setup for the update flow demo ────────────────────

const MOCK_CHANGES: Record<string, UpdateChange[]> = {
  // Maps target version → changes
}

const MOCK_NEW_SETUP: Record<string, NewSetupParameter[]> = {}

function buildMockData(blueprint: BlueprintEntry, currentVersion: string) {
  // For each version newer than `currentVersion`, fabricate a small change set.
  const newer = blueprint.versions.filter((v) => v.version !== currentVersion)
  newer.forEach((target) => {
    MOCK_CHANGES[target.version] = [
      {
        kind: 'changed',
        category: 'config',
        label: 'Default backup retention',
        before: '7 days',
        after: '14 days',
        hasOverride: false,
      },
      {
        kind: 'added',
        category: 'infrastructure',
        label: 'CloudWatch alarm: high CPU',
      },
      {
        kind: 'removed',
        category: 'infrastructure',
        label: 'Legacy snapshot bucket',
      },
    ]
    // Only the latest target introduces a new parameter
    if (target.version === blueprint.versions[0]?.version) {
      MOCK_NEW_SETUP[target.version] = [
        {
          id: 'maintenanceWindow',
          label: 'Maintenance window',
          required: true,
          helper: 'Format: ddd:hh24:mm-ddd:hh24:mm — e.g. Sun:03:00-Sun:04:00',
        },
      ]
    } else {
      MOCK_NEW_SETUP[target.version] = []
    }
  })
}

export function BlueprintServiceDemo({
  blueprint,
  serviceName,
  currentVersion,
  majorServiceVersion,
  onExit,
}: BlueprintServiceDemoProps) {
  const { openModal, closeModal } = useModal()
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview')

  buildMockData(blueprint, currentVersion)

  const latestVersion = blueprint.versions[0]?.version
  const updateAvailable =
    latestVersion && latestVersion !== currentVersion
      ? { version: latestVersion, releaseDate: blueprint.versions[0]?.releaseDate ?? '' }
      : null

  // Pretend a newer major version exists for the demo when current is "Postgres 15".
  const majorVersionAvailable =
    majorServiceVersion.toLowerCase().includes('postgres 15') ? { name: 'PostgreSQL 17' } : null

  const openDetailsModal = () => {
    openModal({
      content: <BlueprintDetailModal blueprint={blueprint} onClose={closeModal} onUse={() => undefined} />,
    })
  }

  const openUpdateReview = (defaultTarget: string) => {
    openModal({
      content: (
        <BlueprintUpdateReviewModal
          blueprint={blueprint}
          currentVersion={currentVersion}
          defaultTargetVersion={defaultTarget}
          changesByTargetVersion={MOCK_CHANGES}
          newSetupByTargetVersion={MOCK_NEW_SETUP}
          onCancel={closeModal}
          onApprove={() => closeModal()}
        />
      ),
      options: { width: 640 },
    })
  }

  return (
    <div className="flex h-full min-h-screen flex-col bg-background">
      {/* Demo banner */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral bg-surface-neutral-subtle px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-neutral-subtle">
          <Icon iconName="flask" iconStyle="regular" />
          <span>
            Blueprint service demo — fake page showing the catalog elements that would appear on a real service page.
          </span>
        </div>
        <Button size="sm" color="neutral" variant="surface" onClick={onExit}>
          <Icon iconName="xmark" iconStyle="regular" className="mr-2 text-xs" />
          Close demo
        </Button>
      </div>

      {/* Page header — mimics a real service overview header */}
      <div className="border-b border-neutral px-6 py-4">
        <div className="mb-1 flex items-center gap-2 text-xs text-neutral-subtle">
          <Icon iconName="folder" iconStyle="regular" className="text-xs" />
          <span>my-project</span>
          <Icon iconName="chevron-right" iconStyle="regular" className="text-xs" />
          <span>production</span>
          <Icon iconName="chevron-right" iconStyle="regular" className="text-xs" />
          <span className="font-medium text-neutral">{serviceName}</span>
        </div>
        <div className="flex items-center gap-3">
          <StatusChip status="DEPLOYED" />
          <Heading className="text-2xl text-neutral">{serviceName}</Heading>
          <Badge size="sm" color="neutral" variant="outline">
            <span className="font-mono">v{currentVersion}</span>
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <TabsPrimitives.Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'settings')}>
        <TabsPrimitives.Tabs.List>
          <TabsPrimitives.Tabs.Trigger value="overview">Overview</TabsPrimitives.Tabs.Trigger>
          <TabsPrimitives.Tabs.Trigger value="settings">Settings</TabsPrimitives.Tabs.Trigger>
        </TabsPrimitives.Tabs.List>

        <TabsPrimitives.Tabs.Content value="overview" className="px-6 py-6">
          <Section className="mx-auto max-w-[1024px] gap-6">
            <BlueprintServiceContextCard
              blueprint={blueprint}
              currentVersion={currentVersion}
              updateAvailable={updateAvailable}
              majorVersionAvailable={majorVersionAvailable}
              sourceUrl="https://github.com/Astach/public-catalog"
              onUpdate={() => updateAvailable && openUpdateReview(updateAvailable.version)}
              onDetach={() => undefined}
            />

            {/* Filler to mimic the rest of an overview page */}
            <div className="rounded-md border border-neutral bg-surface-neutral-subtle p-8 text-center">
              <p className="text-sm text-neutral-subtle">
                The rest of the existing service overview page goes here, untouched.
              </p>
            </div>
          </Section>
        </TabsPrimitives.Tabs.Content>

        <TabsPrimitives.Tabs.Content value="settings" className="px-6 py-6">
          <Section className="mx-auto max-w-[1024px] gap-8">
            <div className="rounded-md border border-neutral bg-surface-neutral-subtle p-8 text-center">
              <p className="text-sm text-neutral-subtle">
                The existing General tab content (name, description, auto-deploy, etc.) goes here.
              </p>
            </div>

            <BlueprintSettingsSection
              blueprint={blueprint}
              currentVersion={currentVersion}
              majorServiceVersion={majorServiceVersion}
              onVersionChange={(target) => openUpdateReview(target)}
              onViewDetails={openDetailsModal}
              onDetach={() => undefined}
            />

            <div className="rounded-md border border-neutral bg-surface-neutral-subtle p-8 text-center">
              <p className="text-sm text-neutral-subtle">
                The rest of the existing General tab content (labels, annotations, danger zone) goes here.
              </p>
            </div>
          </Section>
        </TabsPrimitives.Tabs.Content>
      </TabsPrimitives.Tabs.Root>
    </div>
  )
}

export default BlueprintServiceDemo
