(function () {
  const modules = window.EditorBlockModules = window.EditorBlockModules || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};
  const runtimeUtils = window.EditorBlockRuntimeUtils || {};

  const FIELD_TYPES = [
    'field_text',
    'field_textarea',
    'field_email',
    'field_phone',
    'field_number',
    'field_select',
    'field_radio',
    'field_checkbox',
    'field_checkbox_group',
    'field_date',
    'field_file',
    'field_hidden'
  ];

  const FIELD_DEFAULTS = {
    field_text: { name: 'field', label: 'Text', placeholder: '', required: false, min: null, max: null, className: '' },
    field_textarea: { name: 'textarea', label: 'Long text', rows: 4, placeholder: '', required: false, className: '' },
    field_email: { name: 'email', label: 'Email', placeholder: '', required: false, className: '' },
    field_phone: { name: 'phone', label: 'Phone', placeholder: '', required: false, className: '' },
    field_number: { name: 'number', label: 'Number', min: null, max: null, step: 1, required: false, className: '' },
    field_select: { name: 'select', label: 'Choose', options: [{ label: 'Option 1', value: '1' }], required: false, className: '' },
    field_radio: { name: 'radio', label: 'Choose', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }], required: false, className: '' },
    field_checkbox: { name: 'checkbox', label: 'Check', required: false, className: '' },
    field_checkbox_group: { name: 'checkboxes', label: 'Options', options: [{ label: 'A', value: 'a' }], required: false, className: '' },
    field_date: { name: 'date', label: 'Date', required: false, className: '' },
    field_file: { name: 'file', label: 'Upload', accept: '', multiple: false, required: false, className: '' },
    field_hidden: { name: 'hidden', value: '', className: '' }
  };

  const FIELD_REGISTRY = {};

  function clone(value) {
    return runtimeUtils && typeof runtimeUtils.clone === 'function' ? runtimeUtils.clone(value) : value;
  }

  function mergeAttrs(defaults, attrs) {
    return runtimeUtils && typeof runtimeUtils.mergeAttrs === 'function'
      ? runtimeUtils.mergeAttrs(defaults, attrs)
      : Object.assign({}, defaults || {}, attrs || {});
  }

  function escapeAttribute(value) {
    const stringValue = value == null ? '' : String(value);
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(stringValue) : stringValue;
  }

  function escapeHtml(value) {
    const stringValue = value == null ? '' : String(value);
    return typeof htmlUtils.escapeHtml === 'function' ? htmlUtils.escapeHtml(stringValue) : stringValue;
  }

  function getFieldTypes() {
    return FIELD_TYPES.slice();
  }

  function getAllFieldDefaults() {
    return getFieldTypes().reduce((acc, type) => {
      acc[type] = getFieldDefaults(type);
      return acc;
    }, {});
  }

  function registerFieldType(type, config) {
    if (!type) return;

    const nextConfig = Object.assign({}, config || {});
    if (Object.prototype.hasOwnProperty.call(nextConfig, 'defaults')) {
      FIELD_REGISTRY[type] = Object.assign({}, FIELD_REGISTRY[type] || {}, nextConfig, {
        defaults: clone(nextConfig.defaults)
      });
    } else {
      FIELD_REGISTRY[type] = Object.assign({}, FIELD_REGISTRY[type] || {}, nextConfig);
    }

    if (FIELD_TYPES.indexOf(type) === -1) {
      FIELD_TYPES.push(type);
    }

    if (window.EditorFormBlockRuntime) {
      window.EditorFormBlockRuntime.fieldTypes = getFieldTypes();
      window.EditorFormBlockRuntime.fieldDefaults = getAllFieldDefaults();
    }
  }

  function getFieldDefaults(type) {
    const registered = FIELD_REGISTRY[type];
    if (registered && Object.prototype.hasOwnProperty.call(registered, 'defaults')) {
      return clone(registered.defaults);
    }

    return clone(FIELD_DEFAULTS[type] || {});
  }

  function createField(type, attrs) {
    return {
      id: null,
      type,
      attrs: mergeAttrs(getFieldDefaults(type), attrs)
    };
  }

  function clampSectionColumns(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 1;
    return Math.min(3, Math.max(1, Math.round(parsed)));
  }

  function createSection(attrs) {
    const nextAttrs = attrs || {};
    const fields = Array.isArray(nextAttrs.fields) ? nextAttrs.fields.slice() : [];
    return {
      id: nextAttrs.id || (runtimeUtils && typeof runtimeUtils.createId === 'function'
        ? runtimeUtils.createId('section')
        : `section_${Date.now()}`),
      columns: clampSectionColumns(nextAttrs.columns || 1),
      fields
    };
  }

  function normalizeSections(attrs) {
    const nextAttrs = attrs || {};
    if (Array.isArray(nextAttrs.sections) && nextAttrs.sections.length) {
      return nextAttrs.sections.map((section) => createSection(section));
    }
    if (Array.isArray(nextAttrs.fields) && nextAttrs.fields.length) {
      return [createSection({ columns: 1, fields: nextAttrs.fields })];
    }
    return [createSection({ columns: 1, fields: [] })];
  }

  function flattenSectionFields(sections) {
    return (sections || []).reduce((acc, section) => acc.concat(Array.isArray(section.fields) ? section.fields : []), []);
  }

  function syncFormAttrs(attrs) {
    const nextAttrs = mergeAttrs({
      fields: [],
      sections: [createSection({ columns: 1, fields: [] })],
      layout: 'stack',
      submitAction: { type: 'swa', config: {} },
      validationMode: 'inline',
      className: ''
    }, attrs);
    nextAttrs.sections = normalizeSections(nextAttrs);
    nextAttrs.fields = flattenSectionFields(nextAttrs.sections);
    return nextAttrs;
  }

  function createForm(attrs) {
    return {
      id: null,
      type: 'form',
      attrs: syncFormAttrs(attrs)
    };
  }

  function createElement(tagName, className, textContent) {
    const el = document.createElement(tagName);
    if (className) el.className = className;
    if (typeof textContent === 'string') el.textContent = textContent;
    return el;
  }

  function getFieldId(block) {
    if (block && block.id) return block.id;
    const attrs = block && block.attrs ? block.attrs : {};
    return attrs.name ? `field-${String(attrs.name).toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}` : '';
  }

  function getFieldClassName(block, baseClassName) {
    const attrs = block && block.attrs ? block.attrs : {};
    return [baseClassName, attrs.className || ''].join(' ').trim();
  }

  function createFieldWrapper(block, baseClassName, labelText) {
    const wrap = createElement('div', getFieldClassName(block, baseClassName));
    const label = createElement('label', '', labelText);
    const fieldId = getFieldId(block);
    if (fieldId) label.htmlFor = fieldId;
    wrap.appendChild(label);
    return { wrap, label, fieldId };
  }

  function applyCommonInputAttrs(input, block) {
    const attrs = block && block.attrs ? block.attrs : {};
    const fieldId = getFieldId(block);
    if (fieldId) input.id = fieldId;
    if (attrs.name) input.name = attrs.name;
    if (attrs.placeholder) input.placeholder = attrs.placeholder;
    if (attrs.required) input.required = true;
    if (attrs.min != null && attrs.min !== '') input.min = attrs.min;
    if (attrs.max != null && attrs.max !== '') input.max = attrs.max;
    if (attrs.step != null && attrs.step !== '') input.step = attrs.step;
    if (attrs.value != null && attrs.value !== '') input.value = attrs.value;
    if (attrs.accept) input.accept = attrs.accept;
    if (attrs.multiple) input.multiple = true;
  }

  function getFieldOptionList(block) {
    const attrs = block && block.attrs ? block.attrs : {};
    return Array.isArray(attrs.options) ? attrs.options : [];
  }

  function renderTextLikeField(block, baseClassName, inputType, fallbackLabel) {
    const attrs = block && block.attrs ? block.attrs : {};
    const shell = createFieldWrapper(block, baseClassName, attrs.label || fallbackLabel || 'Field');
    const input = createElement('input');
    input.type = inputType;
    applyCommonInputAttrs(input, block);
    shell.wrap.appendChild(input);
    return shell.wrap;
  }

  function renderTextareaField(block, baseClassName, fallbackLabel) {
    const attrs = block && block.attrs ? block.attrs : {};
    const shell = createFieldWrapper(block, baseClassName || 'pe-field-textarea', attrs.label || fallbackLabel || 'Textarea');
    const textarea = createElement('textarea');
    applyCommonInputAttrs(textarea, block);
    textarea.rows = attrs.rows || 4;
    shell.wrap.appendChild(textarea);
    return shell.wrap;
  }

  function renderSelectField(block, baseClassName, fallbackLabel) {
    const attrs = block && block.attrs ? block.attrs : {};
    const shell = createFieldWrapper(block, baseClassName || 'pe-field-select', attrs.label || fallbackLabel || 'Select');
    const select = createElement('select');
    applyCommonInputAttrs(select, block);
    getFieldOptionList(block).forEach((option) => {
      const el = createElement('option');
      el.value = option && option.value != null ? option.value : '';
      el.textContent = option && option.label != null ? option.label : el.value;
      select.appendChild(el);
    });
    shell.wrap.appendChild(select);
    return shell.wrap;
  }

  function renderChoiceField(block, baseClassName, inputType, fallbackLabel) {
    const attrs = block && block.attrs ? block.attrs : {};
    const wrap = createElement('div', getFieldClassName(block, baseClassName));
    wrap.appendChild(createElement('div', '', attrs.label || fallbackLabel || 'Choice'));

    getFieldOptionList(block).forEach((option) => {
      const label = createElement('label');
      const input = createElement('input');
      input.type = inputType;
      if (attrs.name) input.name = attrs.name;
      if (option && option.value != null) input.value = option.value;
      label.appendChild(input);
      label.appendChild(document.createTextNode(` ${option && option.label != null ? option.label : option && option.value != null ? option.value : ''}`));
      wrap.appendChild(label);
    });

    return wrap;
  }

  function renderCheckboxField(block, baseClassName, fallbackLabel) {
    const attrs = block && block.attrs ? block.attrs : {};
    const wrap = createElement('div', getFieldClassName(block, baseClassName || 'pe-field-checkbox'));
    const label = createElement('label');
    const input = createElement('input');
    input.type = 'checkbox';
    applyCommonInputAttrs(input, block);
    label.appendChild(input);
    label.appendChild(document.createTextNode(` ${attrs.label || fallbackLabel || 'Check'}`));
    wrap.appendChild(label);
    return wrap;
  }

  function renderHiddenField(block, baseClassName) {
    const input = createElement('input', getFieldClassName(block, baseClassName || 'pe-field-hidden'));
    input.type = 'hidden';
    applyCommonInputAttrs(input, block);
    return input;
  }

  function updateFormSections(block, sections, extraAttrs) {
    if (!window.EditorCore || typeof window.EditorCore.setBlockAttrs !== 'function') return;
    const normalizedSections = normalizeSections({ sections });
    window.EditorCore.setBlockAttrs(block.id, Object.assign({
      sections: normalizedSections,
      fields: flattenSectionFields(normalizedSections)
    }, extraAttrs || {}));
  }

  function copySections(sections) {
    return (sections || []).map((section) => Object.assign({}, section, {
      fields: Array.isArray(section.fields) ? section.fields.slice() : []
    }));
  }

  function createChooserDialog(block, sectionIndex) {
    const defs = window.EDITOR_BLOCK_DEFINITIONS || {};
    const overlay = createElement('div', 'pe-modal-overlay');
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    });

    const dialog = createElement('div', 'pe-modal-dialog');
    Object.assign(dialog.style, {
      width: '480px',
      maxWidth: '95%',
      background: '#fff',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
    });

    const heading = createElement('h3', '', 'Add field');
    heading.style.marginTop = '0';
    const list = createElement('div', 'pe-field-chooser-list');
    Object.assign(list.style, {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px',
      maxHeight: '240px',
      overflow: 'auto',
      marginBottom: '12px'
    });

    const labelWrap = createElement('div');
    Object.assign(labelWrap.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      marginBottom: '12px'
    });
    const labelLabel = createElement('label', '', 'Field label');
    Object.assign(labelLabel.style, { fontSize: '12px', color: '#374151' });
    const labelInput = createElement('input');
    labelInput.type = 'text';
    labelInput.placeholder = 'Label';
    Object.assign(labelInput.style, {
      padding: '8px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px'
    });
    labelWrap.appendChild(labelLabel);
    labelWrap.appendChild(labelInput);

    const fieldTypes = getFieldTypes();
    let selected = null;
    fieldTypes.forEach((type) => {
      const def = defs[type] || { label: type };
      const item = createElement('button', 'pe-field-chooser-item', def.label || type);
      item.type = 'button';
      Object.assign(item.style, {
        padding: '8px',
        textAlign: 'left',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        background: '#fff'
      });
      item.addEventListener('click', () => {
        selected = type;
        Array.from(list.children).forEach((child) => {
          child.style.boxShadow = 'none';
        });
        item.style.boxShadow = 'inset 0 0 0 2px #3b82f6';
        const created = def && typeof def.create === 'function' ? def.create() : null;
        labelInput.value = created && created.attrs && created.attrs.label ? created.attrs.label : def.label || '';
      });
      list.appendChild(item);
    });

    const footer = createElement('div');
    Object.assign(footer.style, { display: 'flex', justifyContent: 'flex-end', gap: '8px' });
    const cancel = createElement('button', 'components-button', 'Cancel');
    cancel.type = 'button';
    cancel.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    const confirm = createElement('button', 'components-button components-primary', 'Add');
    confirm.type = 'button';
    confirm.addEventListener('click', () => {
      const type = selected || fieldTypes[0];
      const newField = runtimeUtils && typeof runtimeUtils.createBlock === 'function'
        ? runtimeUtils.createBlock(type)
        : createField(type);

      newField.id = newField.id || (runtimeUtils && typeof runtimeUtils.createId === 'function'
        ? runtimeUtils.createId('f')
        : `f_${Date.now()}`);
      newField.attrs = Object.assign({}, newField.attrs || {});
      if (labelInput.value) {
        newField.attrs.label = labelInput.value;
      }

      const sections = copySections(normalizeSections(block && block.attrs ? block.attrs : {}));
      const targetIndex = Math.max(0, Math.min(sectionIndex == null ? sections.length - 1 : sectionIndex, sections.length - 1));
      const targetSection = sections[targetIndex] || createSection({ columns: 1, fields: [] });
      const nextFields = Array.isArray(targetSection.fields) ? targetSection.fields.slice() : [];
      nextFields.push(newField);
      sections[targetIndex] = Object.assign({}, targetSection, { fields: nextFields });
      updateFormSections(block, sections);
      document.body.removeChild(overlay);
    });

    footer.appendChild(cancel);
    footer.appendChild(confirm);
    dialog.appendChild(heading);
    dialog.appendChild(list);
    dialog.appendChild(labelWrap);
    dialog.appendChild(footer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    labelInput.focus();
  }

  function renderFormBlock(block) {
    const wrap = createElement('div', 'pe-block-form');

    try {
      const attrs = syncFormAttrs(block && block.attrs ? block.attrs : {});
      const sections = normalizeSections(attrs);
      const header = createElement('div', 'pe-form-header');
      const title = createElement('strong', '', 'Form');
      const actions = createElement('div', 'pe-form-actions');
      const addSectionButton = createElement('button', 'components-button components-primary', 'Add section');
      addSectionButton.type = 'button';
      addSectionButton.addEventListener('click', () => {
        const nextSections = copySections(sections);
        nextSections.push(createSection({ columns: 1, fields: [] }));
        updateFormSections(block, nextSections);
      });

      actions.appendChild(addSectionButton);
      header.appendChild(title);
      header.appendChild(actions);
      header.addEventListener('click', (event) => {
        event.stopPropagation();
        if (window.EditorCore && typeof window.EditorCore.setBlockAttrs === 'function') {
          window.EditorCore.setBlockAttrs(block.id, { _selectedFieldId: null });
        }
      });
      wrap.appendChild(header);

      const list = createElement('div', 'pe-form-sections');
      const selectedFieldId = attrs._selectedFieldId || null;

      sections.forEach((section, sectionIndex) => {
        const sectionWrap = createElement('section', 'pe-form-section');
        sectionWrap.dataset.columns = String(clampSectionColumns(section.columns));
        const sectionHeader = createElement('div', 'pe-form-section__header');
        const sectionTitle = createElement('strong', '', `Section ${sectionIndex + 1}`);
        const sectionControls = createElement('div', 'pe-form-section__controls');

        [1, 2, 3].forEach((columnCount) => {
          const layoutButton = createElement('button', section.columns === columnCount ? 'is-active' : '', `${columnCount} col`);
          layoutButton.type = 'button';
          layoutButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const nextSections = copySections(sections);
            nextSections[sectionIndex] = Object.assign({}, nextSections[sectionIndex], { columns: columnCount });
            updateFormSections(block, nextSections);
          });
          sectionControls.appendChild(layoutButton);
        });

        const addFieldButton = createElement('button', '', 'Add field');
        addFieldButton.type = 'button';
        addFieldButton.addEventListener('click', (event) => {
          event.stopPropagation();
          createChooserDialog(block, sectionIndex);
        });

        const sectionUpButton = createElement('button', '', '↑');
        sectionUpButton.type = 'button';
        sectionUpButton.title = 'Move section up';
        sectionUpButton.addEventListener('click', (event) => {
          event.stopPropagation();
          if (sectionIndex === 0) return;
          const nextSections = runtimeUtils && typeof runtimeUtils.moveArrayItem === 'function'
            ? runtimeUtils.moveArrayItem(sections, sectionIndex, sectionIndex - 1)
            : copySections(sections);
          updateFormSections(block, nextSections);
        });

        const sectionDownButton = createElement('button', '', '↓');
        sectionDownButton.type = 'button';
        sectionDownButton.title = 'Move section down';
        sectionDownButton.addEventListener('click', (event) => {
          event.stopPropagation();
          if (sectionIndex >= sections.length - 1) return;
          const nextSections = runtimeUtils && typeof runtimeUtils.moveArrayItem === 'function'
            ? runtimeUtils.moveArrayItem(sections, sectionIndex, sectionIndex + 1)
            : copySections(sections);
          updateFormSections(block, nextSections);
        });

        const removeSectionButton = createElement('button', '', 'Remove');
        removeSectionButton.type = 'button';
        removeSectionButton.addEventListener('click', (event) => {
          event.stopPropagation();
          if (!window.confirm('Remove section?')) return;
          const nextSections = sections.length > 1
            ? (runtimeUtils && typeof runtimeUtils.removeArrayItem === 'function'
              ? runtimeUtils.removeArrayItem(sections, sectionIndex)
              : sections.filter((_, nextIndex) => nextIndex !== sectionIndex))
            : [createSection({ columns: 1, fields: [] })];
          updateFormSections(block, nextSections, {
            _selectedFieldId: selectedFieldId
          });
        });

        sectionControls.appendChild(addFieldButton);
        sectionControls.appendChild(sectionUpButton);
        sectionControls.appendChild(sectionDownButton);
        sectionControls.appendChild(removeSectionButton);
        sectionHeader.appendChild(sectionTitle);
        sectionHeader.appendChild(sectionControls);
        sectionWrap.appendChild(sectionHeader);

        const sectionFields = createElement('div', 'pe-form-section__fields');
        sectionFields.dataset.columns = String(clampSectionColumns(section.columns));

        (Array.isArray(section.fields) ? section.fields : []).forEach((field, fieldIndex) => {
          const fieldWrap = createElement('div', 'pe-form-field');
          const meta = createElement('div', 'pe-form-field-meta');
          const label = createElement('div', 'pe-form-field-label', field && field.attrs && field.attrs.label ? field.attrs.label : field.type || 'field');
          const controls = createElement('div', 'pe-form-field-controls');

          const updateSectionFields = (nextFields, extraAttrs) => {
            const nextSections = copySections(sections);
            nextSections[sectionIndex] = Object.assign({}, nextSections[sectionIndex], { fields: nextFields });
            updateFormSections(block, nextSections, extraAttrs);
          };

          const upButton = createElement('button', '', '↑');
          upButton.type = 'button';
          upButton.title = 'Move up';
          upButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const nextFields = runtimeUtils && typeof runtimeUtils.moveArrayItem === 'function'
              ? runtimeUtils.moveArrayItem(section.fields, fieldIndex, fieldIndex - 1)
              : (section.fields || []).slice();
            updateSectionFields(nextFields);
          });

          const downButton = createElement('button', '', '↓');
          downButton.type = 'button';
          downButton.title = 'Move down';
          downButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const nextFields = runtimeUtils && typeof runtimeUtils.moveArrayItem === 'function'
              ? runtimeUtils.moveArrayItem(section.fields, fieldIndex, fieldIndex + 1)
              : (section.fields || []).slice();
            updateSectionFields(nextFields);
          });

          const editButton = createElement('button', '', 'Edit');
          editButton.type = 'button';
          editButton.title = 'Edit properties';
          editButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const newLabel = window.prompt('Field label', field && field.attrs && field.attrs.label ? field.attrs.label : '');
            if (newLabel === null) return;
            const nextFields = (section.fields || []).slice();
            nextFields[fieldIndex] = Object.assign({}, nextFields[fieldIndex], {
              attrs: Object.assign({}, nextFields[fieldIndex] && nextFields[fieldIndex].attrs ? nextFields[fieldIndex].attrs : {}, { label: newLabel })
            });
            updateSectionFields(nextFields);
          });

          const removeButton = createElement('button', '', 'Remove');
          removeButton.type = 'button';
          removeButton.title = 'Remove field';
          removeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            if (!window.confirm('Remove field?')) return;
            const nextFields = runtimeUtils && typeof runtimeUtils.removeArrayItem === 'function'
              ? runtimeUtils.removeArrayItem(section.fields, fieldIndex)
              : (section.fields || []).filter((_, nextIndex) => nextIndex !== fieldIndex);
            updateSectionFields(nextFields, {
              _selectedFieldId: selectedFieldId === field.id ? null : selectedFieldId
            });
          });

          controls.appendChild(upButton);
          controls.appendChild(downButton);
          controls.appendChild(editButton);
          controls.appendChild(removeButton);
          if (selectedFieldId !== field.id) {
            controls.style.display = 'none';
          }

          meta.appendChild(label);
          meta.appendChild(controls);
          fieldWrap.appendChild(meta);
          fieldWrap.addEventListener('click', (event) => {
            event.stopPropagation();
            if (window.EditorCore && typeof window.EditorCore.setBlockAttrs === 'function') {
              window.EditorCore.setBlockAttrs(block.id, { _selectedFieldId: field.id });
            }
          });

          const preview = runtimeUtils && typeof runtimeUtils.renderBlock === 'function'
            ? runtimeUtils.renderBlock(field, 'field_text')
            : createElement('div');
          preview.classList.add('pe-field-preview');
          fieldWrap.appendChild(preview);
          sectionFields.appendChild(fieldWrap);
        });

        sectionWrap.appendChild(sectionFields);
        list.appendChild(sectionWrap);
      });

      wrap.appendChild(list);
    } catch (error) {
      console.error('form render error', error);
    }

    return wrap;
  }

  function getRequiredAttr(attrs) {
    return attrs && attrs.required ? ' required' : '';
  }

  function getCommonFieldAttrs(block, extras) {
    const attrs = block && block.attrs ? block.attrs : {};
    const values = Object.assign({}, extras || {});
    if (attrs.name) values.name = attrs.name;
    const fieldId = getFieldId(block);
    if (fieldId) values.id = fieldId;
    if (attrs.placeholder) values.placeholder = attrs.placeholder;
    if (attrs.min != null && attrs.min !== '') values.min = attrs.min;
    if (attrs.max != null && attrs.max !== '') values.max = attrs.max;
    if (attrs.step != null && attrs.step !== '') values.step = attrs.step;
    if (attrs.accept) values.accept = attrs.accept;
    if (attrs.multiple) values.multiple = 'multiple';
    if (attrs.value != null && attrs.value !== '') values.value = attrs.value;

    return Object.keys(values).map((key) => {
      if (values[key] === 'multiple') return ' multiple';
      return ` ${key}="${escapeAttribute(values[key])}"`;
    }).join('');
  }

  function saveFieldShell(block, baseClassName, innerHtml) {
    const attrs = block && block.attrs ? block.attrs : {};
    const className = [baseClassName, attrs.className || ''].join(' ').trim();
    const classAttr = className ? ` class="${escapeAttribute(className)}"` : '';
    return `<div${classAttr}>${innerHtml}</div>`;
  }

  function saveLabel(block, fallback) {
    const attrs = block && block.attrs ? block.attrs : {};
    const fieldId = getFieldId(block);
    const forAttr = fieldId ? ` for="${escapeAttribute(fieldId)}"` : '';
    return `<label${forAttr}>${escapeHtml(attrs.label || fallback)}</label>`;
  }

  function saveTextLikeField(block, baseClassName, inputType, fallbackLabel) {
    const inputAttrs = getCommonFieldAttrs(block, { type: inputType });
    const html = `${saveLabel(block, fallbackLabel)}<input${inputAttrs}${getRequiredAttr(block && block.attrs ? block.attrs : {})}>`;
    return saveFieldShell(block, baseClassName, html);
  }

  function saveTextareaField(block, baseClassName, fallbackLabel) {
    const attrs = block && block.attrs ? block.attrs : {};
    const rows = attrs.rows || 4;
    const textareaAttrs = getCommonFieldAttrs(block, { rows });
    const html = `${saveLabel(block, fallbackLabel || 'Textarea')}<textarea${textareaAttrs}${getRequiredAttr(attrs)}></textarea>`;
    return saveFieldShell(block, baseClassName || 'pe-field-textarea', html);
  }

  function saveSelectField(block, baseClassName, fallbackLabel) {
    const attrs = block && block.attrs ? block.attrs : {};
    const optionsHtml = getFieldOptionList(block)
      .map((option) => `<option value="${escapeAttribute(option && option.value != null ? option.value : '')}">${escapeHtml(option && option.label != null ? option.label : option && option.value != null ? option.value : '')}</option>`)
      .join('');
    const html = `${saveLabel(block, fallbackLabel || 'Select')}<select${getCommonFieldAttrs(block)}${getRequiredAttr(attrs)}>${optionsHtml}</select>`;
    return saveFieldShell(block, baseClassName || 'pe-field-select', html);
  }

  function saveChoiceField(block, baseClassName, inputType, fallbackLabel) {
    const attrs = block && block.attrs ? block.attrs : {};
    const optionsHtml = getFieldOptionList(block)
      .map((option, index) => {
        const optionId = `${getFieldId(block) || attrs.name || 'field'}-${index}`;
        const nameAttr = attrs.name ? ` name="${escapeAttribute(attrs.name)}"` : '';
        const valueAttr = option && option.value != null ? ` value="${escapeAttribute(option.value)}"` : '';
        return `<label for="${escapeAttribute(optionId)}"><input type="${escapeAttribute(inputType)}" id="${escapeAttribute(optionId)}"${nameAttr}${valueAttr}${attrs.required ? ' required' : ''}> ${escapeHtml(option && option.label != null ? option.label : option && option.value != null ? option.value : '')}</label>`;
      })
      .join('');
    return saveFieldShell(block, baseClassName, `<div>${escapeHtml(attrs.label || fallbackLabel)}</div>${optionsHtml}`);
  }

  function saveCheckboxField(block, baseClassName, fallbackLabel) {
    const attrs = block && block.attrs ? block.attrs : {};
    const html = `<label${getFieldId(block) ? ` for="${escapeAttribute(getFieldId(block))}"` : ''}><input type="checkbox"${getCommonFieldAttrs(block)}${getRequiredAttr(attrs)}> ${escapeHtml(attrs.label || fallbackLabel || 'Check')}</label>`;
    return saveFieldShell(block, baseClassName || 'pe-field-checkbox', html);
  }

  function saveHiddenField(block, baseClassName) {
    const attrs = block && block.attrs ? block.attrs : {};
    const className = [baseClassName || 'pe-field-hidden', attrs.className || ''].join(' ').trim();
    const classAttr = className ? ` class="${escapeAttribute(className)}"` : '';
    return `<input type="hidden"${classAttr}${getCommonFieldAttrs(block)}>`;
  }

  function saveFormBlock(block, options) {
    const attrs = syncFormAttrs(block && block.attrs ? block.attrs : {});
    const className = ['pe-block-form', attrs.className || ''].join(' ').trim();
    const classAttr = className ? ` class="${escapeAttribute(className)}"` : '';
    const layoutAttr = attrs.layout ? ` data-layout="${escapeAttribute(attrs.layout)}"` : '';
    const validationAttr = attrs.validationMode ? ` data-validation-mode="${escapeAttribute(attrs.validationMode)}"` : '';
    const sections = normalizeSections(attrs);
    const sectionsHtml = sections.map((section) => {
      const fieldsHtml = runtimeUtils && typeof runtimeUtils.saveBlocks === 'function'
        ? runtimeUtils.saveBlocks(Array.isArray(section.fields) ? section.fields : [], options || {})
        : '';
      return `<section class="pe-form-section" data-columns="${escapeAttribute(clampSectionColumns(section.columns))}"><div class="pe-form-section__fields" data-columns="${escapeAttribute(clampSectionColumns(section.columns))}">${fieldsHtml}</div></section>`;
    }).join('');
    return `<form${classAttr}${layoutAttr}${validationAttr}>${sectionsHtml}<div class="pe-form-submit"><button type="submit">Submit</button></div></form>`;
  }

  const fallbackFieldModules = {
    field_text: {
      create: (attrs) => createField('field_text', attrs),
      render: (block) => renderTextLikeField(block, 'pe-field-text', 'text', 'Text'),
      save: (block) => saveTextLikeField(block, 'pe-field-text', 'text', 'Text')
    },
    field_textarea: {
      create: (attrs) => createField('field_textarea', attrs),
      render: (block) => renderTextareaField(block, 'pe-field-textarea', 'Textarea'),
      save: (block) => saveTextareaField(block, 'pe-field-textarea', 'Textarea')
    },
    field_email: {
      create: (attrs) => createField('field_email', attrs),
      render: (block) => renderTextLikeField(block, 'pe-field-email', 'email', 'Email'),
      save: (block) => saveTextLikeField(block, 'pe-field-email', 'email', 'Email')
    },
    field_phone: {
      create: (attrs) => createField('field_phone', attrs),
      render: (block) => renderTextLikeField(block, 'pe-field-phone', 'tel', 'Phone'),
      save: (block) => saveTextLikeField(block, 'pe-field-phone', 'tel', 'Phone')
    },
    field_number: {
      create: (attrs) => createField('field_number', attrs),
      render: (block) => renderTextLikeField(block, 'pe-field-number', 'number', 'Number'),
      save: (block) => saveTextLikeField(block, 'pe-field-number', 'number', 'Number')
    },
    field_select: {
      create: (attrs) => createField('field_select', attrs),
      render: (block) => renderSelectField(block, 'pe-field-select', 'Select'),
      save: (block) => saveSelectField(block, 'pe-field-select', 'Select')
    },
    field_radio: {
      create: (attrs) => createField('field_radio', attrs),
      render: (block) => renderChoiceField(block, 'pe-field-radio', 'radio', 'Radio'),
      save: (block) => saveChoiceField(block, 'pe-field-radio', 'radio', 'Choose')
    },
    field_checkbox: {
      create: (attrs) => createField('field_checkbox', attrs),
      render: (block) => renderCheckboxField(block, 'pe-field-checkbox', 'Check'),
      save: (block) => saveCheckboxField(block, 'pe-field-checkbox', 'Check')
    },
    field_checkbox_group: {
      create: (attrs) => createField('field_checkbox_group', attrs),
      render: (block) => renderChoiceField(block, 'pe-field-checkbox-group', 'checkbox', 'Checkboxes'),
      save: (block) => saveChoiceField(block, 'pe-field-checkbox-group', 'checkbox', 'Options')
    },
    field_date: {
      create: (attrs) => createField('field_date', attrs),
      render: (block) => renderTextLikeField(block, 'pe-field-date', 'date'),
      save: (block) => saveTextLikeField(block, 'pe-field-date', 'date', 'Date')
    },
    field_file: {
      create: (attrs) => createField('field_file', attrs),
      render: (block) => renderTextLikeField(block, 'pe-field-file', 'file'),
      save: (block) => saveTextLikeField(block, 'pe-field-file', 'file', 'Upload')
    },
    field_hidden: {
      create: (attrs) => createField('field_hidden', attrs),
      render: (block) => renderHiddenField(block, 'pe-field-hidden'),
      save: (block) => saveHiddenField(block, 'pe-field-hidden')
    }
  };

  modules.form = Object.assign({}, modules.form || {}, {
    create: createForm,
    render: renderFormBlock,
    save: saveFormBlock
  });

  Object.keys(fallbackFieldModules).forEach((type) => {
    registerFieldType(type, { defaults: FIELD_DEFAULTS[type] });
    modules[type] = Object.assign({}, fallbackFieldModules[type], modules[type] || {});
  });

  window.EditorFormBlockRuntime = {
    fieldTypes: getFieldTypes(),
    getFieldTypes,
    fieldDefaults: getAllFieldDefaults(),
    getFieldDefaults,
    registerFieldType,
    createForm,
    createField,
    renderTextLikeField,
    renderTextareaField,
    renderSelectField,
    renderChoiceField,
    renderCheckboxField,
    renderHiddenField,
    saveTextLikeField,
    saveTextareaField,
    saveSelectField,
    saveChoiceField,
    saveCheckboxField,
    saveHiddenField,
    fieldModules: fallbackFieldModules
  };
})();
