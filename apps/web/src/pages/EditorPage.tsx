import { useLayoutEffect } from 'react'
import styles from './EditorPage.module.css'
import '../editor/index.css'
import '../editor/blocks/paragraph/styles.css'
import '../editor/blocks/heading/styles.css'
import '../editor/blocks/code/styles.css'
import '../editor/blocks/list/styles.css'
import '../editor/blocks/image/styles.css'
import '../editor/blocks/gallery/styles.css'
import '../editor/blocks/video/styles.css'
import '../editor/blocks/audio/styles.css'
import '../editor/blocks/file/styles.css'
import '../editor/blocks/media-text/styles.css'
import '../editor/blocks/cover/styles.css'
import '../editor/blocks/separator/styles.css'
import '../editor/blocks/group/styles.css'
import '../editor/blocks/stack/styles.css'
import '../editor/blocks/columns/styles.css'
import '../editor/blocks/column/styles.css'
import '../editor/blocks/spacer/styles.css'
import '../editor/blocks/card/styles.css'
import '../editor/blocks/hero/styles.css'
import '../editor/blocks/embed/styles.css'
import '../editor/blocks/row/styles.css'
import '../editor/blocks/grid/styles.css'
import '../editor/blocks/divider/styles.css'
import '../editor/blocks/background/styles.css'
import '../editor/blocks/icon/styles.css'
import '../editor/blocks/callout/styles.css'
import '../editor/blocks/accordion/styles.css'
import '../editor/blocks/drawer/styles.css'
import '../editor/blocks/search-results/styles.css'
// Editor JS modules are loaded dynamically after the component mounts so markup exists before runtime initialization.
import '../editor/styles.css'

type EditorWindow = Window & {
  EditorBlockRegistry?: { finalize?: (definitions: Record<string, unknown>, order: unknown) => void }
  EDITOR_BLOCK_DEFINITIONS?: Record<string, unknown>
  EDITOR_BLOCK_ORDER?: string[]
  ToolbarFactory?: { setTopToolbarHost?: (host: HTMLElement) => void }
  PAGE_MANAGER_API_BASE?: string
}

function waitForEditorDom(timeout = 2000) {
  return new Promise<void>((resolve) => {
    const requiredIds = [
      'pe-editor-canvas',
      'pe-block-groups',
      'pe-patterns',
      'pe-inserter-search',
      'pe-inserter-panel',
      'pe-inserter-modes',
      'pe-toggle-left',
      'pe-toggle-right',
      'cb-back',
      'cb-save',
      'cb-preview-toggle',
      'cb-settings',
      'cb-publish',
      'cb-more',
      'cb-title-command',
      'cb-document-overview',
      'pe-canvas-title',
      'pe-inspector-content'
    ]

    const hasDom = () => requiredIds.every((id) => document.getElementById(id) !== null)
    if (hasDom()) {
      resolve()
      return
    }

    const start = Date.now()
    const interval = window.setInterval(() => {
      if (hasDom() || Date.now() - start > timeout) {
        window.clearInterval(interval)
        resolve()
      }
    }, 10)
  })
}

