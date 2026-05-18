# Microcopy Rewrite

| Before | After | Why |
| --- | --- | --- |
| "An error occurred" | "Deploy failed. Check the logs for details." | States what happened + what to do next; avoids the generic "An error occurred" anti-pattern. |
| "ENVIRONMENT NAME" | "Environment name" | Sentence case for UI labels; no ALL CAPS. |
| "Confirm" | "Delete database" | Destructive buttons name the object and lead with the verb — never "Confirm" or "OK". |
| "Settings" | "Configure autoscaling" | Modal titles name the action, not a generic object. "Settings", "Edit", and "Details" alone are banned. |
| "No data" | "No services yet. Create a service to deploy your first app." | Empty states follow the what's missing + why it matters + how to fix it pattern; "No data" is unhelpful. |
