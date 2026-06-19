## Editor icon mapping

This page documents the mapping between the editor UI icon slots (the `data-icon` attributes used in the command bar and other controls) and the closest matching entries in the centralized icon registry (`design-system/icon-registry.json`). Update the mapping in `app-private/editor/index.html` if you want to swap icons.

| UI slot (`data-icon`) | Registry title used | Notes |
|---|---|---|
| `arrow_left` | `ic_fluent_arrow_left_24_regular` | Back navigation icon in the left of the command bar |
| `panel_left` | `ic_fluent_panel_left_24_regular` | Blocks panel toggle icon |
| `edit_24` | `ic_fluent_edit_24_regular` | Mode pill: Edit |
| `eye_24` | `ic_fluent_eye_24_regular` | Mode pill: Preview |
| `arrow_undo_24` | `ic_fluent_arrow_undo_24_regular` | Undo action |
| `arrow_redo_24` | `ic_fluent_arrow_redo_24_regular` | Redo action |
| `desktop_24` | `ic_fluent_screen_cast_24_regular` | Device preview: Desktop |
| `tablet_24` | `ic_fluent_device_tablet_24_regular` | Device preview: Tablet |
| `mobile_24` | `ic_fluent_device_laptop_mobile_24_regular` | Device preview: Mobile |
| `save_24` | `ic_fluent_save_24_regular` | Save action (left of Publish) |
| `send_24` | `ic_fluent_send_24_regular` | Publish action (primary) |
| `settings_24` | `ic_fluent_settings_24_regular` | Page settings button |
| `more_vertical_24` | `ic_fluent_more_vertical_24_regular` | Overflow / more actions |

Where the mapping lives

- The mapping that injects SVGs is defined in `app-private/editor/index.html` in the script that loads `../../design-system/icon-registry.json` and maps friendly names (the `lookup` object) to registry titles.
- The canonical SVG sources live in `design-system/icon-registry.json` (look under the `regular` array for `title` and `source`).

How to change a mapping

1. Edit the `lookup` object in `app-private/editor/index.html` to change which registry `title` is used for a `data-icon` key.
2. If you need a different style (e.g., `filled`), add/select the appropriate entry from `design-system/icon-registry.json` and update the mapping.
3. Reload the editor page to see the new icons. Consider converting the loader to async `fetch()` and calling the inserter re-render for a smoother dev experience.

Notes

- The `data-icon` slot is used across the editor — adding a matching entry in the `lookup` object will inject the SVG into any element that has that `data-icon` attribute.
- If a registry title is missing, the script will leave the element empty (or fallback to any inline content that exists).
