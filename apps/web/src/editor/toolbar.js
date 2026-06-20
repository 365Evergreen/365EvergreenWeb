/* Floating block toolbar: contextual controls for text blocks */
(function(){
  if (!window.EditorCore) return;

  const TOOLBAR_BLOCK_TYPES = new Set(['paragraph', 'heading', 'list', 'code', 'image', 'gallery', 'video', 'audio', 'file', 'media-text']);
  const RICH_TEXT_TYPES = new Set(['paragraph', 'heading', 'list']);
  const EditorGalleryUtils = window.EditorGalleryUtils || {};
  const PrivateMediaLibrary = window.PrivateMediaLibrary || null;
  const UPSERT_POST_PATH = '/upsert-post';
  const GET_POST_ADMIN_PATH = '/get-post-admin';
  const configuredApiBase = typeof window.PAGE_MANAGER_API_BASE === 'string' ? window.PAGE_MANAGER_API_BASE.trim() : '';
  const API_BASE = configuredApiBase || '/api';
  const CREATE_PAGE_PATH = '/create-page';
  const EDIT_PAGE_PATH = '/edit-page';
  const routeParams = new URLSearchParams(window.location.search);
  const editorKind = String(routeParams.get('kind') || 'page').toLowerCase() === 'post' ? 'post' : 'page';

  const FONT_SIZE_OPTIONS = [
    ['', 'Default'],
    ['0.875rem', 'S'],
    ['1rem', 'M'],
    ['1.125rem', 'L'],
    ['1.25rem', 'XL'],
    ['1.5rem', '2XL'],
    ['2rem', '3XL']
  ];
  const FONT_WEIGHT_OPTIONS = [
    ['', 'Default'],
    ['400', 'Regular'],
    ['500', 'Medium'],
    ['600', 'Semibold'],
    ['700', 'Bold']
  ];
  const LINE_HEIGHT_OPTIONS = [
    ['', 'Default'],
    ['1.4', 'Tight'],
    ['1.6', 'Normal'],
    ['1.8', 'Relaxed'],
    ['2', 'Loose']
  ];
  const LIST_GAP_OPTIONS = [
    ['', 'Gap'],
    ['0.25rem', 'XS'],
    ['0.5rem', 'S'],
    ['0.75rem', 'M'],
    ['1rem', 'L'],
    ['1.5rem', 'XL']
  ];
  const LIST_INDENT_OPTIONS = [
    ['', 'Indent'],
    ['1.25rem', 'S'],
    ['1.5rem', 'M'],
    ['2rem', 'L'],
    ['2.5rem', 'XL']
  ];
  const UNORDERED_MARKER_OPTIONS = [
    ['disc', 'Disc'],
    ['circle', 'Circle'],
    ['square', 'Square']
  ];
  const ORDERED_MARKER_OPTIONS = [
    ['decimal', '1.'],
    ['lower-alpha', 'a.'],
    ['upper-alpha', 'A.'],
    ['lower-roman', 'i.'],
    ['upper-roman', 'I.']
  ];
  const ALIGN_OPTIONS = [
    ['left', 'Left'],
    ['center', 'Center'],
    ['right', 'Right'],
    ['justify', 'Justify']
  ];
  const TRANSFORM_OPTIONS = [
    ['paragraph', 'Paragraph'],
    ['heading', 'Heading'],
    ['list', 'List'],
    ['code', 'Code']
  ];
  const CODE_LANGUAGE_OPTIONS = [
    ['', 'Language'],
    ['html', 'HTML'],
    ['json', 'JSON'],
    ['css', 'CSS'],
    ['yaml', 'YAML']
  ];
  const GALLERY_COLUMN_OPTIONS = Array.from({ length: 8 }, (_, index) => [String(index + 1), `${index + 1} col`]);
  const GALLERY_LINK_OPTIONS = [
    ['none', 'No link'],
    ['media', 'Media file'],
    ['attachment', 'Attachment page']
  ];
  const GALLERY_LAYOUT_OPTIONS = [
    ['default', 'Default'],
    ['wide', 'Wide'],
    ['full', 'Full']
  ];
  let selectedBlock = null;
  let selectedListItemPath = null;
  let selectedGalleryImageId = null;
  let savedRange = null;

  const ICONS = {
    drag: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M8 7h2V5H8v2zm0 6h2v-2H8v2zm0 6h2v-2H8v2zm6-14v2h2V5h-2zm0 8h2v-2h-2v2zm0 6h2v-2h-2v2z"></path></svg>',
    up: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M6.5 12.4L12 8l5.5 4.4-.9 1.2L12 10l-4.5 3.6-1-1.2z"></path></svg>',
    down: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z"></path></svg>',
    align: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M19 5.5H5V4h14v1.5ZM19 20H5v-1.5h14V20ZM5 9h14v6H5V9Z"></path></svg>',
    link: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M10 17.389H8.444A5.194 5.194 0 1 1 8.444 7H10v1.5H8.444a3.694 3.694 0 0 0 0 7.389H10v1.5ZM14 7h1.556a5.194 5.194 0 0 1 0 10.39H14v-1.5h1.556a3.694 3.694 0 0 0 0-7.39H14V7Zm-4.5 6h5v-1.5h-5V13Z"></path></svg>',
    more: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M13 19h-2v-2h2v2zm0-6h-2v-2h2v2zm0-6h-2V5h2v2z"></path></svg>',
    plus: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z"></path></svg>',
    code: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M8.5 7.5 4 12l4.5 4.5 1.1-1.1L6.2 12l3.4-3.4-1.1-1.1Zm7 0-1.1 1.1 3.4 3.4-3.4 3.4 1.1 1.1L20 12l-4.5-4.5Z"></path></svg>',
    gallery: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.375 4.5H4.625a.125.125 0 0 0-.125.125v8.254l2.859-1.54a.75.75 0 0 1 .68-.016l2.384 1.142 2.89-2.074a.75.75 0 0 1 .874 0l2.313 1.66V4.625a.125.125 0 0 0-.125-.125Zm.125 9.398-2.75-1.975-2.813 2.02a.75.75 0 0 1-.76.067l-2.444-1.17L4.5 14.583v1.792c0 .069.056.125.125.125h11.75a.125.125 0 0 0 .125-.125v-2.477ZM4.625 3C3.728 3 3 3.728 3 4.625v11.75C3 17.273 3.728 18 4.625 18h11.75c.898 0 1.625-.727 1.625-1.625V4.625C18 3.728 17.273 3 16.375 3H4.625ZM20 8v11c0 .69-.31 1-.999 1H6v1.5h13.001c1.52 0 2.499-.982 2.499-2.5V8H20Z"></path></svg>',
    image: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M19 7c0-1.1-.9-2-2-2H7C5.9 5 5 5.9 5 7v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V7ZM7 7h10v6.2l-2.7-2.7a1 1 0 0 0-1.4 0L10 13.4l-1.3-1.3a1 1 0 0 0-1.4 0L7 12.4V7Zm0 10v-2.5l1-1 1.3 1.3a1 1 0 0 0 1.4 0l2.9-2.9 3.4 3.4V17H7Z"></path></svg>',
    paragraph: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="m9.996 14-.003-.225.004.0001V20h1.5V5.5h2.5V20h1.5V5.5h3V4H9.996c-2.761 0-5 2.239-5 5s2.239 5 5 5Z"></path></svg>',
    heading: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M6 5h2v6h8V5h2v14h-2v-6H8v6H6V5Z"></path></svg>',
    list: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M9 6h11v1.5H9V6Zm0 5.25h11v1.5H9v-1.5ZM9 16.5h11V18H9v-1.5ZM5.25 6.75A1.25 1.25 0 1 1 2.75 6.75a1.25 1.25 0 0 1 2.5 0Zm0 5.25a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Zm0 5.25a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z"></path></svg>',
    trash: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M9 4h6l1 1h4v1.5H4V5h4l1-1Zm-.5 5h1.5v8H8.5V9Zm5.5 0h1.5v8H14V9ZM6.5 8h11l-.7 11.2A1.5 1.5 0 0 1 15.3 20H8.7a1.5 1.5 0 0 1-1.5-1.3L6.5 8Z"></path></svg>'
  };

  function createControl(tagName, className, attributes){
    const element = document.createElement(tagName);
    if (className) element.className = className;
    Object.entries(attributes || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) element.setAttribute(key, value);
    });
    return element;
  }

  function createIcon(name) {
    const icon = createControl('span', 'block-editor-block-icon pe-toolbar-icon');
    icon.innerHTML = ICONS[name] || '';
    return icon;
  }

  function createVisuallyHidden(text) {
    const hidden = createControl('span', 'components-visually-hidden');
    hidden.textContent = text;
    return hidden;
  }

  function createButton(label, action, title, options){
    const settings = Object.assign({
      classes: '',
      icon: '',
      iconOnly: false,
      isToggle: false,
      control: true
    }, options || {});
    const className = ['components-button', 'components-toolbar-button', 'pe-floating-toolbar__button', settings.classes].filter(Boolean).join(' ');
    const button = createControl('button', className, {
      type: 'button',
      'data-action': action,
      'aria-label': title || label,
      title: title || label,
      'data-toolbar-control': settings.control ? 'true' : null
    });
    if (settings.isToggle) button.setAttribute('aria-pressed', 'false');
    if (settings.icon) button.appendChild(createIcon(settings.icon));
    if (!settings.iconOnly && label) {
      const labelSpan = createControl('span', 'pe-toolbar-button__label');
      labelSpan.textContent = label;
      button.appendChild(labelSpan);
    }
    if (settings.iconOnly && title) button.appendChild(createVisuallyHidden(title));
    return button;
  }

  function createSelect(options, action, title, extraClasses, control){
    const select = createControl('select', ['pe-floating-toolbar__select', extraClasses].filter(Boolean).join(' '), {
      'data-action': action,
      'aria-label': title,
      'data-toolbar-control': control === false ? null : 'true'
    });
    options.forEach(([value, label]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    });
    return select;
  }

  function openNativePicker(select) {
    if (!select) return;
    if (typeof select.showPicker === 'function') {
      select.showPicker();
      return;
    }
    select.focus();
    select.click();
  }

  const toolbar = createControl('div', 'components-popover__content components-accessible-toolbar block-editor-block-contextual-toolbar pe-floating-toolbar', {
    id: 'pe-floating-toolbar',
    role: 'toolbar',
    'aria-orientation': 'horizontal',
    'aria-label': 'Block Tools',
    hidden: 'hidden'
  });

  const inner = createControl('div', 'block-editor-block-toolbar');
  const parentSelector = createControl('div', 'block-editor-block-parent-selector pe-floating-toolbar__parent');
  const parentSelectorButton = createButton('', 'select-parent', 'Select parent block', {
    classes: 'block-editor-block-parent-selector__button is-compact has-icon',
    icon: 'gallery',
    iconOnly: true
  });
  parentSelectorButton.hidden = true;
  parentSelector.appendChild(parentSelectorButton);

  const groupPrimary = createControl('div', 'components-toolbar-group block-editor-block-toolbar__block-controls pe-floating-toolbar__group');
  const blockSwitcher = createControl('div', 'components-dropdown components-dropdown-menu block-editor-block-switcher');
  const blockTypeButton = createButton('', 'open-transform-picker', 'Change block type or style', {
    classes: 'components-dropdown-menu__toggle has-icon pe-floating-toolbar__trigger',
    icon: 'paragraph',
    iconOnly: true
  });
  const blockTypeIcon = blockTypeButton.querySelector('.pe-toolbar-icon');
  const blockTypeSelect = createSelect(TRANSFORM_OPTIONS, 'transform', 'Change block type or style', 'pe-floating-toolbar__native-picker', false);
  blockTypeSelect.tabIndex = -1;
  blockSwitcher.append(blockTypeButton, blockTypeSelect);

  const mover = createControl('div', 'components-toolbar-group block-editor-block-mover pe-floating-toolbar__mover');
  const dragHandleButton = createButton('', 'noop', 'Drag block', {
    classes: 'block-editor-block-mover__drag-handle is-next-40px-default-size has-icon',
    icon: 'drag',
    iconOnly: true,
    control: false
  });
  dragHandleButton.disabled = true;
  dragHandleButton.setAttribute('aria-disabled', 'true');
  const moveButtonContainer = createControl('div', 'block-editor-block-mover__move-button-container');
  const moveUpButton = createButton('', 'move-up', 'Move up', {
    classes: 'block-editor-block-mover-button is-up-button is-next-40px-default-size has-icon',
    icon: 'up',
    iconOnly: true
  });
  const moveDownButton = createButton('', 'move-down', 'Move down', {
    classes: 'block-editor-block-mover-button is-down-button is-next-40px-default-size has-icon',
    icon: 'down',
    iconOnly: true
  });
  moveButtonContainer.append(moveUpButton, moveDownButton);
  mover.append(dragHandleButton, moveButtonContainer);
  groupPrimary.append(blockSwitcher, mover);

  const groupAlignment = createControl('div', 'components-toolbar-group pe-floating-toolbar__group');
  const alignWrap = createControl('div', 'components-dropdown components-dropdown-menu');
  const alignButton = createButton('', 'open-align-picker', 'Change text alignment', {
    classes: 'components-dropdown-menu__toggle has-icon pe-floating-toolbar__trigger',
    icon: 'align',
    iconOnly: true
  });
  const alignSelect = createSelect(ALIGN_OPTIONS, 'align', 'Change text alignment', 'pe-floating-toolbar__native-picker', false);
  alignSelect.tabIndex = -1;
  alignWrap.append(alignButton, alignSelect);
  groupAlignment.appendChild(alignWrap);

  const groupInline = createControl('div', 'components-toolbar-group pe-floating-toolbar__group');
  const boldButton = createButton('B', 'bold', 'Bold', { classes: 'is-compact' });
  const italicButton = createButton('I', 'italic', 'Italic', { classes: 'is-compact' });
  const linkButton = createButton('', 'link', 'Link', { classes: 'is-compact has-icon', icon: 'link', iconOnly: true });
  groupInline.append(boldButton, italicButton, linkButton);

  const groupTypography = createControl('div', 'components-toolbar-group pe-floating-toolbar__group');
  const fontSizeSelect = createSelect(FONT_SIZE_OPTIONS, 'font-size', 'Font size', 'pe-floating-toolbar__dropdown');
  const fontWeightSelect = createSelect(FONT_WEIGHT_OPTIONS, 'font-weight', 'Font weight', 'pe-floating-toolbar__dropdown');
  const lineHeightSelect = createSelect(LINE_HEIGHT_OPTIONS, 'line-height', 'Line height', 'pe-floating-toolbar__dropdown');
  groupTypography.append(fontSizeSelect, fontWeightSelect, lineHeightSelect);

  const groupColors = createControl('div', 'components-toolbar-group pe-floating-toolbar__group');
  const textColorInput = createControl('input', 'pe-floating-toolbar__color', {
    type: 'color',
    'data-action': 'text-color',
    'aria-label': 'Text color',
    'data-toolbar-control': 'true'
  });
  const backgroundColorInput = createControl('input', 'pe-floating-toolbar__color', {
    type: 'color',
    'data-action': 'background-color',
    'aria-label': 'Background color',
    'data-toolbar-control': 'true'
  });
  const resetStylesButton = createButton('Reset', 'reset-styles', 'Reset text styles');
  groupColors.append(textColorInput, backgroundColorInput, resetStylesButton);

  const groupSecondary = createControl('div', 'components-toolbar-group pe-floating-toolbar__group');
  const headingLevelSelect = createSelect([
    ['1', 'H1'],
    ['2', 'H2'],
    ['3', 'H3'],
    ['4', 'H4'],
    ['5', 'H5'],
    ['6', 'H6']
  ], 'heading-level', 'Change heading level', 'pe-floating-toolbar__dropdown');
  const codeLanguageSelect = createSelect(CODE_LANGUAGE_OPTIONS, 'language', 'Change code language', 'pe-floating-toolbar__dropdown');
  const toggleListModeButton = createButton('1.', 'toggle-list', 'Toggle ordered list', { classes: 'is-compact' });
  const markerStyleSelect = createSelect(UNORDERED_MARKER_OPTIONS, 'marker-style', 'Change list marker style', 'pe-floating-toolbar__dropdown');
  const itemGapSelect = createSelect(LIST_GAP_OPTIONS, 'item-gap', 'Change list item spacing', 'pe-floating-toolbar__dropdown');
  const indentWidthSelect = createSelect(LIST_INDENT_OPTIONS, 'indent-width', 'Change list indentation', 'pe-floating-toolbar__dropdown');
  groupSecondary.append(headingLevelSelect, codeLanguageSelect, toggleListModeButton, markerStyleSelect, itemGapSelect, indentWidthSelect);

  const groupMedia = createControl('div', 'components-toolbar-group pe-floating-toolbar__group');
  const uploadButton = createButton('Upload', 'upload-image', 'Upload image');
  const libraryButton = createButton('Media Library', 'media-library', 'Choose from library');
  const urlButton = createButton('Insert URL', 'insert-image-url', 'Insert image from URL');
  const replaceImageButton = createButton('Replace', 'replace-image', 'Replace image (URL)');
  const focalPointButton = createButton('Focus', 'focal-point', 'Set focal point');
  groupMedia.append(uploadButton, libraryButton, urlButton, replaceImageButton, focalPointButton);

  const groupGallery = createControl('div', 'components-toolbar-group pe-floating-toolbar__group');
  const galleryAddImagesButton = createButton('Add', 'gallery-add-images', 'Add images to gallery', { classes: 'is-compact' });
  const galleryColumnsSelect = createSelect(GALLERY_COLUMN_OPTIONS, 'gallery-columns', 'Change gallery columns', 'pe-floating-toolbar__dropdown');
  const galleryCropToggleButton = createButton('Crop', 'gallery-crop-toggle', 'Toggle gallery crop', { classes: 'is-compact', isToggle: true });
  const galleryLinkSelect = createSelect(GALLERY_LINK_OPTIONS, 'gallery-link-to', 'Change gallery link behavior', 'pe-floating-toolbar__dropdown');
  const galleryLightboxToggleButton = createButton('Lightbox', 'gallery-lightbox-toggle', 'Toggle gallery lightbox', { classes: 'is-compact', isToggle: true });
  const galleryLayoutSelect = createSelect(GALLERY_LAYOUT_OPTIONS, 'gallery-layout', 'Change gallery width', 'pe-floating-toolbar__dropdown');
  const galleryToImagesButton = createButton('To images', 'gallery-to-images', 'Convert gallery to image blocks');
  groupGallery.append(galleryAddImagesButton, galleryColumnsSelect, galleryCropToggleButton, galleryLinkSelect, galleryLightboxToggleButton, galleryLayoutSelect, galleryToImagesButton);

  const groupGalleryImage = createControl('div', 'components-toolbar-group pe-floating-toolbar__group');
  const galleryReplaceImageButton = createButton('Replace', 'gallery-replace-image', 'Replace gallery image');
  const galleryRemoveImageButton = createButton('Remove', 'gallery-remove-image', 'Remove gallery image');
  const galleryImageLinkButton = createButton('', 'gallery-image-link', 'Set gallery image link behavior', { classes: 'is-compact has-icon', icon: 'link', iconOnly: true });
  const galleryImageCropButton = createButton('Crop', 'gallery-image-crop-toggle', 'Toggle gallery crop', { classes: 'is-compact', isToggle: true });
  const galleryToGalleryButton = createButton('To gallery', 'gallery-to-gallery', 'Convert selected image blocks to a gallery');
  groupGalleryImage.append(galleryReplaceImageButton, galleryRemoveImageButton, galleryImageLinkButton, galleryImageCropButton, galleryToGalleryButton);

  const groupOptions = createControl('div', 'components-toolbar-group pe-floating-toolbar__group pe-floating-toolbar__group--menu');
  const optionsMenuWrap = createControl('div', 'components-dropdown components-dropdown-menu block-editor-block-settings-menu pe-floating-toolbar__menu-wrap');
  const optionsButton = createButton('', 'toggle-options-menu', 'Options', {
    classes: 'components-dropdown-menu__toggle has-icon',
    icon: 'more',
    iconOnly: true
  });
  const optionsMenu = createControl('div', 'pe-floating-toolbar__menu', { hidden: 'hidden' });
  const deleteButton = createButton('Delete block', 'delete', 'Delete block', {
    classes: 'pe-floating-toolbar__menu-button',
    icon: 'trash',
    control: false
  });
  optionsMenu.appendChild(deleteButton);
  optionsMenuWrap.append(optionsButton, optionsMenu);
  groupOptions.appendChild(optionsMenuWrap);
  const popoverPanel = createControl('div', 'pe-floating-toolbar__popover-panel', { hidden: 'hidden' });
  popoverPanel.style.position = 'absolute';
  popoverPanel.style.top = 'calc(100% + 8px)';
  popoverPanel.style.right = '0';
  popoverPanel.style.minWidth = '260px';
  popoverPanel.style.maxWidth = '320px';
  popoverPanel.style.padding = '12px';
  popoverPanel.style.border = '1px solid #d1d5db';
  popoverPanel.style.borderRadius = '12px';
  popoverPanel.style.background = '#ffffff';
  popoverPanel.style.boxShadow = '0 18px 40px rgba(15, 23, 42, 0.18)';
  popoverPanel.style.zIndex = '2';

  inner.append(parentSelector, groupPrimary, groupAlignment, groupInline, groupTypography, groupColors, groupMedia, groupGallery, groupGalleryImage, groupSecondary, groupOptions);
  toolbar.appendChild(inner);
  toolbar.appendChild(popoverPanel);
  document.body.appendChild(toolbar);

  const controlRegistry = {
    transform: blockTypeButton,
    'move-up': moveUpButton,
    'move-down': moveDownButton,
    align: alignButton,
    bold: boldButton,
    italic: italicButton,
    link: linkButton,
    'font-size': fontSizeSelect,
    'font-weight': fontWeightSelect,
    'line-height': lineHeightSelect,
    'text-color': textColorInput,
    'background-color': backgroundColorInput,
    'reset-styles': resetStylesButton,
    'heading-level': headingLevelSelect,
    'upload-image': uploadButton,
    'media-library': libraryButton,
    'insert-image-url': urlButton,
    'replace-image': replaceImageButton,
    'focal-point': focalPointButton,
    'gallery-add-images': galleryAddImagesButton,
    'gallery-columns': galleryColumnsSelect,
    'gallery-crop-toggle': galleryCropToggleButton,
    'gallery-link-to': galleryLinkSelect,
    'gallery-lightbox-toggle': galleryLightboxToggleButton,
    'gallery-layout': galleryLayoutSelect,
    'gallery-to-images': galleryToImagesButton,
    'gallery-replace-image': galleryReplaceImageButton,
    'gallery-remove-image': galleryRemoveImageButton,
    'gallery-image-link': galleryImageLinkButton,
    'gallery-image-crop-toggle': galleryImageCropButton,
    'gallery-to-gallery': galleryToGalleryButton,
    language: codeLanguageSelect,
    'toggle-list': toggleListModeButton,
    'marker-style': markerStyleSelect,
    'item-gap': itemGapSelect,
    'indent-width': indentWidthSelect,
    options: optionsButton
  };
  const toolbarGroups = [parentSelector, groupPrimary, groupAlignment, groupInline, groupTypography, groupColors, groupMedia, groupGallery, groupGalleryImage, groupSecondary, groupOptions];

  function getBlockElement(block){
    if (!block || !block.id) return null;
    return document.querySelector(`[data-block-id='${block.id}']`) || document.querySelector(`[data-id='${block.id}']`);
  }

  function getSelectionContainer(selection) {
    if (!selection) return null;
    const node = selection.anchorNode && selection.anchorNode.nodeType === 1
      ? selection.anchorNode
      : selection.anchorNode && selection.anchorNode.parentElement;
    return node && node.closest ? node.closest('[data-block-id], [data-id], [contenteditable]') : null;
  }

  function getEditableElement(block){
    const element = getBlockElement(block);
    if (!element) return null;
    if (block.type === 'list') {
      const active = document.activeElement && document.activeElement.closest ? document.activeElement.closest('li[contenteditable]') : null;
      return active || element.querySelector('li[contenteditable]');
    }
    return element.matches('[contenteditable]') ? element : element.querySelector('[contenteditable]');
  }

  function getSelectedListItemElement(block){
    if (!block || block.type !== 'list') return null;
    const element = getBlockElement(block);
    if (!element) return null;
    const active = document.activeElement && document.activeElement.closest ? document.activeElement.closest('.pe-list-item-content[data-item-path]') : null;
    if (active && element.contains(active)) return active;
    return null;
  }

  function getSelectedGalleryImageElement(block) {
    if (!block || block.type !== 'gallery' || !selectedGalleryImageId) return null;
    const element = getBlockElement(block);
    if (!element) return null;
    return element.querySelector(`.pe-gallery-item[data-image-id='${selectedGalleryImageId}']`);
  }

  function getGalleryImages(block) {
    return typeof EditorGalleryUtils.normalizeGalleryImages === 'function'
      ? EditorGalleryUtils.normalizeGalleryImages(block && block.attrs ? block.attrs.images : [])
      : [];
  }

  function updateGalleryAttrs(patch) {
    if (!selectedBlock || selectedBlock.type !== 'gallery') return;
    EditorCore.setBlockAttrs(selectedBlock.id, patch);
  }

  function updateGalleryStyle(patch) {
    if (!selectedBlock || selectedBlock.type !== 'gallery') return;
    const currentStyle = selectedBlock.attrs && selectedBlock.attrs.style ? selectedBlock.attrs.style : {};
    const nextStyle = Object.assign({}, currentStyle, patch || {});
    if (patch && patch.spacing) nextStyle.spacing = Object.assign({}, currentStyle.spacing || {}, patch.spacing);
    if (patch && patch.border) nextStyle.border = Object.assign({}, currentStyle.border || {}, patch.border);
    updateGalleryAttrs({ style: nextStyle });
  }

  function updateSelectedGalleryImage(patch) {
    if (!selectedBlock || selectedBlock.type !== 'gallery' || !selectedGalleryImageId) return;
    const images = getGalleryImages(selectedBlock).map((image) => image.id === selectedGalleryImageId ? Object.assign({}, image, patch || {}) : image);
    updateGalleryAttrs({ images });
    EditorCore.emit('gallery:selection', { blockId: selectedBlock.id, imageId: selectedGalleryImageId });
  }

  function removeSelectedGalleryImage() {
    if (!selectedBlock || selectedBlock.type !== 'gallery' || !selectedGalleryImageId) return;
    const images = getGalleryImages(selectedBlock).filter((image) => image.id !== selectedGalleryImageId);
    updateGalleryAttrs({ images });
    EditorCore.emit('gallery:selection', { blockId: selectedBlock.id, imageId: images[0] ? images[0].id : null });
  }

  function mediaItemsToGalleryImages(items) {
    const sources = (Array.isArray(items) ? items : []).map((item) => item && (item.urlPath || item.path || item.src) ? (item.urlPath || item.path || item.src) : '').filter(Boolean);
    if (typeof EditorGalleryUtils.createGalleryImagesFromSources === 'function') {
      return EditorGalleryUtils.createGalleryImagesFromSources(sources);
    }
    return sources.map((src, index) => ({ id: `gallery-image-${Date.now()}-${index}`, src: src, alt: '', caption: '' }));
  }

  async function openMediaLibraryPicker(options) {
    if (!PrivateMediaLibrary || typeof PrivateMediaLibrary.openPicker !== 'function') return null;
    try {
      return await PrivateMediaLibrary.openPicker(Object.assign({
        sourceId: 'web',
        title: 'Choose from media library'
      }, options || {}));
    } catch (error) {
      if (error && error.message && error.message !== 'Picker closed.') {
        window.alert(error.message);
      }
      return null;
    }
  }

  function triggerImageUpload(onUploaded) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/avif,image/gif,image/jpeg,image/png,image/svg+xml,image/webp';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', async (ev) => {
      const file = ev.target.files && ev.target.files[0];
      input.remove();
      if (!file) return;
      if (PrivateMediaLibrary && typeof PrivateMediaLibrary.uploadMedia === 'function') {
        try {
          const uploaded = await PrivateMediaLibrary.uploadMedia(file, { sourceId: 'web' });
          onUploaded(uploaded);
        } catch (error) {
          window.alert(error.message || 'Could not upload the selected image.');
        }
        return;
      }
      const url = URL.createObjectURL(file);
      onUploaded({ urlPath: url, name: file.name });
    }, { once: true });
    input.click();
  }

  if (PrivateMediaLibrary && typeof PrivateMediaLibrary.openPicker === 'function') {
    EditorGalleryUtils.chooseGalleryImages = function (options) {
      return openMediaLibraryPicker({
        title: options && options.multiple ? 'Choose gallery images' : 'Choose gallery image',
        multiple: !!(options && options.multiple)
      }).then((selection) => mediaItemsToGalleryImages(Array.isArray(selection) ? selection : (selection ? [selection] : [])));
    };
  }

  function closeOptionsMenu() {
    optionsMenu.hidden = true;
    optionsButton.setAttribute('aria-expanded', 'false');
  }

  function closePopover() {
    popoverPanel.hidden = true;
    popoverPanel.innerHTML = '';
    delete toolbar.dataset.activePopover;
  }

  function toggleOptionsMenu() {
    const nextHidden = !optionsMenu.hidden;
    optionsMenu.hidden = nextHidden;
    optionsButton.setAttribute('aria-expanded', nextHidden ? 'false' : 'true');
  }

  function hideToolbar(){
    closeOptionsMenu();
    closePopover();
    toolbar.hidden = true;
  }

  function showToolbar(block){
    const element = block && block.type === 'gallery' && selectedGalleryImageId
      ? getSelectedGalleryImageElement(block) || getBlockElement(block)
      : getBlockElement(block);
    if (!element) {
      hideToolbar();
      return;
    }
    toolbar.hidden = false;
    const rect = element.getBoundingClientRect();
    const top = Math.max(8, window.scrollY + rect.top - toolbar.offsetHeight - 10);
    const viewportRight = window.scrollX + document.documentElement.clientWidth;
    const preferredLeft = window.scrollX + rect.left + ((rect.width - toolbar.offsetWidth) / 2);
    const left = Math.min(Math.max(8, preferredLeft), Math.max(8, viewportRight - toolbar.offsetWidth - 8));
    toolbar.style.top = `${top}px`;
    toolbar.style.left = `${left}px`;
  }

  function getBlockDefinition(block) {
    const defs = window.EDITOR_BLOCK_DEFINITIONS || {};
    return block && block.type ? defs[block.type] || null : null;
  }

  function normalizeToolbarControls(value) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
  }

  function getToolbarTokens(block) {
    const def = getBlockDefinition(block);
    const toolbarConfig = def && def.controls ? def.controls.toolbar : null;
    if (Array.isArray(toolbarConfig)) {
      return {
        inline: normalizeToolbarControls(toolbarConfig),
        ellipsis: []
      };
    }
    if (toolbarConfig && typeof toolbarConfig === 'object') {
      return {
        inline: normalizeToolbarControls(toolbarConfig.default),
        ellipsis: normalizeToolbarControls(toolbarConfig.ellipsis)
      };
    }
    return { inline: [], ellipsis: [] };
  }

  function addMappedToolbarActions(actions, block, tokens) {
    const type = block && block.type ? block.type : '';
    normalizeToolbarControls(tokens).forEach((token) => {
      switch (token) {
        case 'align':
          actions.add('align');
          break;
        case 'bold':
          actions.add('bold');
          break;
        case 'italic':
          actions.add('italic');
          break;
        case 'link':
          actions.add('link');
          break;
        case 'level':
          actions.add('heading-level');
          break;
        case 'ordered-toggle':
          actions.add('toggle-list');
          break;
        case 'replace':
          if (type === 'image') actions.add('replace-image');
          else if (type === 'gallery') actions.add('gallery-add-images');
          break;
        case 'add':
          if (type === 'gallery') actions.add('gallery-add-images');
          break;
        case 'crop-images':
          if (type === 'gallery') actions.add('gallery-crop-toggle');
          break;
        case 'crop':
        case 'cover-transform':
          if (type === 'image') actions.add('focal-point');
          break;
        case 'more':
        case 'common':
          actions.add('options');
          break;
        default:
          break;
      }
    });
  }

  function getBlockPopovers(block) {
    const def = getBlockDefinition(block);
    return def && def.popovers && typeof def.popovers === 'object' ? def.popovers : {};
  }

  function getSelectedAnchor() {
    const selection = window.getSelection();
    const candidates = [];
    if (selection && selection.anchorNode) candidates.push(selection.anchorNode);
    if (selection && selection.focusNode) candidates.push(selection.focusNode);
    if (savedRange && savedRange.commonAncestorContainer) candidates.push(savedRange.commonAncestorContainer);
    for (const node of candidates) {
      const element = node && node.nodeType === 1 ? node : node && node.parentElement;
      if (!element) continue;
      const anchor = element.closest ? element.closest('a') : null;
      if (anchor) return anchor;
    }
    return null;
  }

  function getNestedValue(source, path) {
    return String(path || '').split('.').reduce((current, key) => (current && current[key] !== undefined ? current[key] : undefined), source);
  }

  function getFieldLabel(field) {
    return String(field || '')
      .split('.')
      .pop()
      .replace(/([A-Z])/g, ' $1')
      .replace(/[-_]/g, ' ')
      .replace(/^\w/, (char) => char.toUpperCase());
  }

  function getFieldConfig(field, block) {
    switch (field) {
      case 'href':
      case 'src':
      case 'poster':
        return { type: 'url', label: getFieldLabel(field) };
      case 'alt':
      case 'filename':
      case 'rel':
      case 'tracks':
        return { type: 'text', label: getFieldLabel(field) };
      case 'target':
        return { type: 'select', label: 'Target', options: [['', 'Same tab'], ['_blank', 'New tab']] };
      case 'fontSize':
        return { type: 'select', label: 'Font size', options: FONT_SIZE_OPTIONS };
      case 'fontWeight':
        return { type: 'select', label: 'Font weight', options: FONT_WEIGHT_OPTIONS };
      case 'lineHeight':
        return { type: 'select', label: 'Line height', options: LINE_HEIGHT_OPTIONS };
      case 'textColor':
      case 'backgroundColor':
        return { type: 'color', label: getFieldLabel(field) };
      case 'language':
        return { type: 'select', label: 'Language', options: CODE_LANGUAGE_OPTIONS };
      case 'markerStyle': {
        const ordered = !!(block && block.attrs && block.attrs.ordered);
        return { type: 'select', label: 'Marker style', options: ordered ? ORDERED_MARKER_OPTIONS : UNORDERED_MARKER_OPTIONS };
      }
      case 'itemGap':
        return { type: 'select', label: 'Item gap', options: LIST_GAP_OPTIONS };
      case 'indentWidth':
        return { type: 'select', label: 'Indent width', options: LIST_INDENT_OPTIONS };
      case 'linkTo':
        return { type: 'select', label: 'Link to', options: GALLERY_LINK_OPTIONS };
      case 'layout':
        return {
          type: 'select',
          label: 'Layout',
          options: block && block.type === 'gallery'
            ? GALLERY_LAYOUT_OPTIONS
            : [['media-left', 'Media left'], ['media-right', 'Media right']]
        };
      case 'preload':
        return { type: 'select', label: 'Preload', options: [['none', 'None'], ['metadata', 'Metadata'], ['auto', 'Auto']] };
      case 'focalPoint.x':
      case 'focalPoint.y':
        return { type: 'number', label: getFieldLabel(field), min: 0, max: 100, step: 1 };
      case 'ordered':
      case 'crop':
      case 'lightbox':
      case 'autoplay':
      case 'loop':
      case 'muted':
      case 'controls':
        return { type: 'checkbox', label: getFieldLabel(field) };
      default:
        return { type: 'text', label: getFieldLabel(field) };
    }
  }

  function getPopoverFieldValue(block, field) {
    const anchor = getSelectedAnchor();
    if (field === 'href') return anchor ? anchor.getAttribute('href') || '' : '';
    if (field === 'target') return anchor ? anchor.getAttribute('target') || '' : '';
    if (field === 'rel') return anchor ? anchor.getAttribute('rel') || '' : '';
    if (field === 'fontSize' || field === 'fontWeight' || field === 'lineHeight' || field === 'textColor' || field === 'backgroundColor') {
      const styleValue = getBlockStyle(block)[field];
      if (styleValue) return styleValue;
      if (field === 'textColor') return '#111827';
      if (field === 'backgroundColor') return '#ffffff';
      return '';
    }
    if (field === 'itemGap' || field === 'indentWidth') {
      return getListSpacing(block)[field] || '';
    }
    if (field === 'focalPoint.x' || field === 'focalPoint.y') {
      const value = getNestedValue(block && block.attrs ? block.attrs : {}, field);
      return value === undefined ? 50 : value;
    }
    if (field === 'layout' && block && block.type === 'gallery') {
      return block.attrs && block.attrs.style ? block.attrs.style.layout || 'default' : 'default';
    }
    const direct = getNestedValue(block && block.attrs ? block.attrs : {}, field);
    if (direct !== undefined) return direct;
    return '';
  }

  function renderPopoverField(block, field) {
    const config = getFieldConfig(field, block);
    const wrapper = createControl('label', 'pe-toolbar-popover-field');
    wrapper.style.display = 'grid';
    wrapper.style.gap = '4px';
    wrapper.style.marginBottom = '10px';
    const label = createControl('span', 'pe-toolbar-popover-label');
    label.textContent = config.label;
    label.style.fontSize = '12px';
    label.style.fontWeight = '600';
    wrapper.appendChild(label);
    const value = getPopoverFieldValue(block, field);
    let input;
    if (config.type === 'select') {
      input = createSelect(config.options || [], 'popover-field', config.label, 'pe-floating-toolbar__dropdown');
      input.value = String(value || '');
    } else if (config.type === 'checkbox') {
      input = createControl('input', 'pe-toolbar-popover-checkbox', { type: 'checkbox', 'data-action': 'popover-field' });
      input.checked = !!value;
      wrapper.style.gridTemplateColumns = 'auto 1fr';
      wrapper.style.alignItems = 'center';
    } else {
      input = createControl('input', 'pe-toolbar-popover-input', {
        type: config.type,
        'data-action': 'popover-field',
        min: config.min,
        max: config.max,
        step: config.step
      });
      input.value = value === undefined || value === null ? '' : String(value);
    }
    input.dataset.field = field;
    input.style.width = config.type === 'checkbox' ? '16px' : '100%';
    wrapper.appendChild(input);
    return wrapper;
  }

  function applyLinkPopoverValues(values) {
    if (!selectedBlock || !RICH_TEXT_TYPES.has(selectedBlock.type)) return;
    const editable = getEditableElement(selectedBlock);
    if (!editable) return;
    editable.focus();
    restoreSelection();
    const href = String(values.href || '').trim();
    let anchor = getSelectedAnchor();
    if (!href) return;
    if (!anchor) {
      wrapSelectionWithElement('a', {
        href,
        target: values.target || '_blank',
        rel: values.rel || 'noreferrer noopener'
      });
      anchor = getSelectedAnchor();
    }
    if (!anchor) return;
    anchor.setAttribute('href', href);
    if (values.target) anchor.setAttribute('target', values.target); else anchor.removeAttribute('target');
    if (values.rel) anchor.setAttribute('rel', values.rel); else anchor.removeAttribute('rel');
    rememberSelection();
    syncSelectedBlockContent();
  }

  function applyPopoverValues(popoverKey, values) {
    if (!selectedBlock || !popoverKey || !values) return;
    if (popoverKey === 'link') {
      applyLinkPopoverValues(values);
      return;
    }
    const patch = {};
    let listSpacingPatch = null;
    let stylePatch = null;
    Object.entries(values).forEach(([field, value]) => {
      if (field === 'fontSize' || field === 'fontWeight' || field === 'lineHeight' || field === 'textColor' || field === 'backgroundColor') {
        stylePatch = Object.assign(stylePatch || {}, { [field]: value });
        return;
      }
      if (field === 'itemGap' || field === 'indentWidth') {
        listSpacingPatch = Object.assign(listSpacingPatch || {}, { [field]: value });
        return;
      }
      if (field === 'focalPoint.x' || field === 'focalPoint.y') {
        const axis = field.endsWith('.x') ? 'x' : 'y';
        patch.focalPoint = Object.assign({}, selectedBlock.attrs && selectedBlock.attrs.focalPoint ? selectedBlock.attrs.focalPoint : { x: 50, y: 50 }, { [axis]: Number(value) || 0 });
        return;
      }
      if (field === 'layout' && selectedBlock.type === 'gallery') {
        updateGalleryStyle({ layout: value || 'default' });
        return;
      }
      patch[field] = value;
    });
    if (stylePatch) updateStyle(stylePatch);
    if (listSpacingPatch) updateListSpacing(listSpacingPatch);
    if (Object.keys(patch).length) EditorCore.setBlockAttrs(selectedBlock.id, patch);
  }

  function openPopover(popoverKey) {
    if (!selectedBlock) return;
    const popover = getBlockPopovers(selectedBlock)[popoverKey];
    if (!popover) return;
    closeOptionsMenu();
    popoverPanel.innerHTML = '';
    toolbar.dataset.activePopover = popoverKey;
    const title = createControl('div', 'pe-toolbar-popover-title');
    title.textContent = popover.title || getFieldLabel(popoverKey);
    title.style.fontWeight = '700';
    title.style.marginBottom = '10px';
    popoverPanel.appendChild(title);

    const fields = Array.isArray(popover.fields) ? popover.fields : [];
    fields.forEach((field) => popoverPanel.appendChild(renderPopoverField(selectedBlock, field)));

    const actions = createControl('div', 'pe-toolbar-popover-actions');
    actions.style.display = 'flex';
    actions.style.justifyContent = 'flex-end';
    actions.style.gap = '8px';
    const cancelButton = createButton('Cancel', 'close-popover', 'Close popover', { control: false });
    const applyButton = createButton('Apply', 'apply-popover', 'Apply popover changes', { control: false });
    actions.append(cancelButton, applyButton);
    popoverPanel.appendChild(actions);
    popoverPanel.hidden = false;
  }

  function rebuildOptionsMenu(block) {
    optionsMenu.innerHTML = '';
    const popovers = getBlockPopovers(block);
    Object.entries(popovers).forEach(([key, entry]) => {
      const button = createButton(entry.title || getFieldLabel(key), 'open-popover', entry.title || getFieldLabel(key), {
        classes: 'pe-floating-toolbar__menu-button',
        control: false
      });
      button.dataset.popover = key;
      optionsMenu.appendChild(button);
    });
    if (Object.keys(popovers).length) {
      const divider = createControl('div', 'pe-floating-toolbar__menu-divider');
      divider.style.height = '1px';
      divider.style.margin = '6px 0';
      divider.style.background = '#e5e7eb';
      optionsMenu.appendChild(divider);
    }
    optionsMenu.appendChild(deleteButton);
  }

  function normalizeColor(value, fallback) {
    if (!value) return fallback;
    if (/^#[0-9a-f]{6}$/i.test(value)) return value;
    const swatch = document.createElement('span');
    swatch.style.color = value;
    document.body.appendChild(swatch);
    const resolved = window.getComputedStyle(swatch).color;
    swatch.remove();
    const match = resolved.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i);
    if (!match) return fallback;
    return `#${match.slice(1).map((part) => Number(part).toString(16).padStart(2, '0')).join('')}`;
  }

  function getBlockStyle(block){
    const baseStyle = block && block.attrs && block.attrs.style ? block.attrs.style : {};
    return Object.assign({
      fontSize: '',
      fontWeight: '',
      lineHeight: '',
      textColor: '',
      backgroundColor: ''
    }, block && block.type === 'list' && baseStyle.typography ? baseStyle.typography : baseStyle);
  }

  function getListSpacing(block) {
    const spacing = block && block.attrs && block.attrs.style && block.attrs.style.spacing ? block.attrs.style.spacing : {};
    return Object.assign({
      itemGap: '',
      indentWidth: ''
    }, spacing);
  }

  function getVisibleControls(block, isListItemSelection) {
    if (!block || !block.type) return new Set();

    if (block.type === 'gallery' && selectedGalleryImageId) {
      return new Set(['gallery-replace-image', 'gallery-remove-image', 'gallery-image-link']);
    }

    const visibleControls = new Set();
    const { inline, ellipsis } = getToolbarTokens(block);
    addMappedToolbarActions(visibleControls, block, inline);
    addMappedToolbarActions(visibleControls, block, ellipsis);

    if (isListItemSelection) {
      ['bold', 'italic', 'link'].forEach((action) => {
        if (visibleControls.has(action)) visibleControls.add(action);
      });
      return visibleControls;
    }

    visibleControls.add('move-up');
    visibleControls.add('move-down');
    if (RICH_TEXT_TYPES.has(block.type) || block.type === 'code') visibleControls.add('transform');
    return visibleControls;
  }

  function syncGroupVisibility() {
    toolbarGroups.forEach((group) => {
      group.hidden = !Array.from(group.querySelectorAll('[data-toolbar-control="true"]')).some((control) => !control.hidden);
    });
  }

  function applyToolbarRegistry(block, isListItemSelection) {
    const visibleControls = getVisibleControls(block, isListItemSelection);
    Object.entries(controlRegistry).forEach(([key, control]) => {
      control.hidden = !visibleControls.has(key);
    });
    const hasBlockMenu = !!(block && (Object.keys(getBlockPopovers(block)).length || TOOLBAR_BLOCK_TYPES.has(block.type)));
    optionsButton.hidden = !hasBlockMenu;
    syncGroupVisibility();
    return hasBlockMenu || Array.from(visibleControls).some((key) => controlRegistry[key] && !controlRegistry[key].hidden);
  }

  function syncToolbar(block){
    const blockCollection = typeof EditorCore.getBlocks === 'function' ? EditorCore.getBlocks() : [];
    const blockIndex = block ? blockCollection.findIndex((entry) => entry.id === block.id) : -1;
    const isFirstBlock = blockIndex <= 0;
    const isLastBlock = blockIndex === -1 || blockIndex === blockCollection.length - 1;
    const style = getBlockStyle(block);
    const listItemElement = getSelectedListItemElement(block);
    const isListBlock = !!(block && block.type === 'list');
    const isListItemSelection = !!listItemElement;
    selectedListItemPath = isListItemSelection ? listItemElement.dataset.itemPath || null : null;
    blockTypeSelect.value = block && block.type ? block.type : 'paragraph';
    blockTypeButton.setAttribute('aria-label', `${block && block.type ? block.type : 'Block'}. Change block type or style`);
    if (blockTypeIcon) blockTypeIcon.innerHTML = ICONS[block && ICONS[block.type] ? block.type : 'paragraph'] || '';
    alignSelect.value = block && block.attrs && block.attrs.align ? block.attrs.align : 'left';
    fontSizeSelect.value = style.fontSize || '';
    fontWeightSelect.value = style.fontWeight || '';
    lineHeightSelect.value = style.lineHeight || '';
    textColorInput.value = normalizeColor(style.textColor, '#111827');
    backgroundColorInput.value = normalizeColor(style.backgroundColor, block && block.type === 'code' ? '#0f172a' : '#ffffff');
    headingLevelSelect.value = block && block.attrs && block.attrs.level ? String(block.attrs.level) : '2';
    codeLanguageSelect.value = block && block.type === 'code' && block.attrs && block.attrs.language ? String(block.attrs.language).toLowerCase() : '';
    galleryColumnsSelect.value = block && block.type === 'gallery' && block.attrs ? String(block.attrs.columns || 3) : '3';
    galleryLinkSelect.value = block && block.type === 'gallery' && block.attrs && block.attrs.linkTo ? block.attrs.linkTo : 'none';
    galleryLayoutSelect.value = block && block.type === 'gallery' && block.attrs && block.attrs.style && block.attrs.style.layout ? block.attrs.style.layout : 'default';
    galleryCropToggleButton.setAttribute('aria-pressed', block && block.type === 'gallery' && block.attrs && block.attrs.crop !== false ? 'true' : 'false');
    galleryCropToggleButton.textContent = block && block.type === 'gallery' && block.attrs && block.attrs.crop !== false ? 'Crop on' : 'Crop off';
    galleryImageCropButton.setAttribute('aria-pressed', galleryCropToggleButton.getAttribute('aria-pressed'));
    galleryImageCropButton.textContent = galleryCropToggleButton.textContent;
    galleryLightboxToggleButton.setAttribute('aria-pressed', block && block.type === 'gallery' && block.attrs && block.attrs.lightbox ? 'true' : 'false');
    galleryLightboxToggleButton.textContent = block && block.type === 'gallery' && block.attrs && block.attrs.lightbox ? 'Lightbox on' : 'Lightbox off';
    moveUpButton.disabled = isFirstBlock;
    moveDownButton.disabled = isLastBlock;
    moveUpButton.setAttribute('aria-disabled', isFirstBlock ? 'true' : 'false');
    moveDownButton.setAttribute('aria-disabled', isLastBlock ? 'true' : 'false');
    toggleListModeButton.setAttribute('aria-pressed', block && block.type === 'list' && block.attrs && block.attrs.ordered ? 'true' : 'false');
    toggleListModeButton.textContent = block && block.type === 'list' && block.attrs && block.attrs.ordered ? '1.' : '•';
    if (block && block.type === 'list') {
      const markerOptions = block.attrs && block.attrs.ordered ? ORDERED_MARKER_OPTIONS : UNORDERED_MARKER_OPTIONS;
      markerStyleSelect.innerHTML = '';
      markerOptions.forEach(([value, label]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        markerStyleSelect.appendChild(option);
      });
      markerStyleSelect.value = block.attrs && block.attrs.markerStyle ? block.attrs.markerStyle : markerOptions[0][0];
      const spacing = getListSpacing(block);
      itemGapSelect.value = spacing.itemGap || '';
      indentWidthSelect.value = spacing.indentWidth || '';
    }
    // image-specific sync handled in inspector; toolbar shows action buttons only
    const hasVisibleControls = applyToolbarRegistry(block, isListItemSelection);
    rebuildOptionsMenu(block);
    if (block && block.type === 'image') {
      const selectedIds = typeof EditorCore.getSelectedBlockIds === 'function' ? EditorCore.getSelectedBlockIds() : (block.id ? [block.id] : []);
      const allImages = selectedIds.length > 1 && selectedIds.every((id) => {
        const candidate = EditorCore.getBlocks().find((entry) => entry.id === id);
        return candidate && candidate.type === 'image';
      });
      galleryToGalleryButton.hidden = !allImages;
      syncGroupVisibility();
    }
    return hasVisibleControls;
  }

  function updateStyle(patch){
    if (!selectedBlock || !selectedBlock.id) return;
    const nextStyle = Object.assign(getBlockStyle(selectedBlock), patch || {});
    if (selectedBlock.type === 'list') {
      const current = selectedBlock.attrs && selectedBlock.attrs.style ? selectedBlock.attrs.style : {};
      EditorCore.setBlockAttrs(selectedBlock.id, {
        style: Object.assign({}, current, {
          typography: nextStyle
        })
      });
      return;
    }
    EditorCore.setBlockAttrs(selectedBlock.id, { style: nextStyle });
  }

  function updateListSpacing(patch){
    if (!selectedBlock || selectedBlock.type !== 'list') return;
    const currentStyle = selectedBlock.attrs && selectedBlock.attrs.style ? selectedBlock.attrs.style : {};
    const nextSpacing = Object.assign({ itemGap: '', indentWidth: '' }, currentStyle.spacing || {}, patch || {});
    EditorCore.setBlockAttrs(selectedBlock.id, {
      style: Object.assign({}, currentStyle, { spacing: nextSpacing })
    });
  }

  function syncSelectedBlockContent(){
    if (!selectedBlock || !selectedBlock.id) return;
    const element = getBlockElement(selectedBlock);
    if (!element) return;
    if (selectedBlock.type === 'paragraph' || selectedBlock.type === 'heading') {
      const editable = getEditableElement(selectedBlock);
      if (!editable) return;
      EditorCore.setBlockAttrs(selectedBlock.id, { text: editable.innerHTML });
      return;
    }
    if (selectedBlock.type === 'list') {
      const items = Array.from(element.querySelectorAll('li[contenteditable]')).map((item) => item.innerHTML);
      EditorCore.setBlockAttrs(selectedBlock.id, { items });
    }
  }

  function selectionIsInsideSelectedBlock(selection){
    if (!selection || selection.rangeCount === 0 || !selectedBlock) return false;
    const element = getBlockElement(selectedBlock);
    if (!element) return false;
    const container = getSelectionContainer(selection);
    return !!(container && element.contains(container));
  }

  function hasFocusedEditableInsideBlock(block) {
    const element = getBlockElement(block);
    if (!element || !document.activeElement || !document.activeElement.closest) return false;
    const activeEditable = document.activeElement.closest('[contenteditable]');
    return !!(activeEditable && element.contains(activeEditable));
  }

  function shouldRenderToolbar(block) {
    if (!block || !block.type) return false;
    if (block.type === 'gallery') return true;
    if (block.type === 'image') return true;
    if (block.type === 'list') return hasFocusedEditableInsideBlock(block);
    if (RICH_TEXT_TYPES.has(block.type) || block.type === 'code') {
      const selection = window.getSelection();
      return hasFocusedEditableInsideBlock(block) || selectionIsInsideSelectedBlock(selection);
    }
    return false;
  }

  function rememberSelection(){
    const selection = window.getSelection();
    if (!selectionIsInsideSelectedBlock(selection)) return;
    savedRange = selection.getRangeAt(0).cloneRange();
  }

  function restoreSelection(){
    if (!savedRange) return false;
    const selection = window.getSelection();
    if (!selection) return false;
    selection.removeAllRanges();
    selection.addRange(savedRange);
    return true;
  }

  function wrapSelectionWithCode(){
    wrapSelectionWithElement('code');
  }

  function wrapSelectionWithElement(tagName, attributes){
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    const element = document.createElement(tagName);
    Object.entries(attributes || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') element.setAttribute(key, value);
    });
    try {
      range.surroundContents(element);
    } catch (error) {
      const fragment = range.extractContents();
      element.appendChild(fragment);
      range.insertNode(element);
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  function applyInlineAction(action){
    if (!selectedBlock || !RICH_TEXT_TYPES.has(selectedBlock.type)) return;
    const editable = getEditableElement(selectedBlock);
    if (!editable) return;
    editable.focus();
    restoreSelection();
    if (action === 'bold') wrapSelectionWithElement('strong');
    if (action === 'italic') wrapSelectionWithElement('em');
    if (action === 'link') {
      const href = window.prompt('Enter link URL');
      if (!href) return;
      wrapSelectionWithElement('a', {
        href,
        target: '_blank',
        rel: 'noreferrer noopener'
      });
    }
    if (action === 'inline-code') wrapSelectionWithCode();
    rememberSelection();
    syncSelectedBlockContent();
  }

  toolbar.addEventListener('mousedown', (event) => {
    if (event.target.closest('button')) event.preventDefault();
  });

  toolbar.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button || !selectedBlock) return;
    const action = button.getAttribute('data-action');
    if (action !== 'toggle-options-menu') closeOptionsMenu();
    if (action === 'open-transform-picker') {
      openNativePicker(blockTypeSelect);
      return;
    }
    if (action === 'open-align-picker') {
      openNativePicker(alignSelect);
      return;
    }
    if (action === 'toggle-options-menu') {
      toggleOptionsMenu();
      return;
    }
    if (action === 'open-popover') {
      openPopover(button.dataset.popover);
      return;
    }
    if (action === 'close-popover') {
      closePopover();
      return;
    }
    if (action === 'apply-popover') {
      const values = {};
      popoverPanel.querySelectorAll('[data-field]').forEach((fieldControl) => {
        values[fieldControl.dataset.field] = fieldControl.type === 'checkbox' ? fieldControl.checked : fieldControl.value;
      });
      applyPopoverValues(toolbar.dataset.activePopover, values);
      closePopover();
      return;
    }
    if (action === 'move-up') EditorCore.emit('move', { id: selectedBlock.id, dir: 'up' });
    if (action === 'move-down') EditorCore.emit('move', { id: selectedBlock.id, dir: 'down' });
    if (action === 'bold') applyInlineAction('bold');
    if (action === 'italic') applyInlineAction('italic');
    if (action === 'link') {
      const popovers = getBlockPopovers(selectedBlock);
      if (popovers.link) {
        rememberSelection();
        openPopover('link');
      } else {
        applyInlineAction('link');
      }
    }
    if (action === 'inline-code') applyInlineAction('inline-code');
    if (action === 'toggle-list') {
      const nextOrdered = !(selectedBlock.attrs && selectedBlock.attrs.ordered);
      EditorCore.setBlockAttrs(selectedBlock.id, {
        ordered: nextOrdered,
        markerStyle: nextOrdered ? 'decimal' : 'disc'
      });
    }
    if (action === 'reset-styles') {
      updateStyle({ fontSize: '', fontWeight: '', lineHeight: '', textColor: '', backgroundColor: '' });
      if (selectedBlock.type === 'list') updateListSpacing({ itemGap: '', indentWidth: '' });
    }
    if (action === 'delete') EditorCore.emit('delete', selectedBlock.id);
    if (action === 'replace-image' && selectedBlock.type === 'image') {
      const url = window.prompt('Enter image URL');
      if (url) EditorCore.setBlockAttrs(selectedBlock.id, { src: url });
    }
    if (action === 'upload-image' && selectedBlock.type === 'image') {
      triggerImageUpload((item) => {
        EditorCore.setBlockAttrs(selectedBlock.id, {
          src: item && (item.urlPath || item.path || ''),
          alt: item && item.name ? String(item.name).replace(/\.[^.]+$/, '') : (selectedBlock.attrs && selectedBlock.attrs.alt ? selectedBlock.attrs.alt : '')
        });
      });
    }
    if (action === 'media-library' && selectedBlock.type === 'image') {
      openMediaLibraryPicker({ title: 'Choose image from media library', multiple: false }).then((item) => {
        if (!item) return;
        EditorCore.setBlockAttrs(selectedBlock.id, {
          src: item.urlPath || item.path || '',
          alt: item.name ? String(item.name).replace(/\.[^.]+$/, '') : (selectedBlock.attrs && selectedBlock.attrs.alt ? selectedBlock.attrs.alt : '')
        });
      });
    }
    if (action === 'insert-image-url' && selectedBlock.type === 'image') {
      const url = window.prompt('Insert image URL');
      if (url) EditorCore.setBlockAttrs(selectedBlock.id, { src: url });
    }
    if (action === 'focal-point' && selectedBlock.type === 'image') {
      openPopover('focalPoint');
    }
    if (action === 'gallery-add-images' && selectedBlock.type === 'gallery') {
      Promise.resolve(typeof EditorGalleryUtils.chooseGalleryImages === 'function'
        ? EditorGalleryUtils.chooseGalleryImages({ multiple: true })
        : [])
        .then((images) => {
          if (!images || !images.length) return;
          updateGalleryAttrs({ images: getGalleryImages(selectedBlock).concat(images) });
          const latest = images[images.length - 1];
          EditorCore.emit('gallery:selection', { blockId: selectedBlock.id, imageId: latest && latest.id ? latest.id : null });
        });
    }
    if (action === 'gallery-crop-toggle' && selectedBlock.type === 'gallery') {
      updateGalleryAttrs({ crop: !(selectedBlock.attrs && selectedBlock.attrs.crop !== false) });
    }
    if (action === 'gallery-lightbox-toggle' && selectedBlock.type === 'gallery') {
      updateGalleryAttrs({ lightbox: !(selectedBlock.attrs && selectedBlock.attrs.lightbox) });
    }
    if (action === 'gallery-replace-image' && selectedBlock.type === 'gallery' && selectedGalleryImageId) {
      Promise.resolve(typeof EditorGalleryUtils.chooseGalleryImages === 'function'
        ? EditorGalleryUtils.chooseGalleryImages({ multiple: false })
        : [])
        .then((images) => {
          if (!images || !images.length) return;
          const nextImage = images[0];
          updateSelectedGalleryImage({
            src: nextImage.src || '',
            alt: nextImage.alt || '',
            caption: nextImage.caption || ''
          });
        });
    }
    if (action === 'gallery-remove-image' && selectedBlock.type === 'gallery' && selectedGalleryImageId) {
      removeSelectedGalleryImage();
    }
    if (action === 'gallery-image-link' && selectedBlock.type === 'gallery' && selectedGalleryImageId) {
      const current = selectedBlock.attrs && selectedBlock.attrs.linkTo ? selectedBlock.attrs.linkTo : 'none';
      const next = window.prompt('Link behavior for gallery images: none, media, or attachment', current);
      if (next && ['none', 'media', 'attachment'].includes(String(next).trim().toLowerCase())) {
        updateGalleryAttrs({ linkTo: String(next).trim().toLowerCase() });
      }
    }
    if (action === 'gallery-image-crop-toggle' && selectedBlock.type === 'gallery') {
      updateGalleryAttrs({ crop: !(selectedBlock.attrs && selectedBlock.attrs.crop !== false) });
    }
    if (action === 'gallery-to-images' && selectedBlock.type === 'gallery') {
      EditorCore.emit('transform', { id: selectedBlock.id, type: 'image' });
    }
    if (action === 'gallery-to-gallery' && selectedBlock.type === 'image') {
      EditorCore.emit('transform', { id: selectedBlock.id, type: 'gallery' });
    }
  });

  toolbar.addEventListener('change', (event) => {
    const control = event.target;
    const action = control.getAttribute('data-action');
    if (!action || !selectedBlock) return;
    closeOptionsMenu();
    if (action === 'transform') EditorCore.emit('transform', { id: selectedBlock.id, type: control.value });
    if (action === 'align') EditorCore.setBlockAttrs(selectedBlock.id, { align: control.value });
    if (action === 'font-size') updateStyle({ fontSize: control.value });
    if (action === 'font-weight') updateStyle({ fontWeight: control.value });
    if (action === 'line-height') updateStyle({ lineHeight: control.value });
    if (action === 'text-color') updateStyle({ textColor: control.value });
    if (action === 'background-color') updateStyle({ backgroundColor: control.value });
    if (action === 'heading-level') EditorCore.setBlockAttrs(selectedBlock.id, { level: Number(control.value) });
    if (action === 'language') EditorCore.setBlockAttrs(selectedBlock.id, { language: control.value });
    if (action === 'gallery-columns') updateGalleryAttrs({ columns: Number(control.value) || 3 });
    if (action === 'gallery-link-to') updateGalleryAttrs({ linkTo: control.value });
    if (action === 'gallery-layout') updateGalleryStyle({ layout: control.value });
    if (action === 'marker-style') EditorCore.setBlockAttrs(selectedBlock.id, { markerStyle: control.value });
    if (action === 'item-gap') updateListSpacing({ itemGap: control.value });
    if (action === 'indent-width') updateListSpacing({ indentWidth: control.value });
    // image text properties are edited in the inspector panel, not the floating toolbar
  });

  function updateToolbar(block){
    selectedBlock = block && block.id && TOOLBAR_BLOCK_TYPES.has(block.type) ? block : null;
    selectedListItemPath = null;
    if (!selectedBlock || selectedBlock.type !== 'gallery') selectedGalleryImageId = null;
    if (!selectedBlock) {
      hideToolbar();
      return;
    }
    if (!shouldRenderToolbar(selectedBlock)) {
      hideToolbar();
      return;
    }
    const hasVisibleControls = syncToolbar(selectedBlock);
    if (!hasVisibleControls) {
      hideToolbar();
      return;
    }
    requestAnimationFrame(() => showToolbar(selectedBlock));
  }

  EditorCore.on('select', (block) => updateToolbar(block));
  EditorCore.on('selection:changed', (selection) => updateToolbar(selection && selection.block ? selection.block : null));
  EditorCore.on('gallery:selection', (selection) => {
    selectedGalleryImageId = selection && selection.blockId === (selectedBlock && selectedBlock.id) ? selection.imageId || null : null;
    updateToolbar(EditorCore.getSelectedBlock());
  });
  EditorCore.on('state:changed', (state) => {
    const block = state && state.selectedId ? (state.blocks || []).find((entry) => entry.id === state.selectedId) : null;
    if (!block || block.type !== 'gallery') selectedGalleryImageId = null;
    updateToolbar(block || null);
  });

  window.addEventListener('scroll', () => { if (selectedBlock) showToolbar(selectedBlock); }, true);
  window.addEventListener('resize', () => { if (selectedBlock) showToolbar(selectedBlock); });
  document.addEventListener('selectionchange', () => {
    rememberSelection();
    if (selectedBlock) updateToolbar(EditorCore.getSelectedBlock());
  });
  document.addEventListener('focusin', () => {
    if (selectedBlock) updateToolbar(EditorCore.getSelectedBlock());
  });
  document.addEventListener('keydown', (event) => {
    const mod = event.ctrlKey || event.metaKey;
    if (!mod || !selectedBlock || !RICH_TEXT_TYPES.has(selectedBlock.type)) return;
    if (event.key === 'b' || event.key === 'B') { event.preventDefault(); applyInlineAction('bold'); }
    if (event.key === 'i' || event.key === 'I') { event.preventDefault(); applyInlineAction('italic'); }
    if (event.key === 'k' || event.key === 'K') { event.preventDefault(); applyInlineAction('link'); }
  });

  document.addEventListener('click', (event) => {
    if (toolbar.contains(event.target)) {
      if (!event.target.closest('.pe-floating-toolbar__menu-wrap')) closeOptionsMenu();
      return;
    }
    closeOptionsMenu();
    closePopover();
    const selectedElement = selectedBlock ? getBlockElement(selectedBlock) : null;
    if (selectedElement && selectedElement.contains(event.target)) return;
    if (!EditorCore.getSelectedBlock()) hideToolbar();
  });
})();

