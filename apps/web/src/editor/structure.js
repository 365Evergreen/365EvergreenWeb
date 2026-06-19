/* Document Overview / Structure helper: renders minimal outline when an element with id 'pe-structure' exists */
(function(){
  const el = document.getElementById('pe-structure');
  function buildOutline(){
    const state = (window.EditorCore && typeof EditorCore.getState === 'function') ? EditorCore.getState() : { blocks: [] };
    return (state.blocks||[]).map(b=> ({ id: b.id, type: b.type, title: (b.attrs && (b.attrs.title || b.attrs.text)) ? (b.attrs.title || (b.attrs.text && (typeof b.attrs.text === 'string' ? b.attrs.text.slice(0,60) : ''))) : b.type, children: b.children || [] }));
  }

  function render(){
    if (!el) return;
    const nodes = buildOutline();
    el.innerHTML = '';
    nodes.forEach(n=>{
      const row = document.createElement('div'); row.className='pe-outline-item'; row.tabIndex = 0; row.style.padding='6px 4px'; row.style.borderBottom='1px solid #f1f1f1';
      row.textContent = n.title || n.type || n.id;
      row.dataset.id = n.id;
      row.addEventListener('click', ()=>{ if (window.EditorCore) EditorCore.selectBlockById(n.id); });
      // drag to reorder (simple)
      row.draggable = true;
      row.addEventListener('dragstart', (ev)=>{ ev.dataTransfer.setData('text/block-id', n.id); ev.dataTransfer.effectAllowed='move'; });
      el.appendChild(row);
    });
  }

  if (window.EditorCore){
    EditorCore.on('state:changed', ()=> render());
    EditorCore.on('select', ()=> render());
  }

  window.EditorStructure = { buildOutline, render };
  // initial render
  setTimeout(()=> render(), 120);
})();