export default function EditorPage() {
  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (params.get('embed') === '1') {
      document.documentElement.classList.add('pe-embed-mode')
    }

    document.documentElement.classList.add('pe-editor-fullwidth')

    if (String(params.get('kind') || '').toLowerCase() === 'post') {
      const typeLabel = document.querySelector('.editor-document-bar__post-type-label')
      if (typeLabel) typeLabel.textContent = '· Post'

      const backButton = document.getElementById('cb-back')
      if (backButton) {
        backButton.setAttribute('aria-label', 'Back to posts')
        backButton.setAttribute('title', 'Back to posts')
      }

      const editPagesButton = document.getElementById('cb-edit-pages')
      if (editPagesButton) {
        editPagesButton.setAttribute('aria-label', 'Back to posts')
      }
    }

    const w = window as EditorWindow
    let cleanupCollapsible: (() => void) | null = null
    let cancelled = false

    async function loadEditorScripts() {
      const definitionImports = [
        import('../editor/blocks.js'),
        import('../editor/core/block-registry.js'),
        import('../editor/blocks/paragraph/controls.js'),
        import('../editor/blocks/paragraph/edit.js'),
        import('../editor/blocks/paragraph/save.js'),
        import('../editor/blocks/paragraph/popovers/link-popover.js'),
        import('../editor/blocks/paragraph/popovers/color-popover.js'),
        import('../editor/blocks/paragraph/index.js'),
        import('../editor/blocks/heading/controls.js'),
        import('../editor/blocks/heading/edit.js'),
        import('../editor/blocks/heading/save.js'),
        import('../editor/blocks/heading/popovers/typography-popover.js'),
        import('../editor/blocks/heading/index.js'),
        import('../editor/blocks/code/controls.js'),
        import('../editor/blocks/code/edit.js'),
        import('../editor/blocks/code/save.js'),
        import('../editor/blocks/code/popovers/language-popover.js'),
        import('../editor/blocks/code/index.js'),
        import('../editor/blocks/list/controls.js'),
        import('../editor/blocks/list/edit.js'),
        import('../editor/blocks/list/save.js'),
        import('../editor/blocks/list/popovers/list-settings-popover.js'),
        import('../editor/blocks/list/index.js'),
        import('../editor/blocks/image/controls.js'),
        import('../editor/blocks/image/edit.js'),
        import('../editor/blocks/image/save.js'),
        import('../editor/blocks/image/popovers/focal-point-popover.js'),
        import('../editor/blocks/image/popovers/alt-text-popover.js'),
        import('../editor/blocks/image/index.js'),
        import('../editor/blocks/gallery/controls.js'),
        import('../editor/blocks/gallery/edit.js'),
        import('../editor/blocks/gallery/save.js'),
        import('../editor/blocks/gallery/popovers/crop-popover.js'),
        import('../editor/blocks/gallery/popovers/lightbox-popover.js'),
        import('../editor/blocks/gallery/index.js'),
        import('../editor/blocks/video/controls.js'),
        import('../editor/blocks/video/edit.js'),
        import('../editor/blocks/video/save.js'),
        import('../editor/blocks/video/popovers/poster-popover.js'),
        import('../editor/blocks/video/popovers/tracks-popover.js'),
        import('../editor/blocks/video/index.js'),
        import('../editor/blocks/audio/controls.js'),
        import('../editor/blocks/audio/edit.js'),
        import('../editor/blocks/audio/save.js'),
        import('../editor/blocks/audio/popovers/playback-popover.js'),
        import('../editor/blocks/audio/index.js'),
        import('../editor/blocks/file/controls.js'),
        import('../editor/blocks/file/edit.js'),
        import('../editor/blocks/file/save.js'),
        import('../editor/blocks/file/popovers/link-popover.js'),
        import('../editor/blocks/file/index.js'),
        import('../editor/blocks/media-text/controls.js'),
        import('../editor/blocks/media-text/edit.js'),
        import('../editor/blocks/media-text/save.js'),
        import('../editor/blocks/media-text/popovers/media-position-popover.js'),
        import('../editor/blocks/media-text/index.js'),
        import('../editor/blocks/cover/controls.js'),
        import('../editor/blocks/cover/edit.js'),
        import('../editor/blocks/cover/save.js'),
        import('../editor/blocks/cover/popovers/background-popover.js'),
        import('../editor/blocks/cover/popovers/layout-popover.js'),
        import('../editor/blocks/cover/index.js'),
        import('../editor/blocks/separator/controls.js'),
        import('../editor/blocks/separator/edit.js'),
        import('../editor/blocks/separator/save.js'),
        import('../editor/blocks/separator/index.js'),
        import('../editor/blocks/group/controls.js'),
        import('../editor/blocks/group/edit.js'),
        import('../editor/blocks/group/save.js'),
        import('../editor/blocks/group/index.js'),
        import('../editor/blocks/stack/controls.js'),
        import('../editor/blocks/stack/edit.js'),
        import('../editor/blocks/stack/save.js'),
        import('../editor/blocks/stack/index.js'),
        import('../editor/blocks/columns/controls.js'),
        import('../editor/blocks/columns/edit.js'),
        import('../editor/blocks/columns/save.js'),
        import('../editor/blocks/columns/index.js'),
        import('../editor/blocks/column/controls.js'),
        import('../editor/blocks/column/edit.js'),
        import('../editor/blocks/column/save.js'),
        import('../editor/blocks/column/index.js'),
        import('../editor/blocks/spacer/controls.js'),
        import('../editor/blocks/spacer/edit.js'),
        import('../editor/blocks/spacer/save.js'),
        import('../editor/blocks/spacer/index.js'),
        import('../editor/blocks/card/controls.js'),
        import('../editor/blocks/card/edit.js'),
        import('../editor/blocks/card/save.js'),
        import('../editor/blocks/card/popovers/content-popover.js'),
        import('../editor/blocks/card/popovers/surface-popover.js'),
        import('../editor/blocks/card/index.js'),
        import('../editor/blocks/hero/controls.js'),
        import('../editor/blocks/hero/edit.js'),
        import('../editor/blocks/hero/save.js'),
        import('../editor/blocks/hero/popovers/background-popover.js'),
        import('../editor/blocks/hero/popovers/content-popover.js'),
        import('../editor/blocks/hero/popovers/cta-popover.js'),
        import('../editor/blocks/hero/index.js'),
        import('../editor/blocks/embed/controls.js'),
        import('../editor/blocks/embed/edit.js'),
        import('../editor/blocks/embed/save.js'),
        import('../editor/blocks/embed/index.js'),
        import('../editor/blocks/row/controls.js'),
        import('../editor/blocks/row/edit.js'),
        import('../editor/blocks/row/save.js'),
        import('../editor/blocks/row/index.js'),
        import('../editor/blocks/grid/controls.js'),
        import('../editor/blocks/grid/edit.js'),
        import('../editor/blocks/grid/save.js'),
        import('../editor/blocks/grid/index.js'),
        import('../editor/blocks/divider/controls.js'),
        import('../editor/blocks/divider/edit.js'),
        import('../editor/blocks/divider/save.js'),
        import('../editor/blocks/divider/index.js'),
        import('../editor/blocks/background/controls.js'),
        import('../editor/blocks/background/edit.js'),
        import('../editor/blocks/background/save.js'),
        import('../editor/blocks/background/index.js'),
        import('../editor/blocks/icon/controls.js'),
        import('../editor/blocks/icon/edit.js'),
        import('../editor/blocks/icon/save.js'),
        import('../editor/blocks/icon/index.js'),
        import('../editor/blocks/callout/controls.js'),
        import('../editor/blocks/callout/edit.js'),
        import('../editor/blocks/callout/save.js'),
        import('../editor/blocks/callout/index.js'),
        import('../editor/blocks/accordion/controls.js'),
        import('../editor/blocks/accordion/edit.js'),
        import('../editor/blocks/accordion/save.js'),
        import('../editor/blocks/accordion/index.js'),
        import('../editor/blocks/drawer/controls.js'),
        import('../editor/blocks/drawer/edit.js'),
        import('../editor/blocks/drawer/save.js'),
        import('../editor/blocks/drawer/index.js'),
        import('../editor/blocks/search-results/controls.js'),
        import('../editor/blocks/search-results/edit.js'),
        import('../editor/blocks/search-results/save.js'),
        import('../editor/blocks/search-results/index.js'),
        import('../editor/blocks/runtime-utils.js'),
        import('../editor/blocks/form/runtime.js'),
        import('../editor/blocks/field_text/index.js'),
        import('../editor/blocks/field_textarea/index.js'),
        import('../editor/blocks/field_email/index.js'),
        import('../editor/blocks/field_phone/index.js'),
        import('../editor/blocks/field_number/index.js'),
        import('../editor/blocks/field_select/index.js'),
        import('../editor/blocks/field_radio/index.js'),
        import('../editor/blocks/field_checkbox/index.js'),
        import('../editor/blocks/field_checkbox_group/index.js'),
        import('../editor/blocks/field_date/index.js'),
        import('../editor/blocks/field_file/index.js'),
        import('../editor/blocks/field_hidden/index.js'),
        import('../editor/blocks/form/index.js')
      ]

      for (const loader of definitionImports) {
        try {
          await loader
        } catch (error) {
          console.error('Failed loading editor definition', error)
        }
      }

      try {
        await import('../editor/core.js')
      } catch (error) {
        console.error('Failed loading editor core', error)
      }

      finalizeEditorBlocks()
      mergeBlockDefinitionIcons()

      const runtimeImports = [
        import('../editor/media-library.js'),
        import('../editor/inserter.js'),
        import('../editor/canvas.js'),
        import('../editor/inspector.js'),
        import('../editor/toolbar.js'),
        import('../editor/toolbar-factory.js')
      ]

      for (const loader of runtimeImports) {
        try {
          await loader
        } catch (error) {
          console.error('Failed loading editor runtime', error)
        }
      }
    }

    function finalizeEditorBlocks() {
      try {
        if (!w.EditorBlockRegistry || typeof w.EditorBlockRegistry.finalize !== 'function') return
        w.EditorBlockRegistry.finalize(w.EDITOR_BLOCK_DEFINITIONS || {}, w.EDITOR_BLOCK_ORDER)
      } catch (error) {
        console.warn('Failed to finalize editor blocks', error)
      }
    }

    function mergeBlockDefinitionIcons() {
      try {
        if (!w.EDITOR_BLOCK_DEFINITIONS) return

        const iconMap: Record<string, string> = {}
        try {
          const rIcons = new XMLHttpRequest()
          rIcons.open('GET', 'https://sa365evergreenwebsite.blob.core.windows.net/$web/assets/icon-registry.json', false)
          rIcons.send(null)
          if (rIcons.status === 200 && rIcons.responseText) {
            const regIcons = JSON.parse(rIcons.responseText)
            const items = regIcons && regIcons.regular ? regIcons.regular : []
            items.forEach((it: Record<string, unknown>) => {
              if (it && typeof it === 'object' && 'title' in it && 'source' in it) {
                const title = String((it as { title: unknown }).title)
                const source = String((it as { source: unknown }).source)
                iconMap[title] = source
              }
            })
          }
        } catch (error) {
          console.warn('Failed to load icon registry for editor block definitions', error)
        }

        const req = new XMLHttpRequest()
        req.open('GET', 'https://sa365evergreenwebsite.blob.core.windows.net/$web/assets/block-registry.json', false)
        req.send(null)
        if (req.status === 200 || req.responseText) {
          try {
            const reg = JSON.parse(req.responseText) as Record<string, unknown>
            const types = (reg && typeof reg === 'object' && 'blockTypes' in reg) ? (reg.blockTypes as Record<string, unknown>) : {}
            Object.keys(types).forEach((k) => {
              const t = types[k]
              if (t && typeof t === 'object' && 'icon' in t && w.EDITOR_BLOCK_DEFINITIONS?.[k]) {
                const iconVal = String((t as { icon: unknown }).icon)
                ;(w.EDITOR_BLOCK_DEFINITIONS[k] as Record<string, unknown>).icon = iconMap[iconVal] || iconVal
              }
            })
          } catch (error) {
            console.warn('Failed to merge editor block definition icons', error)
          }
        }
      } catch (error) {
        console.warn('Failed to merge editor block definition icons', error)
      }
    }

   
    function wireToolbarCenterHost() {
      try {
        const host = document.getElementById('cb-toolbar-center-host')
        if (!host) return
        if (w.ToolbarFactory && typeof w.ToolbarFactory.setTopToolbarHost === 'function') {
          w.ToolbarFactory.setTopToolbarHost(host)
        } else {
          const iv = window.setInterval(() => {
            if (w.ToolbarFactory && typeof w.ToolbarFactory.setTopToolbarHost === 'function') {
              window.clearInterval(iv)
              w.ToolbarFactory.setTopToolbarHost(host)
            }
          }, 250)
          return () => window.clearInterval(iv)
        }
      } catch { /* empty */ }
    }

    function wireCollapsiblePanels() {
      let leftToggle = document.getElementById('pe-toggle-left')
      let rightToggle = document.getElementById('pe-toggle-right')
      const root = document.documentElement
      const iconMap = (() => {
        try {
          const req = new XMLHttpRequest()
          req.open('GET', 'https://sa365evergreenwebsite.blob.core.windows.net/$web/assets/icon-registry.json', false)
          req.send(null)
          if (req.status === 200 && req.responseText) {
            const reg = JSON.parse(req.responseText)
            return (reg && reg.regular || []).reduce((acc: Record<string, string>, item: never) => {
              if (item && typeof item === 'object' && 'title' in item && 'source' in item) {
                acc[(item as { title: string }).title] = (item as { source: string }).source
              }
              return acc
            }, {})
          }
        } catch { /* empty */ }
        return {}
      })()

      function setLeftToggleIcon() {
        if (!leftToggle) return
        const icon = root.classList.contains('collapsed-left')
          ? iconMap.ic_fluent_arrow_expand_24_regular
          : iconMap.ic_fluent_panel_left_24_regular
        leftToggle.innerHTML = icon || '☰'
        leftToggle.title = root.classList.contains('collapsed-left') ? 'Expand blocks panel' : 'Collapse blocks panel'
        leftToggle.setAttribute('aria-label', leftToggle.title)
      }

      function applyState() {
        if (localStorage.getItem('editor.leftCollapsed') === '1') root.classList.add('collapsed-left')
        else root.classList.remove('collapsed-left')
        if (localStorage.getItem('editor.rightCollapsed') === '1') root.classList.add('collapsed-right')
        else root.classList.remove('collapsed-right')
        setLeftToggleIcon()
      }

      applyState()

      const leftClick = () => {
        if (!leftToggle) return
        const cur = root.classList.toggle('collapsed-left')
        localStorage.setItem('editor.leftCollapsed', cur ? '1' : '0')
        setLeftToggleIcon()
      }
      const rightClick = () => {
        if (!rightToggle) return
        const cur = root.classList.toggle('collapsed-right')
        localStorage.setItem('editor.rightCollapsed', cur ? '1' : '0')
      }
const onKeyDown = (e: KeyboardEvent) => {
  if (!e.altKey || e.shiftKey || e.ctrlKey) return;
  
  if (e.key === '1' && leftToggle) {
    leftToggle.click();
    e.preventDefault();
  } else if (e.key === '3' && rightToggle) {
    rightToggle.click();
    e.preventDefault();
  }
};

      const attachToggles = () => {
        leftToggle = leftToggle || document.getElementById('pe-toggle-left')
        rightToggle = rightToggle || document.getElementById('pe-toggle-right')

        if (leftToggle && !leftToggle.hasAttribute('data-toggle-attached')) {
          leftToggle.addEventListener('click', leftClick)
          leftToggle.setAttribute('data-toggle-attached', '1')
        }

        if (rightToggle && !rightToggle.hasAttribute('data-toggle-attached')) {
          rightToggle.addEventListener('click', rightClick)
          rightToggle.setAttribute('data-toggle-attached', '1')
        }
      }

      attachToggles()

      const attachInterval = window.setInterval(() => {
        if (leftToggle && rightToggle) {
          window.clearInterval(attachInterval)
          return
        }
        attachToggles()
      }, 100)

      window.addEventListener('keydown', onKeyDown)

      return () => {
        if (leftToggle) leftToggle.removeEventListener('click', leftClick)
        if (rightToggle) rightToggle.removeEventListener('click', rightClick)
        window.removeEventListener('keydown', onKeyDown)
        window.clearInterval(attachInterval)
      }
    }

    async function initEditorRuntime() {
      await waitForEditorDom()
      if (cancelled) return
      await loadEditorScripts()
      finalizeEditorBlocks()
      mergeBlockDefinitionIcons()
    
      const toolbarCleanup = wireToolbarCenterHost()
      cleanupCollapsible = wireCollapsiblePanels()
      if (toolbarCleanup) toolbarCleanup()
    }

    void initEditorRuntime()

    return () => {
      cancelled = true
      document.documentElement.classList.remove('pe-editor-fullwidth')
      if (cleanupCollapsible) cleanupCollapsible()
    }
  }, [])

  return (
    <>


      <div className="editor-header edit-post-header">


        <div className={`editor-header__toolbar ${styles.editorHeaderToolbar}`}>
          <div
            role="toolbar"
            aria-orientation="horizontal"
            aria-label="Document tools"
            className="components-accessible-toolbar editor-document-tools edit-post-header-toolbar is-unstyled"
          >
            <div className="editor-document-tools__left">
              <button
                type="button"
                id=":r3:"
                data-toolbar-item="true"
                aria-disabled="false"
                className="components-button editor-history__undo is-next-40px-default-size is-compact has-icon"
                aria-label="Undo"
                tabIndex={-1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
                  <path d="M18.3 11.7c-.6-.6-1.4-.9-2.3-.9H6.7l2.9-3.3-1.1-1-4.5 5L8.5 16l1-1-2.7-2.7H16c.5 0 .9.2 1.3.5 1 1 1 3.4 1 4.5v.3h1.5v-.2c0-1.5 0-4.3-1.5-5.7z" />
                </svg>
              </button>
              <button
                type="button"
                id=":r5:"
                data-toolbar-item="true"
                aria-disabled="true"
                className="components-button editor-history__redo is-next-40px-default-size is-compact has-icon"
                aria-label="Redo"
                tabIndex={-1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
                  <path d="M15.6 6.5l-1.1 1 2.9 3.3H8c-.9 0-1.7.3-2.3.9-1.4 1.5-1.4 4.2-1.4 5.6v.2h1.5v-.3c0-1.1 0-3.5 1-4.5.3-.3.7-.5 1.3-.5h9.2L14.5 15l1.1 1.1 4.6-4.6-4.6-5z" />
                </svg>
              </button>
              <button
                type="button"
                id="cb-document-overview"
                aria-pressed="false"
                aria-expanded="false"
                data-toolbar-item="true"
                className="components-button components-toolbar-button editor-document-tools__document-overview-toggle is-compact has-icon"
                aria-label="Document Overview"
                tabIndex={-1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
                  <path d="M3 6h11v1.5H3V6Zm3.5 5.5h11V13h-11v-1.5ZM21 17H10v1.5h11V17Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className={`editor-header__center ${styles.editorHeaderCenter}`}>
          <div className="editor-document-bar">
            <button
              type="button"
              id="cb-title-command"
              className={`components-button editor-document-bar__command is-compact ${styles.editorDocumentBarCommand}`}
              aria-label="Jump to page title"
            >
              <div className={`editor-document-bar__title ${styles.editorDocumentBarTitle}`}>
                <h1 data-wp-c16t="true" data-wp-component="Text" className="components-truncate components-text css-hfddxo e19lxcc00">
                  <span className="editor-document-bar__post-title">Privacy Policy</span>
                  <span className="editor-document-bar__post-type-label">· Page</span>
                </h1>
              </div>
              <span className="editor-document-bar__shortcut">Ctrl+K</span>
            </button>
          </div>
          <div id="cb-toolbar-center-host" className="cb-toolbar-center-host" aria-hidden="true" />
        </div>
        <div className={`editor-header__settings ${styles.editorHeaderSettings}`}>
          <div className="store-setup-button-container">
            <button
              type="button"
              id="cb-save"
              aria-disabled="false"
              className="components-button editor-post-save-draft is-compact is-tertiary"
              aria-label="Save draft"
            >
              Save draft
            </button>
            <div className="components-dropdown components-dropdown-menu editor-preview-dropdown editor-preview-dropdown--desktop" tabIndex={-1}>
              <button
                type="button"
                id="cb-preview-toggle"
                aria-haspopup="true"
                aria-expanded="false"
                className="components-button editor-preview-dropdown__toggle components-dropdown-menu__toggle is-compact has-icon has-icon-right"
                aria-label="View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
                  <path d="M20.5 16h-.7V8c0-1.1-.9-2-2-2H6.2c-1.1 0-2 .9-2 2v8h-.7c-.8 0-1.5.7-1.5 1.5h20c0-.8-.7-1.5-1.5-1.5zM5.7 8c0-.3.2-.5.5-.5h11.6c.3 0 .5.2.5.5v7.6H5.7V8z" />
                </svg>
              </button>
              <div id="cb-preview-menu" className="cb-menu" hidden>
                <button type="button" data-preview-device="desktop">Desktop preview</button>
                <button type="button" data-preview-device="tablet">Tablet preview</button>
                <button type="button" data-preview-device="mobile">Mobile preview</button>
                <button type="button" id="cb-view-published" data-preview-action="published" hidden>View published page</button>
              </div>
            </div>
            <div className="interface-pinned-items">
              <button
                type="button"
                id="cb-edit-pages"
                aria-pressed="false"
                data-aria-controls="gutenberg-edit-pages-panel:gutenberg-edit-pages-panel"
                aria-expanded="false"
                aria-disabled="false"
                className="components-button is-compact has-icon"
                aria-label="Edit Pages"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
                  <path d="M14.5 5.5h-7V7h7V5.5ZM7.5 9h7v1.5h-7V9Zm7 3.5h-7V14h7v-1.5Z" />
                  <path d="M16 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2ZM6 3.5h10a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5Z" />
                  <path d="M20 8v11c0 .69-.31 1-.999 1H6v1.5h13c1.52 0 2.499-.982 2.499-2.5V8H20Z" />
                </svg>
              </button>
              <button
                type="button"
                id="cb-settings"
                aria-pressed="true"
                data-aria-controls="edit-post:block"
                aria-expanded="true"
                aria-disabled="false"
                className="components-button is-compact is-pressed has-icon"
                aria-label="Settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
                  <path fillRule="evenodd" clipRule="evenodd" d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-4 14.5H6c-.3 0-.5-.2-.5-.5V6c0-.3.2-.5.5-.5h8v13zm4.5-.5c0 .3-.2.5-.5.5h-2.5v-13H18c.3 0 .5.2.5.5v12z" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              id="cb-publish"
              aria-disabled="false"
              aria-expanded="false"
              className="components-button editor-post-publish-panel__toggle editor-post-publish-button__button is-primary is-compact"
            >
              Publish
            </button>
            <div className="components-dropdown components-dropdown-menu" tabIndex={-1}>
              <button
                type="button"
                id="cb-more"
                aria-haspopup="true"
                aria-expanded="false"
                className="components-button components-dropdown-menu__toggle is-compact has-icon"
                aria-label="Options"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
                  <path d="M13 19h-2v-2h2v2zm0-6h-2v-2h2v2zm0-6h-2V5h2v2z" />
                </svg>
              </button>
              <div id="cb-more-menu" className="cb-menu" hidden>
                <button type="button" data-action="toggle-top-toolbar">Top toolbar</button>
                <button type="button" data-action="toggle-spotlight">Spotlight mode</button>
                <button type="button" data-action="toggle-fullscreen">Fullscreen mode</button>
                <button type="button" data-action="copy-content">Copy all content</button>
                <button type="button" data-action="keyboard-shortcuts">Keyboard shortcuts</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main id="pe-app" className="page-wrap pe-app">
        <div className="editor-shell">
          <aside className="panel" id="pe-inserter-panel">
            <button className="panel-toggle" id="pe-toggle-left" aria-label="Toggle blocks panel">
              ☰
            </button>
            <div className="panel-content">
              <h2>Blocks</h2>
              <div id="pe-inserter-modes" className="pe-inline-row" />
              <div id="pe-mru" className="pe-status-line" />
              <div id="pe-patterns" className="pe-patterns" />
              <label className="pe-search-label">
                <input id="pe-inserter-search" className="pe-search-input" placeholder="Search blocks" />
              </label>
              <div id="pe-block-groups" />
            </div>
          </aside>

          <section className="panel canvas">
            <h2>Canvas</h2>
            <label>
              Title
              <input id="pe-canvas-title" className="pe-canvas-input" />
            </label>
            <div id="pe-editor-canvas" className="pe-editor-canvas" />
          </section>

          <aside className="panel" id="pe-inspector">
            <button className="panel-toggle" id="pe-toggle-right" aria-label="Toggle inspector panel">
              ☰
            </button>
            <div className="panel-content">
              <div className="pe-inspector-tabs">
                <button id="pe-tab-page" className="pe-inspector-tab active" data-tab="page">
                  Page
                </button>
                <button id="pe-tab-block" className="pe-inspector-tab" data-tab="block">
                  Block
                </button>
                <div id="pe-inspector-unsaved" className="pe-inspector-unsaved" title="Unsaved changes" hidden>
                  ●
                </div>
              </div>
              <div id="pe-inspector-content">Select a block</div>
            </div>
          </aside>
        </div>
      </main>
    </>
  )
}