/* Command bar wiring: live editor header actions, preview, settings, menus, undo/redo */
(function(){
  if (window.__editorCommandBarWired) return;
  window.__editorCommandBarWired = true;

  const maxAttempts = 30;
  let attemptCount = 0;
  const readyInterval = window.setInterval(() => {
    attemptCount += 1;
    if (attemptCount > maxAttempts || tryInitCommandBar()) {
      window.clearInterval(readyInterval);
    }
  }, 100);

  tryInitCommandBar();

  function tryInitCommandBar() {
    if (!window.EditorCore) return false;
    const root = document.documentElement;
    const rootShell = document.querySelector('.editor-shell');
    const header = document.querySelector('.editor-header.edit-post-header');
    if (!header) return false;

    const btnBack = document.getElementById('cb-back');
    const btnSave = document.getElementById('cb-save');
    const btnPublish = document.getElementById('cb-publish');
    const btnUndo = document.querySelector('.editor-history__undo');
    const btnRedo = document.querySelector('.editor-history__redo');
    const btnOverview = document.getElementById('cb-document-overview');
    const btnPreviewToggle = document.getElementById('cb-preview-toggle');
    const previewMenu = document.getElementById('cb-preview-menu');
    const btnViewPublished = document.getElementById('cb-view-published');
    const btnEditPages = document.getElementById('cb-edit-pages');
    const btnSettings = document.getElementById('cb-settings');
    const btnMore = document.getElementById('cb-more');
    const moreMenu = document.getElementById('cb-more-menu');
    const btnTitle = document.getElementById('cb-title-command');
    const titleInput = document.getElementById('pe-canvas-title');
    const titleText = document.querySelector('.editor-document-bar__post-title');
    const rightToggle = document.getElementById('pe-toggle-right');
    const topToolbarHost = document.getElementById('cb-toolbar-center-host');
    const UPSERT_POST_PATH = '/upsert-post';
    const GET_POST_ADMIN_PATH = '/get-post-admin';
    const configuredApiBase = typeof window.PAGE_MANAGER_API_BASE === 'string' ? window.PAGE_MANAGER_API_BASE.trim() : '';
    const API_BASE = configuredApiBase || '/api';
    const CREATE_PAGE_PATH = '/create-page';
    const EDIT_PAGE_PATH = '/edit-page';
    const routeParams = new URLSearchParams(window.location.search);
    const editorKind = String(routeParams.get('kind') || 'page').toLowerCase() === 'post' ? 'post' : 'page';
    const overviewMenu = document.createElement('div');
    overviewMenu.id = 'cb-overview-menu';
    overviewMenu.className = 'cb-menu cb-menu--overview';
    overviewMenu.hidden = true;
    document.body.appendChild(overviewMenu);

    const history = { stack: [], index: -1 };
    const previewWidths = { desktop: '1200px', tablet: '820px', mobile: '420px' };

    function snapshot(){ return JSON.stringify(EditorCore.getState()); }
    function pushHistory(){
      try{
        const s = snapshot();
        if (history.index >= 0 && history.stack[history.index] === s) return;
        history.stack = history.stack.slice(0, history.index + 1);
        history.stack.push(s);
        history.index = history.stack.length - 1;
        updateUndoRedoButtons();
      }catch(e){ console.warn('Failed to push history', e); }
    }

    function updateUndoRedoButtons(){
      if (btnUndo) btnUndo.disabled = history.index <= 0;
      if (btnRedo) btnRedo.disabled = history.index >= history.stack.length - 1;
    }

    function undo(){
      if (history.index <= 0) return;
      history.index--;
      try {
        const state = JSON.parse(history.stack[history.index]);
        if (EditorCore.setState) EditorCore.setState(state);
      } catch (error) {
        console.warn('Failed to undo', error);
      }
      updateUndoRedoButtons();
    }

    function redo(){
      if (history.index >= history.stack.length - 1) return;
      history.index++;
      try {
        const state = JSON.parse(history.stack[history.index]);
        if (EditorCore.setState) EditorCore.setState(state);
      } catch (error) {
        console.warn('Failed to redo', error);
      }
      updateUndoRedoButtons();
    }

    function navigateBack(){
      if (!btnBack) return;
      const page = EditorCore.getPage ? EditorCore.getPage() : null;
      if (editorKind === 'post') {
        window.location.href = '/posts';
      } else {
        window.location.href = '/pages';
      }
    }

    function saveDraft(){ if (!btnSave || btnSave.disabled) return; /* actual function body below */ }
    function publishPage(){ if (!btnPublish || btnPublish.disabled) return; /* actual function body below */ }
    function toggleMenu(button, menu, beforeOpen){ return; }
    function setTopToolbarEnabled(enabled){ return; }

    function cleanupMenu() {
      if (btnOverview && overviewMenu && !overviewMenu.isConnected) document.body.appendChild(overviewMenu);
    }

    // Existing wiring code continues below, unchanged...

  function isPostEditor(){
    return (typeof editorKind !== 'undefined') && editorKind === 'post';
  }

  function getPostType(){
    return isPostEditor() ? 'Post' : 'Page';
  }

  function getListingHref(){
    return isPostEditor() ? '../site-posts.html' : '../site-pages.html';
  }

  function getPageSlug() {
    const page = EditorCore.getPage ? EditorCore.getPage() : { attrs: {} };
    let slug = page && page.attrs && page.attrs.slug ? String(page.attrs.slug).trim() : '';
    if (!slug) {
      const title = getPageTitle();
      if (EditorCore.slugify) {
        slug = EditorCore.slugify(title);
      } else {
        slug = String(title || 'page-editor').toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
    }
    return slug || 'page-editor';
  }

  function buildPageManifest(slug, title, attrs) {
    const pageTitle = String(title || 'Untitled').trim();
    return {
      output: `${slug}.html`,
      title: `${pageTitle} — 365 Evergreen`,
      metadata: {
        pageTitle,
        description: String((attrs && attrs.excerpt) || '').trim(),
        category: String((attrs && attrs.category) || 'pages').trim() || 'pages',
        template: String((attrs && attrs.template) || 'standard').trim()
      },
      headerAttributes: {
        'data-tenant': '365evergreen.com'
      },
      contentFile: `content/${slug}.html`
    };
  }

  function buildPageSourcePayload(mode) {
    const page = EditorCore.getPage ? EditorCore.getPage() : { attrs: {} };
    const slug = getPageSlug();
    const manifest = buildPageManifest(slug, getPageTitle(), page.attrs || {});
    const contentHtml = EditorCore.saveBlocks ? EditorCore.saveBlocks(EditorCore.getBlocks ? EditorCore.getBlocks() : [], { published: mode === 'publish' }) : '';
    const payload = {
      manifestPath: `pages/${slug}.json`,
      manifestContent: JSON.stringify(manifest, null, 2) + '\n',
      contentPath: `pages/content/${slug}.html`,
      contentContent: contentHtml + '\n'
    };
    if (page.attrs && page.attrs.persistedSlug && page.attrs.persistedSlug !== slug) {
      payload.previousPublishedPath = `${String(page.attrs.persistedSlug).trim()}.html`;
    }
    return payload;
  }

  function getPageTitle(){
    const page = EditorCore.getPage ? EditorCore.getPage() : { attrs: {} };
    return (titleInput && titleInput.value.trim()) || (page && page.attrs && page.attrs.title) || 'Untitled';
  }

  function buildPagePayload(){
    const state = EditorCore.getState();
    const page = EditorCore.getPage ? EditorCore.getPage() : { attrs: {} };
    const featuredImage = (page && page.attrs && page.attrs.featuredImage) ? String(page.attrs.featuredImage).trim() : '';
    const payload = {
      ...state,
      title: getPageTitle(),
      featuredImage: featuredImage,
      page: {
        ...(page || {}),
        attrs: {
          ...((page && page.attrs) || {}),
          title: getPageTitle(),
          status: ((page && page.attrs && page.attrs.status) || 'draft')
        }
      },
      html: EditorCore.saveBlocks ? EditorCore.saveBlocks(state.blocks, { published: false }) : ''
    };
    return payload;
  }

  function buildPostPayload(mode){
    const state = EditorCore.getState();
    const page = EditorCore.getPage ? EditorCore.getPage() : { attrs: {} };
    const attrs = (page && page.attrs) || {};
    return {
      title: getPageTitle(),
      slug: attrs.slug || '',
      previousSlug: attrs.persistedSlug || '',
      excerpt: String(attrs.excerpt || '').trim(),
      categories: attrs.categories || '',
      tags: attrs.tags || '',
      featuredImage: String(attrs.featuredImage || '').trim(),
      date: attrs.date || new Date().toISOString(),
      html: EditorCore.saveBlocks ? EditorCore.saveBlocks(state.blocks, { published: mode === 'publish' }) : '',
      blocks: Array.isArray(state.blocks) ? JSON.parse(JSON.stringify(state.blocks)) : []
    };
  }

  function getDraftStorageKey(){
    const slug = (EditorCore.getPage && EditorCore.getPage().attrs && EditorCore.getPage().attrs.slug) || 'page-editor';
    return 'editor.draft:' + slug;
  }

  function waitForSiteAuth(timeoutMs){
    if (isLocalHost) return Promise.resolve(window.SiteAuth || null);
    if (window.SiteAuth && typeof window.SiteAuth.getIdToken === 'function') {
      return Promise.resolve(window.SiteAuth);
    }
    return new Promise((resolve) => {
      const startedAt = Date.now();
      const timer = window.setInterval(function () {
        if (window.SiteAuth && typeof window.SiteAuth.getIdToken === 'function') {
          window.clearInterval(timer);
          resolve(window.SiteAuth);
          return;
        }
        if (Date.now() - startedAt >= (timeoutMs || 6000)) {
          window.clearInterval(timer);
          resolve(null);
        }
      }, 100);
    });
  }

  async function buildAuthHeaders(){
    if (isLocalHost) return {};
    const siteAuth = await waitForSiteAuth(6000);
    if (!siteAuth || typeof siteAuth.getIdToken !== 'function') {
      const error = new Error('Site authentication is not available on this page.');
      error.code = 'AUTH_REQUIRED';
      throw error;
    }
    try {
      const idToken = await siteAuth.getIdToken();
      return {
        Authorization: 'Bearer ' + idToken,
        'x-site-id-token': idToken
      };
    } catch (_) {
      const error = new Error('Sign in from the site header before managing posts.');
      error.code = 'AUTH_REQUIRED';
      throw error;
    }
  }

  async function apiRequest(path, options){
    const requestOptions = options || {};
    const headers = Object.assign({}, await buildAuthHeaders(), requestOptions.headers || {});
    if (requestOptions.includeJson) headers['Content-Type'] = 'application/json';
    const response = await fetch(API_BASE + path, {
      method: requestOptions.method || 'GET',
      headers,
      body: requestOptions.body === undefined ? undefined : (requestOptions.includeJson ? JSON.stringify(requestOptions.body) : requestOptions.body)
    });
    const payload = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      const error = new Error(payload && payload.error ? payload.error : ('Request failed with status ' + response.status + '.'));
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  function markPageSaved(extraAttrs){
    if (!EditorCore.getPage || !EditorCore.setPage) return;
    const page = EditorCore.getPage() || { attrs: {} };
    const attrs = { ...(page.attrs || {}), ...(extraAttrs || {}), title: getPageTitle() };
    const next = {
      ...page,
      attrs,
      _savedSnapshot: snapshot(),
      _dirty: false,
      savedAt: new Date().toISOString()
    };
    EditorCore.setPage(next);
  }

  function updateTitleDisplay(){
    if (titleText) titleText.textContent = getPageTitle();
  }

  function updateSaveButton(){
    if (!btnSave) return;
    const page = EditorCore.getPage ? EditorCore.getPage() : null;
    const isPublished = !!(page && page.attrs && page.attrs.status === 'published');
    btnSave.hidden = isPublished;
    if (page && page._dirty) btnSave.textContent = 'Save draft';
    else btnSave.textContent = 'Saved';
  }

  function updatePublishButton(){
    if (!btnPublish) return;
    const page = EditorCore.getPage ? EditorCore.getPage() : null;
    const isPublished = !!(page && page.attrs && page.attrs.status === 'published');
    btnPublish.textContent = isPublished ? 'Update' : 'Publish';
    if (btnViewPublished) btnViewPublished.hidden = !isPublished;
  }

  function escapeHtml(value){
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getPreviewStyles(){
    return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map((link)=> link.href)
      .filter(Boolean)
      .map((href)=> '<link rel="stylesheet" href="' + href + '">')
      .join('');
  }

  function openPreviewWindow(device, published){
    const previewWindow = window.open('', '_blank', 'noopener');
    if (!previewWindow) return;
    const page = EditorCore.getPage ? EditorCore.getPage() : { attrs: {} };
    const featuredImage = page && page.attrs && page.attrs.featuredImage ? String(page.attrs.featuredImage).trim() : '';
    const bodyHtml = EditorCore.saveBlocks ? EditorCore.saveBlocks(EditorCore.getBlocks ? EditorCore.getBlocks() : [], { published: !!published }) : '';
    const title = getPageTitle();
    const width = previewWidths[device] || previewWidths.desktop;
    const featuredImageMarkup = featuredImage
      ? '<figure class="preview-featured-image"><img src="' + escapeHtml(featuredImage) + '" alt="' + escapeHtml(title) + '"></figure>'
      : '';
    previewWindow.document.write(
      '<!doctype html><html><head><meta charset="utf-8"><title>' + escapeHtml(title) + '</title>' +
      '<base href="' + location.href + '">' +
      getPreviewStyles() +
      '<style>body{margin:0;background:#eef3f9;font-family:Segoe UI, Arial, sans-serif;color:#1f2937;}'
      + '.preview-shell{max-width:' + width + ';margin:32px auto;padding:24px;background:#fff;border-radius:16px;box-shadow:0 18px 40px rgba(15,23,42,.12);}'
      + '.preview-meta{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid rgba(15,23,42,.08);font-size:12px;color:#475569;letter-spacing:.04em;text-transform:uppercase;}'
      + '.preview-title{font-size:28px;font-weight:700;margin:0 0 24px;}'
      + '.preview-featured-image{margin:0 0 24px;overflow:hidden;border-radius:18px;background:#dbeafe;}'
      + '.preview-featured-image img{display:block;width:100%;max-height:420px;object-fit:cover;}'
      + '.preview-content{display:flex;flex-direction:column;gap:20px;}'
      + '</style></head><body><main class="preview-shell"><div class="preview-meta"><span>'
      + escapeHtml(device) + ' preview</span><span>' + escapeHtml(published ? 'Published view' : 'Preview') + '</span></div><h1 class="preview-title">'
      + escapeHtml(title) + '</h1>' + featuredImageMarkup + '<div class="preview-content">' + bodyHtml + '</div></main></body></html>'
    );
    previewWindow.document.close();
  }

  async function saveDraft(){
    if (!btnSave || btnSave.disabled) return;
    btnSave.textContent = 'Saving...';
    btnSave.disabled = true;
    try{
      if (isPostEditor()) {
        const payload = buildPostPayload('draft');
        const result = await apiRequest(UPSERT_POST_PATH, {
          method: 'POST',
          includeJson: true,
          body: Object.assign({}, payload, { mode: 'draft' })
        });
        const post = result && result.post ? result.post : payload;
        localStorage.setItem(getDraftStorageKey(), JSON.stringify({ savedAt: new Date().toISOString(), payload: post }));
        markPageSaved({
          status: 'draft',
          slug: post.slug || payload.slug,
          persistedSlug: post.slug || payload.slug,
          excerpt: post.excerpt || payload.excerpt,
          categories: Array.isArray(post.categories) ? post.categories.join(', ') : (post.categories || payload.categories || ''),
          tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || payload.tags || ''),
          featuredImage: post.featuredImage || payload.featuredImage,
          date: post.date || payload.date
        });
        updateSaveButton();
        updatePublishButton();
        return;
      }
      const pagePayload = buildPageSourcePayload('draft');
      const page = EditorCore.getPage ? EditorCore.getPage() : { attrs: {} };
      const apiPath = page.attrs && page.attrs.persistedSlug ? EDIT_PAGE_PATH : CREATE_PAGE_PATH;
      await apiRequest(apiPath, {
        method: 'POST',
        includeJson: true,
        body: pagePayload
      });
      const slug = getPageSlug();
      markPageSaved({
        status: (page && page.attrs && page.attrs.status) || 'draft',
        slug,
        persistedSlug: slug
      });
      localStorage.setItem(getDraftStorageKey(), JSON.stringify({ savedAt: new Date().toISOString(), payload: pagePayload }));
      updateSaveButton();
      updatePublishButton();
    }catch(error){
      window.alert(error && error.message ? error.message : 'Could not save this draft.');
    }finally{
      btnSave.disabled = false;
      updateSaveButton();
    }
  }

  async function publishPage(){
    if (!btnPublish || btnPublish.disabled) return;
    btnPublish.textContent = 'Publishing...';
    btnPublish.disabled = true;
    try{
      if (isPostEditor()) {
        const payload = buildPostPayload('publish');
        const result = await apiRequest(UPSERT_POST_PATH, {
          method: 'POST',
          includeJson: true,
          body: Object.assign({}, payload, { mode: 'publish' })
        });
        const post = result && result.post ? result.post : payload;
        localStorage.setItem(getDraftStorageKey() + ':published', JSON.stringify({ publishedAt: new Date().toISOString(), payload: post }));
        markPageSaved({
          status: 'published',
          publishedAt: new Date().toISOString(),
          slug: post.slug || payload.slug,
          persistedSlug: post.slug || payload.slug,
          excerpt: post.excerpt || payload.excerpt,
          categories: Array.isArray(post.categories) ? post.categories.join(', ') : (post.categories || payload.categories || ''),
          tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || payload.tags || ''),
          featuredImage: post.featuredImage || payload.featuredImage,
          date: post.date || payload.date
        });
        updatePublishButton();
        updateSaveButton();
        return;
      }
      const pagePayload = buildPageSourcePayload('publish');
      const page = EditorCore.getPage ? EditorCore.getPage() : { attrs: {} };
      const apiPath = page.attrs && page.attrs.persistedSlug ? EDIT_PAGE_PATH : CREATE_PAGE_PATH;
      await apiRequest(apiPath, {
        method: 'POST',
        includeJson: true,
        body: pagePayload
      });
      const slug = getPageSlug();
      localStorage.setItem(getDraftStorageKey() + ':published', JSON.stringify({ publishedAt: new Date().toISOString(), payload: pagePayload }));
      markPageSaved({ status: 'published', publishedAt: new Date().toISOString(), slug, persistedSlug: slug });
      updatePublishButton();
      updateSaveButton();
    }catch(error){
      window.alert(error && error.message ? error.message : 'Could not publish this content.');
    }finally{
      btnPublish.disabled = false;
      updatePublishButton();
    }
  }

  async function initializePostEditor(){
    const label = document.querySelector('.editor-document-bar__post-type-label');
    if (label) label.textContent = '· ' + getPostType();
    if (btnBack) {
      btnBack.setAttribute('aria-label', isPostEditor() ? 'Back to posts' : 'Back to pages');
      btnBack.setAttribute('title', isPostEditor() ? 'Back to posts' : 'Back to pages');
    }
    if (btnEditPages) {
      btnEditPages.setAttribute('aria-label', isPostEditor() ? 'Back to posts' : 'Back to pages');
    }
    if (!isPostEditor()) return;

    const initialSlug = String(routeParams.get('slug') || '').trim();
    const initialTitle = String(routeParams.get('title') || '').trim();
    if (titleInput && initialTitle && !titleInput.value.trim()) {
      titleInput.value = initialTitle;
    }
    if (EditorCore.setPageAttrs) {
      EditorCore.setPageAttrs({
        title: initialTitle || getPageTitle(),
        slug: initialSlug,
        status: 'draft',
        excerpt: '',
        categories: '',
        tags: '',
        featuredImage: '',
        date: '',
        persistedSlug: initialSlug
      });
    }
    if (!initialSlug) {
      markPageSaved({
        status: 'draft',
        excerpt: '',
        categories: '',
        tags: '',
        featuredImage: '',
        date: '',
        persistedSlug: ''
      });
      return;
    }

    try {
      const result = await apiRequest(GET_POST_ADMIN_PATH + '?slug=' + encodeURIComponent(initialSlug));
      const post = result && result.post ? result.post : null;
      if (!post) return;
      if (titleInput) titleInput.value = post.title || initialTitle || '';
      if (Array.isArray(post.blocks) && post.blocks.length && EditorCore.setBlocks) {
        EditorCore.setBlocks(post.blocks);
      }
      markPageSaved({
        title: post.title || initialTitle || '',
        slug: post.slug || initialSlug,
        persistedSlug: post.slug || initialSlug,
        status: post.status || 'draft',
        excerpt: post.excerpt || '',
        categories: Array.isArray(post.categories) ? post.categories.join(', ') : (post.categories || ''),
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
        featuredImage: post.featuredImage || '',
        date: post.date || ''
      });
    } catch (error) {
      window.alert(error && error.message ? error.message : 'Could not load the existing post.');
    }
  }

  async function navigateBack(){
    if (EditorCore.getPage && EditorCore.getPage()._dirty) {
      if (confirm('Save draft before leaving the editor?')) {
        await saveDraft();
        window.location.href = getListingHref();
        return;
      }
      if (!confirm('Leave without saving your latest changes?')) return;
    }
    window.location.href = getListingHref();
  }

  function positionOverviewMenu(){
    if (!btnOverview) return;
    const rect = btnOverview.getBoundingClientRect();
    overviewMenu.style.top = (rect.bottom + window.scrollY + 8) + 'px';
    overviewMenu.style.left = (rect.left + window.scrollX) + 'px';
  }

  function getBlockOverviewLabel(block, index){
    if (!block) return 'Block ' + (index + 1);
    const attrs = block.attrs || {};
    if (block.type === 'drawer') {
      return 'Drawer (' + (attrs.position === 'left' ? 'Left' : 'Right') + ')';
    }
    const type = String(block.type || 'block').replace(/[_-]+/g, ' ').replace(/\b\w/g, function(char){ return char.toUpperCase(); });
    const text = attrs.content || attrs.text || attrs.title || attrs.caption || attrs.label || '';
    const suffix = text ? ': ' + String(text).replace(/\s+/g, ' ').trim().slice(0, 36) : '';
    return (index + 1) + '. ' + type + suffix;
  }

  function renderOverviewMenu(){
    overviewMenu.innerHTML = '';
    const blocks = EditorCore.getBlocks ? EditorCore.getBlocks() : [];
    if (!blocks.length) {
      const empty = document.createElement('div');
      empty.className = 'cb-menu__empty';
      empty.textContent = 'No blocks in this page yet.';
      overviewMenu.appendChild(empty);
      return;
    }
    function appendOverviewItems(entries, depth, ownerLabel) {
      (entries || []).forEach((block, index)=>{
        const item = document.createElement('button');
        item.type = 'button';
        item.textContent = (depth ? '  '.repeat(depth) + '↳ ' : '') + (ownerLabel && depth === 0 ? ownerLabel : getBlockOverviewLabel(block, index));
        item.style.paddingLeft = (12 + (depth * 16)) + 'px';
        item.addEventListener('click', function(){
          overviewMenu.hidden = true;
          if (btnOverview) btnOverview.setAttribute('aria-expanded', 'false');
          if (EditorCore.selectBlockById) EditorCore.selectBlockById(block.id);
          const blockEl = document.querySelector('[data-block-id="' + block.id + '"]');
          if (blockEl && blockEl.scrollIntoView) blockEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        overviewMenu.appendChild(item);
        const children = block && block.attrs && Array.isArray(block.attrs.children) ? block.attrs.children : [];
        if (children.length) {
          appendOverviewItems(children, depth + 1, null);
        }
      });
    }
    blocks.forEach((block, index)=>{
      const item = document.createElement('button');
      item.type = 'button';
      item.textContent = getBlockOverviewLabel(block, index);
      item.addEventListener('click', function(){
        overviewMenu.hidden = true;
        if (btnOverview) btnOverview.setAttribute('aria-expanded', 'false');
        if (EditorCore.selectBlockById) EditorCore.selectBlockById(block.id);
        const blockEl = document.querySelector('[data-block-id="' + block.id + '"]');
        if (blockEl && blockEl.scrollIntoView) blockEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      overviewMenu.appendChild(item);
      const children = block && block.attrs && Array.isArray(block.attrs.children) ? block.attrs.children : [];
      if (children.length) {
        appendOverviewItems(children, 1, null);
      }
    });
  }

  function closeMenu(button, menu){
    if (!menu || !button) return;
    menu.hidden = true;
    button.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu(button, menu, beforeOpen){
    if (!button || !menu) return;
    const open = menu.hidden;
    closeMenu(btnPreviewToggle, previewMenu);
    closeMenu(btnMore, moreMenu);
    if (menu !== overviewMenu) closeMenu(btnOverview, overviewMenu);
    if (!open) {
      menu.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      return;
    }
    if (typeof beforeOpen === 'function') beforeOpen();
    menu.hidden = false;
    button.setAttribute('aria-expanded', 'true');
  }

  function setTopToolbarEnabled(enabled){
    localStorage.setItem('editor.topToolbar', enabled ? '1' : '0');
    if (!topToolbarHost || !window.ToolbarFactory) return;
    if (enabled && typeof ToolbarFactory.setTopToolbarHost === 'function') {
      ToolbarFactory.setTopToolbarHost(topToolbarHost);
    } else if (!enabled) {
      if (typeof ToolbarFactory.clearTopToolbarHost === 'function') ToolbarFactory.clearTopToolbarHost();
      topToolbarHost.innerHTML = '';
      topToolbarHost.style.display = 'none';
      topToolbarHost.setAttribute('aria-hidden', 'true');
    }
  }

  function syncSettingsButton(){
    if (!btnSettings) return;
    const expanded = !root.classList.contains('collapsed-right');
    btnSettings.setAttribute('aria-pressed', expanded ? 'true' : 'false');
    btnSettings.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    btnSettings.classList.toggle('is-pressed', expanded);
  }

  function syncMenuToggles(){
    const topToolbarEnabled = localStorage.getItem('editor.topToolbar') !== '0';
    const spotlightEnabled = root.classList.contains('editor-spotlight-mode');
    const fullscreenEnabled = root.classList.contains('editor-fullscreen-mode');
    Array.from(moreMenu ? moreMenu.querySelectorAll('button[data-action]') : []).forEach(function(button){
      const action = button.getAttribute('data-action');
      const active = (action === 'toggle-top-toolbar' && topToolbarEnabled)
        || (action === 'toggle-spotlight' && spotlightEnabled)
        || (action === 'toggle-fullscreen' && fullscreenEnabled);
      button.classList.toggle('is-active', !!active);
    });
  }

  pushHistory();
  EditorCore.on('state:changed', function(){ pushHistory(); updateSaveButton(); renderOverviewMenu(); });
  EditorCore.on('page:changed', function(){ updateTitleDisplay(); updateSaveButton(); updatePublishButton(); });

  if (btnUndo) btnUndo.addEventListener('click', undo);
  if (btnRedo) btnRedo.addEventListener('click', redo);
  if (btnBack) btnBack.addEventListener('click', navigateBack);
  if (btnEditPages) btnEditPages.addEventListener('click', navigateBack);
  if (btnSave) btnSave.addEventListener('click', saveDraft);
  if (btnPublish) btnPublish.addEventListener('click', publishPage);
  if (btnTitle) btnTitle.addEventListener('click', function(){
    if (titleInput && titleInput.focus) {
      titleInput.focus();
      titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  if (titleInput) titleInput.addEventListener('input', updateTitleDisplay);

  if (btnOverview) btnOverview.addEventListener('click', function(){
    toggleMenu(btnOverview, overviewMenu, function(){
      renderOverviewMenu();
      positionOverviewMenu();
    });
  });

  if (btnPreviewToggle && previewMenu) {
    btnPreviewToggle.addEventListener('click', function(){ toggleMenu(btnPreviewToggle, previewMenu); });
    previewMenu.addEventListener('click', function(event){
      const actionButton = event.target.closest('button');
      if (!actionButton) return;
      const device = actionButton.getAttribute('data-preview-device');
      const action = actionButton.getAttribute('data-preview-action');
      closeMenu(btnPreviewToggle, previewMenu);
      if (device) openPreviewWindow(device, false);
      if (action === 'published') openPreviewWindow('desktop', true);
    });
  }

  if (btnSettings && rightToggle) {
    btnSettings.addEventListener('click', function(){
      rightToggle.click();
      syncSettingsButton();
    });
    rightToggle.addEventListener('click', function(){
      setTimeout(syncSettingsButton, 0);
    });
  }

  if (btnMore && moreMenu) {
    btnMore.addEventListener('click', function(){
      toggleMenu(btnMore, moreMenu, syncMenuToggles);
    });
    moreMenu.addEventListener('click', function(event){
      const actionButton = event.target.closest('button[data-action]');
      if (!actionButton) return;
      const action = actionButton.getAttribute('data-action');
      if (action === 'toggle-top-toolbar') setTopToolbarEnabled(localStorage.getItem('editor.topToolbar') === '0');
      if (action === 'toggle-spotlight') {
        const enabled = root.classList.toggle('editor-spotlight-mode');
        localStorage.setItem('editor.spotlight', enabled ? '1' : '0');
      }
      if (action === 'toggle-fullscreen') {
        const enabled = root.classList.toggle('editor-fullscreen-mode');
        localStorage.setItem('editor.fullscreen', enabled ? '1' : '0');
      }
      if (action === 'copy-content' && navigator.clipboard) navigator.clipboard.writeText(EditorCore.saveBlocks ? EditorCore.saveBlocks() : '');
      if (action === 'keyboard-shortcuts') alert('Shortcuts:\nCtrl+S Save draft\nCtrl+Z Undo\nCtrl+Shift+Z / Ctrl+Y Redo\nCtrl+Shift+, Toggle settings sidebar');
      syncMenuToggles();
      closeMenu(btnMore, moreMenu);
    });
  }

  document.addEventListener('click', function(event){
    if (btnOverview && !btnOverview.contains(event.target) && !overviewMenu.contains(event.target)) closeMenu(btnOverview, overviewMenu);
    if (btnPreviewToggle && previewMenu && !btnPreviewToggle.contains(event.target) && !previewMenu.contains(event.target)) closeMenu(btnPreviewToggle, previewMenu);
    if (btnMore && moreMenu && !btnMore.contains(event.target) && !moreMenu.contains(event.target)) closeMenu(btnMore, moreMenu);
  });

  document.addEventListener('keydown', function(e){
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's'){ e.preventDefault(); saveDraft(); }
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')){ e.preventDefault(); undo(); }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'Z' && e.shiftKey)){ e.preventDefault(); redo(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y'){ e.preventDefault(); redo(); }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === ','){ e.preventDefault(); if (btnSettings) btnSettings.click(); }
    if (e.key === 'Escape') {
      closeMenu(btnOverview, overviewMenu);
      closeMenu(btnPreviewToggle, previewMenu);
      closeMenu(btnMore, moreMenu);
    }
  });

  if (localStorage.getItem('editor.topToolbar') === '0') setTopToolbarEnabled(false);
  if (localStorage.getItem('editor.spotlight') === '1') root.classList.add('editor-spotlight-mode');
  if (localStorage.getItem('editor.fullscreen') === '1') root.classList.add('editor-fullscreen-mode');

  syncSettingsButton();
  updateTitleDisplay();
  updateSaveButton();
  updatePublishButton();
  renderOverviewMenu();
  syncMenuToggles();
  updateUndoRedoButtons();
  initializePostEditor();
  return true;
}
})();
