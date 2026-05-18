| # | Before | After | Why |
|---|--------|-------|-----|
| 1 | An error occurred | Deployment failed. Check the logs for details. | Names the actual failure instead of a generic phrase, and points the user to the next step (logs) so they can recover. |
| 2 | ENVIRONMENT NAME | Environment name | Sentence case is easier to scan than ALL CAPS and matches modern form conventions; the visual emphasis should come from styling, not casing. |
| 3 | Confirm | Delete database | Destructive actions should restate the action in the button so users can't confirm by reflex. Pairs well with a red/danger button style. |
| 4 | Settings | Configure autoscaling | "Settings" is ambiguous when many modals share the word. Naming the specific subject (autoscaling) sets clear context the moment the modal opens. |
| 5 | No data | No services yet | "No data" is technical jargon. "No services yet" is human, matches the object on the page, and the "yet" implies this is a first-run state, not an error. |
