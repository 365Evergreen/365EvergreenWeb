/* Inspector: grouped controls for block attributes and text styles. */
(function(){
  const target = document.getElementById('pe-inspector-content') || document.getElementById('pe-inspector') || document.getElementById('pe-inspector-panel');
  if (!target || !window.EditorCore) return;

  const TEXT_BLOCK_TYPES = new Set(['paragraph', 'heading', 'list', 'code']);
  const TRANSFORM_OPTIONS = [
    ['paragraph', 'Paragraph'],
    ['heading', 'Heading'],
    ['list', 'List'],
    ['code', 'Code']
  ];
  const EditorGalleryUtils = window.EditorGalleryUtils || {};
  const ALIGN_OPTIONS = [
    ['left', 'Left'],
    ['center', 'Center'],
    ['right', 'Right'],
    ['justify', 'Justify']
  ];
  const CODE_LANGUAGE_OPTIONS = [
    ['', 'Language'],
    ['html', 'HTML'],
    ['json', 'JSON'],
    ['css', 'CSS'],
    ['yaml', 'YAML']
  ];
  const FONT_SIZE_OPTIONS = [
    ['', 'Default'],
    ['0.875rem', 'Small'],
    ['1rem', 'Medium'],
    ['1.125rem', 'Large'],
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
    ['', 'Default'],
    ['0.25rem', 'XS'],
    ['0.5rem', 'S'],
    ['0.75rem', 'M'],
    ['1rem', 'L'],
    ['1.5rem', 'XL']
  ];
  const LIST_INDENT_OPTIONS = [
    ['', 'Default'],
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
  const GALLERY_LINK_OPTIONS = [
    ['none', 'None'],
    ['media', 'Media file'],
    ['attachment', 'Attachment page']
  ];
  const GALLERY_LAYOUT_OPTIONS = [
    ['default', 'Default'],
    ['wide', 'Wide'],
    ['full', 'Full width']
  ];
  let selectedGalleryImageId = null;

  function debounce(fn, wait){
    let timeoutId = null;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => fn(...args), wait || 200);
    };
  }

  function createFieldShell(labelText){
    const field = document.createElement('div');
    field.className = 'pe-inspector-field';
    const label = document.createElement('label');
    label.className = 'pe-inspector-label';
    label.textContent = labelText;
    field.appendChild(label);
    return { field, label };
  }

  function createTextInput(labelText, value, onChange, multiline){
    const { field } = createFieldShell(labelText);
    const input = document.createElement(multiline ? 'textarea' : 'input');
    if (!multiline) input.type = 'text';
    input.value = value || '';
    input.addEventListener('input', debounce(() => onChange(input.value), 150));
    field.appendChild(input);
    return field;
  }

  function createSelect(labelText, value, options, onChange){
    const { field } = createFieldShell(labelText);
    const select = document.createElement('select');
    options.forEach(([optionValue, optionLabel]) => {
      const option = document.createElement('option');
      option.value = optionValue;
      option.textContent = optionLabel;
      select.appendChild(option);
    });
    select.value = value;
    select.addEventListener('change', () => onChange(select.value));
    field.appendChild(select);
    return field;
  }

  function createCheckbox(labelText, checked, onChange){
    const { field, label } = createFieldShell(labelText);
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!checked;
    input.addEventListener('change', () => onChange(input.checked));
    label.classList.add('pe-inspector-label-inline');
    field.appendChild(input);
    return field;
  }

  function createRangeInput(labelText, value, min, max, step, suffix, onChange) {
    const { field } = createFieldShell(labelText);
    const wrapper = document.createElement('div');
    wrapper.className = 'pe-inspector-range';
    const input = document.createElement('input');
    const output = document.createElement('span');
    input.type = 'range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step || 1);
    input.value = String(value);
    output.className = 'pe-inspector-range-value';
    output.textContent = `${value}${suffix || ''}`;
    input.addEventListener('input', () => {
      output.textContent = `${input.value}${suffix || ''}`;
      onChange(Number(input.value));
    });
    wrapper.append(input, output);
    field.appendChild(wrapper);
    return field;
  }

  function createColorInput(labelText, value, onChange, fallback){
    const { field } = createFieldShell(labelText);
    const input = document.createElement('input');
    input.type = 'color';
    input.value = /^#[0-9a-f]{6}$/i.test(value || '') ? value : (fallback || '#111827');
    input.addEventListener('input', () => onChange(input.value));
    field.appendChild(input);
    return field;
  }

  function createSection(title){
    const section = document.createElement('section');
    section.className = 'pe-inspector-section';
    const heading = document.createElement('h3');
    heading.className = 'pe-inspector-section-title';
    heading.textContent = title;
    section.appendChild(heading);
    return section;
  }

  function createActionButton(labelText, className, onClick){
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className || 'pe-inspector-action';
    button.textContent = labelText;
    button.addEventListener('click', onClick);
    return button;
  }

  function createFeaturedImageField(page){
    const { field } = createFieldShell('Featured image');
    const featuredImage = page && page.attrs && page.attrs.featuredImage ? String(page.attrs.featuredImage).trim() : '';
    const preview = document.createElement('div');
    preview.className = 'pe-inspector-featured-image';
    if (featuredImage) {
      const image = document.createElement('img');
      image.src = featuredImage;
      image.alt = 'Featured image preview';
      preview.appendChild(image);
    } else {
      preview.textContent = 'No featured image selected.';
      preview.classList.add('is-empty');
    }
    field.appendChild(preview);

    const input = document.createElement('input');
    input.type = 'url';
    input.placeholder = 'https://...';
    input.value = featuredImage;
    input.addEventListener('input', debounce(() => {
      EditorCore.setPageAttrs({ featuredImage: input.value.trim() });
    }, 150));
    field.appendChild(input);

    const actions = document.createElement('div');
    actions.className = 'pe-inspector-actions';
    const focusButton = createActionButton(featuredImage ? 'Replace featured image' : 'Set featured image', 'pe-inspector-action', () => input.focus());
    const clearButton = createActionButton('Remove', 'pe-inspector-action', () => EditorCore.setPageAttrs({ featuredImage: '' }));
    clearButton.disabled = !featuredImage;
    actions.append(focusButton, clearButton);
    field.appendChild(actions);

    return field;
  }

  function updateAttrs(block, patch){
    EditorCore.setBlockAttrs(block.id, patch);
  }

  function updateStyle(block, patch){
    if (block.type === 'list') {
      const currentStyle = block.attrs && block.attrs.style ? block.attrs.style : {};
      const nextStyle = Object.assign({
        fontSize: '',
        fontWeight: '',
        lineHeight: '',
        textColor: '',
        backgroundColor: ''
      }, currentStyle.typography || {}, patch || {});
      updateAttrs(block, { style: Object.assign({}, currentStyle, { typography: nextStyle }) });
      return;
    }
    const nextStyle = Object.assign({
      fontSize: '',
      fontWeight: '',
      lineHeight: '',
      textColor: '',
      backgroundColor: ''
    }, block.attrs && block.attrs.style ? block.attrs.style : {}, patch || {});
    updateAttrs(block, { style: nextStyle });
  }

  function getGalleryImages(block) {
    return typeof EditorGalleryUtils.normalizeGalleryImages === 'function'
      ? EditorGalleryUtils.normalizeGalleryImages(block && block.attrs ? block.attrs.images : [])
      : [];
  }

  function updateGalleryStyle(block, patch) {
    const currentStyle = block.attrs && block.attrs.style ? block.attrs.style : {};
    const nextStyle = Object.assign({}, currentStyle, patch || {});
    if (patch && patch.spacing) nextStyle.spacing = Object.assign({}, currentStyle.spacing || {}, patch.spacing);
    if (patch && patch.border) nextStyle.border = Object.assign({}, currentStyle.border || {}, patch.border);
    updateAttrs(block, { style: nextStyle });
  }

  function updateGalleryImage(block, imageId, patch) {
    const images = getGalleryImages(block).map((image) => image.id === imageId ? Object.assign({}, image, patch || {}) : image);
    updateAttrs(block, { images });
    if (window.EditorCore) EditorCore.emit('gallery:selection', { blockId: block.id, imageId });
  }

  function renderTextStyleSection(block){
    const section = createSection('Typography');
    const style = Object.assign({
      fontSize: '',
      fontWeight: '',
      lineHeight: '',
      textColor: '',
      backgroundColor: ''
    }, block.type === 'list' && block.attrs && block.attrs.style && block.attrs.style.typography
      ? block.attrs.style.typography
      : block.attrs && block.attrs.style ? block.attrs.style : {});
    section.appendChild(createSelect('Font size', style.fontSize || '', FONT_SIZE_OPTIONS, (value) => updateStyle(block, { fontSize: value })));
    section.appendChild(createSelect('Font weight', style.fontWeight || '', FONT_WEIGHT_OPTIONS, (value) => updateStyle(block, { fontWeight: value })));
    section.appendChild(createSelect('Line height', style.lineHeight || '', LINE_HEIGHT_OPTIONS, (value) => updateStyle(block, { lineHeight: value })));
    section.appendChild(createColorInput('Text color', style.textColor, (value) => updateStyle(block, { textColor: value }), '#111827'));
    section.appendChild(createColorInput('Background color', style.backgroundColor, (value) => updateStyle(block, { backgroundColor: value }), block.type === 'code' ? '#0f172a' : '#ffffff'));
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'pe-inspector-action';
    reset.textContent = 'Reset typography';
    reset.addEventListener('click', () => updateStyle(block, {
      fontSize: '',
      fontWeight: '',
      lineHeight: '',
      textColor: '',
      backgroundColor: ''
    }));
    section.appendChild(reset);
    return section;
  }

  function renderListLayoutSection(block) {
    const section = createSection('List layout');
    const spacing = Object.assign({
      itemGap: '',
      indentWidth: ''
    }, block.attrs && block.attrs.style && block.attrs.style.spacing ? block.attrs.style.spacing : {});
    section.appendChild(createSelect('Marker style', block.attrs && block.attrs.markerStyle ? block.attrs.markerStyle : (block.attrs && block.attrs.ordered ? 'decimal' : 'disc'), block.attrs && block.attrs.ordered ? ORDERED_MARKER_OPTIONS : UNORDERED_MARKER_OPTIONS, (value) => updateAttrs(block, { markerStyle: value })));
    section.appendChild(createSelect('Item gap', spacing.itemGap || '', LIST_GAP_OPTIONS, (value) => updateAttrs(block, { style: Object.assign({}, block.attrs && block.attrs.style ? block.attrs.style : {}, { spacing: Object.assign({}, spacing, { itemGap: value }) }) })));
    section.appendChild(createSelect('Indent width', spacing.indentWidth || '', LIST_INDENT_OPTIONS, (value) => updateAttrs(block, { style: Object.assign({}, block.attrs && block.attrs.style ? block.attrs.style : {}, { spacing: Object.assign({}, spacing, { indentWidth: value }) }) })));
    return section;
  }

  function renderBlockSpecificSection(block){
    const section = createSection('Block settings');
    if (TEXT_BLOCK_TYPES.has(block.type)) {
      section.appendChild(createSelect('Type', block.type, TRANSFORM_OPTIONS, (value) => {
        if (!value || value === block.type) return;
        if (EditorCore && typeof EditorCore.transformBlock === 'function') EditorCore.transformBlock(block.id, value);
      }));
    }
    if (block.type !== 'code') {
      section.appendChild(createSelect('Alignment', block.attrs && block.attrs.align ? block.attrs.align : 'left', ALIGN_OPTIONS, (value) => updateAttrs(block, { align: value })));
    }
    if (block.type === 'heading') {
      section.appendChild(createSelect('Level', String(block.attrs && block.attrs.level ? block.attrs.level : 2), [
        ['1', 'H1'],
        ['2', 'H2'],
        ['3', 'H3'],
        ['4', 'H4'],
        ['5', 'H5'],
        ['6', 'H6']
      ], (value) => updateAttrs(block, { level: Number(value) })));
    }
    if (block.type === 'list') {
      section.appendChild(createCheckbox('Ordered list', block.attrs && block.attrs.ordered, (value) => updateAttrs(block, { ordered: value, markerStyle: value ? 'decimal' : 'disc' })));
    }
    if (block.type === 'code') {
      section.appendChild(createSelect('Language', block.attrs && block.attrs.language ? String(block.attrs.language).toLowerCase() : '', CODE_LANGUAGE_OPTIONS, (value) => updateAttrs(block, { language: value })));
    }
    if (block.type === 'drawer') {
      section.appendChild(createSelect('Position', block.attrs && block.attrs.position ? block.attrs.position : 'right', [['right', 'Right'], ['left', 'Left']], (value) => updateAttrs(block, { position: value })));
      section.appendChild(createTextInput('Width', block.attrs && block.attrs.width ? block.attrs.width : '400px', (value) => updateAttrs(block, { width: value }), false));
      section.appendChild(createCheckbox('Overlay', !(block.attrs && block.attrs.overlay === false), (value) => updateAttrs(block, { overlay: value })));
      section.appendChild(createCheckbox('Close on outside click', !(block.attrs && block.attrs.closeOnOutside === false), (value) => updateAttrs(block, { closeOnOutside: value })));
      section.appendChild(createTextInput('Trigger label', block.attrs && block.attrs.trigger && block.attrs.trigger.label ? block.attrs.trigger.label : 'Open Drawer', (value) => updateAttrs(block, { trigger: Object.assign({}, block.attrs && block.attrs.trigger ? block.attrs.trigger : {}, { label: value }) }), false));
    }
    if (block.type === 'cover') {
      const background = Object.assign({
        type: null,
        src: null,
        alt: '',
        poster: '',
        focalPoint: { x: 0.5, y: 0.5 },
        fixed: false,
        autoplay: true,
        loop: true
      }, block.attrs && block.attrs.background ? block.attrs.background : {});
      const overlay = Object.assign({ color: '#000000', opacity: 0.5 }, block.attrs && block.attrs.overlay ? block.attrs.overlay : {});
      const style = Object.assign({ layout: 'default' }, block.attrs && block.attrs.style ? block.attrs.style : {});
      const mergeBackground = (patch) => updateAttrs(block, { background: Object.assign({}, background, patch) });
      const mergeOverlay = (patch) => updateAttrs(block, { overlay: Object.assign({}, overlay, patch) });
      const mergeStyle = (patch) => updateAttrs(block, { style: Object.assign({}, style, patch) });
      section.appendChild(createSelect('Background type', background.type || '', [['', 'None'], ['image', 'Image'], ['video', 'Video']], (value) => mergeBackground({ type: value || null })));
      section.appendChild(createTextInput('Background source', background.src ? String(background.src) : '', (value) => mergeBackground({ src: value.trim() || null }), true));
      section.appendChild(createTextInput('Alt text', background.alt || '', (value) => mergeBackground({ alt: value }), false));
      if (background.type === 'video') {
        section.appendChild(createTextInput('Poster image', background.poster || '', (value) => mergeBackground({ poster: value }), true));
        section.appendChild(createCheckbox('Autoplay', background.autoplay !== false, (value) => mergeBackground({ autoplay: value })));
        section.appendChild(createCheckbox('Loop video', background.loop !== false, (value) => mergeBackground({ loop: value })));
      } else {
        section.appendChild(createCheckbox('Fixed background', !!background.fixed, (value) => mergeBackground({ fixed: value })));
        section.appendChild(createRangeInput('Focal point X', Math.round((background.focalPoint && background.focalPoint.x !== undefined ? background.focalPoint.x : 0.5) * 100), 0, 100, 1, '%', (value) => mergeBackground({ focalPoint: Object.assign({}, background.focalPoint || { x: 0.5, y: 0.5 }, { x: value / 100 }) })));
        section.appendChild(createRangeInput('Focal point Y', Math.round((background.focalPoint && background.focalPoint.y !== undefined ? background.focalPoint.y : 0.5) * 100), 0, 100, 1, '%', (value) => mergeBackground({ focalPoint: Object.assign({}, background.focalPoint || { x: 0.5, y: 0.5 }, { y: value / 100 }) })));
      }
      section.appendChild(createColorInput('Overlay color', overlay.color || '#000000', (value) => mergeOverlay({ color: value }), '#000000'));
      section.appendChild(createRangeInput('Overlay opacity', Math.round((Number(overlay.opacity) || 0) * 100), 0, 100, 1, '%', (value) => mergeOverlay({ opacity: value / 100 })));
      section.appendChild(createSelect('Content position', block.attrs && block.attrs.contentPosition ? block.attrs.contentPosition : 'center center', [
        ['top left', 'Top left'],
        ['top center', 'Top center'],
        ['top right', 'Top right'],
        ['center left', 'Center left'],
        ['center center', 'Center'],
        ['center right', 'Center right'],
        ['bottom left', 'Bottom left'],
        ['bottom center', 'Bottom center'],
        ['bottom right', 'Bottom right']
      ], (value) => updateAttrs(block, { contentPosition: value })));
      section.appendChild(createSelect('Minimum height', block.attrs && block.attrs.minHeight ? block.attrs.minHeight : '50vh', [['auto', 'Auto'], ['50vh', '50vh'], ['75vh', '75vh'], ['100vh', '100vh'], ['320px', '320px'], ['480px', '480px']], (value) => updateAttrs(block, { minHeight: value })));
      section.appendChild(createSelect('Layout width', style.layout || 'default', [['default', 'Default'], ['wide', 'Wide'], ['full', 'Full width']], (value) => mergeStyle({ layout: value })));
    }
    return section;
  }

  function renderTextBlockActionsSection(block){
    const section = createSection('Block actions');
    const actions = document.createElement('div');
    actions.className = 'pe-inspector-actions';
    const rootBlocks = EditorCore && typeof EditorCore.getBlocks === 'function' ? EditorCore.getBlocks() : [];
    function findBlockEntry(id, blocks) {
      const list = Array.isArray(blocks) ? blocks : [];
      for (let index = 0; index < list.length; index += 1) {
        const entry = list[index];
        if (!entry) continue;
        if (entry.id === id) return { index, list };
        const childMatch = findBlockEntry(id, entry.attrs && Array.isArray(entry.attrs.children) ? entry.attrs.children : []);
        if (childMatch) return childMatch;
      }
      return null;
    }
    const blockEntry = findBlockEntry(block.id, rootBlocks);
    const blockIndex = blockEntry ? blockEntry.index : -1;
    const blockListLength = blockEntry && Array.isArray(blockEntry.list) ? blockEntry.list.length : 0;
    const moveUp = createActionButton('Move up', 'pe-inspector-action', () => {
      if (EditorCore && typeof EditorCore.moveBlock === 'function') EditorCore.moveBlock(block.id, 'up');
    });
    moveUp.disabled = blockIndex <= 0;
    const moveDown = createActionButton('Move down', 'pe-inspector-action', () => {
      if (EditorCore && typeof EditorCore.moveBlock === 'function') EditorCore.moveBlock(block.id, 'down');
    });
    moveDown.disabled = blockIndex === -1 || blockIndex === blockListLength - 1;
    const remove = createActionButton('Delete block', 'pe-inspector-danger', () => {
      if (window.confirm('Delete this block?') && EditorCore && typeof EditorCore.deleteBlock === 'function') {
        EditorCore.deleteBlock(block.id);
      }
    });
    actions.append(moveUp, moveDown, remove);
    section.appendChild(actions);
    return section;
  }

  function renderGallerySettingsSection(block) {
    const section = createSection('Gallery settings');
    const style = block.attrs && block.attrs.style ? block.attrs.style : {};
    const spacing = style.spacing || {};
    const border = style.border || {};
    section.appendChild(createRangeInput('Columns', Number(block.attrs && block.attrs.columns ? block.attrs.columns : 3), 1, 8, 1, '', (value) => updateAttrs(block, { columns: value })));
    section.appendChild(createRangeInput('Gap', Number.parseInt(spacing.gap || '12', 10) || 12, 0, 48, 1, 'px', (value) => updateGalleryStyle(block, { spacing: { gap: `${value}px` } })));
    section.appendChild(createCheckbox('Crop images', block.attrs && block.attrs.crop !== false, (value) => updateAttrs(block, { crop: value })));
    section.appendChild(createSelect('Link behavior', block.attrs && block.attrs.linkTo ? block.attrs.linkTo : 'none', GALLERY_LINK_OPTIONS, (value) => updateAttrs(block, { linkTo: value })));
    section.appendChild(createCheckbox('Enable lightbox', block.attrs && block.attrs.lightbox, (value) => updateAttrs(block, { lightbox: value })));
    section.appendChild(createSelect('Layout width', style.layout || 'default', GALLERY_LAYOUT_OPTIONS, (value) => updateGalleryStyle(block, { layout: value })));
    section.appendChild(createTextInput('Border radius', border.radius || '', (value) => updateGalleryStyle(block, { border: { radius: value } }), false));
    section.appendChild(createTextInput('Border width', border.width || '', (value) => updateGalleryStyle(block, { border: { width: value } }), false));
    section.appendChild(createColorInput('Border color', border.color || '#d1d5db', (value) => updateGalleryStyle(block, { border: { color: value } }), '#d1d5db'));
    return section;
  }

  function renderGalleryImageSection(block, imageId) {
    const image = getGalleryImages(block).find((entry) => entry.id === imageId);
    if (!image) return null;
    const section = createSection('Selected image');
    section.appendChild(createTextInput('Source', image.src || '', (value) => updateGalleryImage(block, imageId, { src: value }), true));
    section.appendChild(createTextInput('Alt text', image.alt || '', (value) => updateGalleryImage(block, imageId, { alt: value }), false));
    section.appendChild(createTextInput('Caption', image.caption || '', (value) => updateGalleryImage(block, imageId, { caption: value }), true));
    return section;
  }

  function renderGenericAttrsSection(block){
    const section = createSection('Attributes');
    Object.entries(block.attrs || {}).forEach(([key, value]) => {
      if (key === 'style') return;
      if (TEXT_BLOCK_TYPES.has(block.type) && ['align', 'level', 'ordered', 'language', 'markerStyle'].includes(key)) return;
      if (block.type === 'cover' && ['background', 'overlay', 'style', 'children', 'contentPosition', 'minHeight'].includes(key)) return;
      if (typeof value === 'string') section.appendChild(createTextInput(key, value, (nextValue) => updateAttrs(block, { [key]: nextValue }), value.length > 120));
      if (typeof value === 'number') section.appendChild(createTextInput(key, String(value), (nextValue) => updateAttrs(block, { [key]: Number(nextValue) }), false));
      if (typeof value === 'boolean') section.appendChild(createCheckbox(key, value, (nextValue) => updateAttrs(block, { [key]: nextValue })));
    });
    return section;
  }

  function showBlock(block){
    if (!block || !block.id) {
      target.innerHTML = '<em>No selection</em>';
      return;
    }

    target.innerHTML = '';
    const summary = document.createElement('div');
    summary.className = 'pe-inspector-summary';
    summary.innerHTML = `<strong>${block.type}</strong><span>${block.id}</span>`;
    target.appendChild(summary);

    if (block.type === 'gallery') {
      const imageSection = selectedGalleryImageId ? renderGalleryImageSection(block, selectedGalleryImageId) : null;
      if (imageSection) target.appendChild(imageSection);
      target.appendChild(renderGallerySettingsSection(block));
      return;
    }

    if (TEXT_BLOCK_TYPES.has(block.type)) {
      target.appendChild(renderBlockSpecificSection(block));
      target.appendChild(renderTextStyleSection(block));
      if (block.type === 'list') target.appendChild(renderListLayoutSection(block));
      target.appendChild(renderTextBlockActionsSection(block));
    }
    target.appendChild(renderGenericAttrsSection(block));
  }

  // Page rendering
  function createPageHeader(title){
    const h = document.createElement('div');
    h.className = 'pe-page-header';
    const t = document.createElement('input');
    t.type = 'text';
    t.className = 'pe-page-title';
    t.placeholder = 'Page title';
    t.value = title || '';
    h.appendChild(t);
    return { header: h, input: t };
  }

  function computeWordCount(blocks){
    try{
      return (blocks || []).map(b => {
        if (b.attrs && typeof b.attrs.text === 'string') return b.attrs.text;
        if (b.attrs && b.attrs.children && Array.isArray(b.attrs.children)) return b.attrs.children.map(c=>c.attrs && c.attrs.text ? c.attrs.text : '').join(' ');
        return '';
      }).join(' ').split(/\s+/).filter(Boolean).length;
    }catch(e){ return 0; }
  }

  function isPostEditor() {
    const label = document.querySelector('.editor-document-bar__post-type-label');
    return /post/i.test(label && label.textContent ? label.textContent : '');
  }

  function isInspectorFocused(){
    const active = document.activeElement;
    return !!(active && target.contains(active) && ['INPUT','TEXTAREA','SELECT'].includes(active.tagName));
  }

  function renderPage(){
    const page = EditorCore.getPage() || { attrs: {} };
    target.innerHTML = '';
    const top = document.createElement('div'); top.className = 'pe-inspector-page';

    // Title
    const { header, input } = createPageHeader(page.attrs && page.attrs.title ? page.attrs.title : '');
    input.addEventListener('input', debounce((val)=> EditorCore.setPageAttrs({ title: input.value } ), 200));
    top.appendChild(header);

    // Featured image
    top.appendChild(createFeaturedImageField(page));

    // Meta line: word count & read time
    const meta = document.createElement('div'); meta.className='pe-page-meta';
    const wc = computeWordCount(EditorCore.getBlocks());
    meta.textContent = `${wc} words, ${Math.max(1, Math.round(wc/200))} minutes read time.`;
    top.appendChild(meta);

    // Status, Publish, Slug, Author, Template, Discussion, Parent
    const section = createSection(isPostEditor() ? 'Post settings' : 'Page settings');
    if (isPostEditor()) {
      section.appendChild(createTextInput('Excerpt', page.attrs && page.attrs.excerpt ? page.attrs.excerpt : '', (v)=> EditorCore.setPageAttrs({ excerpt: v }), false));
      section.appendChild(createTextInput('Categories', page.attrs && page.attrs.categories ? page.attrs.categories : '', (v)=> EditorCore.setPageAttrs({ categories: v }), false));
      section.appendChild(createTextInput('Tags', page.attrs && page.attrs.tags ? page.attrs.tags : '', (v)=> EditorCore.setPageAttrs({ tags: v }), false));
      section.appendChild(createTextInput('Date', page.attrs && page.attrs.date ? page.attrs.date : '', (v)=> EditorCore.setPageAttrs({ date: v }), false));
    }
    // Status select
    section.appendChild(createSelect('Status', page.attrs && page.attrs.status ? page.attrs.status : 'draft', [['draft','Draft'],['published','Published']], (v)=> EditorCore.setPageAttrs({ status: v })));
    // Publish immediate/scheduled (simple text)
    section.appendChild(createTextInput('Publish', page.attrs && page.attrs.publish ? page.attrs.publish : 'Immediately', (v)=> EditorCore.setPageAttrs({ publish: v }), false));
    section.appendChild(createTextInput('Slug', page.attrs && page.attrs.slug ? page.attrs.slug : '', (v)=> EditorCore.setPageAttrs({ slug: v }), false));
    section.appendChild(createTextInput('Author', page.attrs && page.attrs.author ? page.attrs.author : '', (v)=> EditorCore.setPageAttrs({ author: v }), false));
    section.appendChild(createTextInput('Template', page.attrs && page.attrs.template ? page.attrs.template : '', (v)=> EditorCore.setPageAttrs({ template: v }), false));
    section.appendChild(createSelect('Discussion', page.attrs && page.attrs.discussion ? page.attrs.discussion : 'open', [['open','Open'],['closed','Closed'],['pings','Pings only']], (v)=> EditorCore.setPageAttrs({ discussion: v })));
    // Parent (simple text select placeholder)
    section.appendChild(createTextInput('Parent', page.attrs && page.attrs.parent ? page.attrs.parent : '', (v)=> EditorCore.setPageAttrs({ parent: v }), false));

    const move = document.createElement('button'); move.type='button'; move.className='pe-inspector-danger'; move.textContent='Move to trash';
    move.addEventListener('click', ()=>{ if (confirm('Move page to trash?')) EditorCore.emit('page:delete'); });
    section.appendChild(move);

    top.appendChild(section);

    // LiteSpeed toggles (example)
    const perf = createSection('LiteSpeed');
    perf.appendChild(createCheckbox('Disable Cache', page.attrs && page.attrs.disableCache, (v)=> EditorCore.setPageAttrs({ disableCache: v })));
    perf.appendChild(createCheckbox('Disable Image Lazyload', page.attrs && page.attrs.disableImageLazyload, (v)=> EditorCore.setPageAttrs({ disableImageLazyload: v })));
    perf.appendChild(createCheckbox('Disable VPI', page.attrs && page.attrs.disableVPI, (v)=> EditorCore.setPageAttrs({ disableVPI: v })));
    top.appendChild(perf);

    target.appendChild(top);
    // unsaved indicator
    const unsaved = document.getElementById('pe-inspector-unsaved');
    if (EditorCore.getPage && EditorCore.getPage()._dirty) { if (unsaved) unsaved.hidden = false; } else { if (unsaved) unsaved.hidden = true; }
  }

  // Tab wiring
  const tabPageBtn = document.getElementById('pe-tab-page');
  const tabBlockBtn = document.getElementById('pe-tab-block');
  function setActiveTab(tab){ if(tab === 'page'){ tabPageBtn.classList.add('active'); tabBlockBtn.classList.remove('active'); renderPage(); } else { tabPageBtn.classList.remove('active'); tabBlockBtn.classList.add('active'); const block = EditorCore.getSelectedBlock(); showBlock(block); } }
  if (tabPageBtn && tabBlockBtn){ tabPageBtn.addEventListener('click', ()=> setActiveTab('page')); tabBlockBtn.addEventListener('click', ()=> setActiveTab('block')); }

  EditorCore.on('select', (block) => {
    // when a block is selected, switch to Block tab
    if (tabBlockBtn) setActiveTab('block');
    if (!block || block.type !== 'gallery') selectedGalleryImageId = null;
    showBlock(block || null);
  });

  EditorCore.on('gallery:selection', (selection) => {
    selectedGalleryImageId = selection && selection.imageId ? selection.imageId : null;
    const pageTabActive = document.getElementById('pe-tab-page') && document.getElementById('pe-tab-page').classList.contains('active');
    if (!pageTabActive) showBlock(EditorCore.getSelectedBlock());
  });

  EditorCore.on('state:changed', (state) => {
    if (isInspectorFocused()) return;
    const block = state && state.selectedId ? (state.blocks || []).find((entry) => entry.id === state.selectedId) : null;
    if (!block || block.type !== 'gallery') selectedGalleryImageId = null;
    // update unsaved indicator for page
    const unsaved = document.getElementById('pe-inspector-unsaved');
    const p = EditorCore.getPage ? EditorCore.getPage() : null;
    if (unsaved) { if (p && p._dirty) unsaved.hidden = false; else unsaved.hidden = true; }
    // if page tab active, refresh page
    const pageTabActive = document.getElementById('pe-tab-page') && document.getElementById('pe-tab-page').classList.contains('active');
    if (pageTabActive) renderPage(); else showBlock(block || null);
  });

  EditorCore.on('page:changed', ()=>{
    if (isInspectorFocused()) return;
    const pageTabActive = document.getElementById('pe-tab-page') && document.getElementById('pe-tab-page').classList.contains('active');
    if (pageTabActive) renderPage();
  });
})();
