# Command bar actions

| Control | Selector / button | Action | Notes |
| --- | --- | --- | --- |
| Back | `#cb-back` | Leaves the editor and returns to `site-pages.html` or `site-posts.html`. If there are unsaved changes, the user can save first or leave without saving. | Core action |
| Undo | `.editor-history__undo` | Restores the previous editor state snapshot. | Core action |
| Redo | `.editor-history__redo` | Reapplies the next editor state snapshot after an undo. | Core action |
| Document overview | `#cb-document-overview` | Opens a list of blocks currently on the page and selects / scrolls to the chosen block. | Core action |
| Title pill | `#cb-title-command` | Focuses the canvas title field so the page title can be edited quickly from the command bar. | Convenience action |
| Save draft | `#cb-save` | Saves the current editor state to local draft storage and changes the label to `Saved`. Hidden once the page is published. | Core action |
| View | `#cb-preview-toggle` | Opens the preview menu for Desktop, Tablet, or Mobile preview in a new tab using the current editor content. | Core action |
| View page / post | `#cb-view-published` | Appears inside the View menu after publish and opens a published-style preview tab. | Core action after publish |
| Edit Pages | `#cb-edit-pages` | Returns to the same Pages / Posts listing as Back. | **Superfluous**: duplicates Back navigation |
| Settings | `#cb-settings` | Toggles the right inspector sidebar open and closed. | Core action |
| Publish / Update | `#cb-publish` | Saves the current state, marks the page as published, and switches the label to `Update` for subsequent edits. | Core action |
| Options | `#cb-more` | Opens the more-tools menu with Top toolbar, Spotlight mode, Fullscreen mode, Copy all content, and Keyboard shortcuts. | Core action |

## Removed duplicates

1. The command-bar block inserter / add button was removed from the left zone.
2. The duplicate text preview buttons were removed in favour of the single View dropdown menu.
