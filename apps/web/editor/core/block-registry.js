(function () {
  const registrations = Object.create(null);
  const placements = Object.create(null);

  function toObject(value) {
    return value && typeof value === 'object' ? value : {};
  }

  function uniqueOrder(items) {
    const seen = new Set();
    const order = [];
    (items || []).forEach((item) => {
      if (!item || seen.has(item)) return;
      seen.add(item);
      order.push(item);
    });
    return order;
  }

  function insertType(order, type, placement) {
    if (order.includes(type)) return order;

    if (placement && placement.before) {
      const beforeIndex = order.indexOf(placement.before);
      if (beforeIndex !== -1) {
        order.splice(beforeIndex, 0, type);
        return order;
      }
    }

    if (placement && placement.after) {
      const afterIndex = order.indexOf(placement.after);
      if (afterIndex !== -1) {
        order.splice(afterIndex + 1, 0, type);
        return order;
      }
    }

    if (placement && Number.isInteger(placement.order)) {
      const nextIndex = Math.max(0, Math.min(order.length, placement.order));
      order.splice(nextIndex, 0, type);
      return order;
    }

    order.push(type);
    return order;
  }

  function register(type, definition, placement) {
    if (!type) return;
    registrations[type] = Object.assign({}, registrations[type] || {}, toObject(definition));
    placements[type] = Object.assign({}, placements[type] || {}, toObject(placement));
  }

  function getRegisteredDefinitions() {
    const output = {};
    Object.keys(registrations).forEach((type) => {
      output[type] = Object.assign({}, registrations[type]);
    });
    return output;
  }

  function getRegisteredOrder(legacyOrder) {
    const order = uniqueOrder(Array.isArray(legacyOrder) ? legacyOrder.slice() : []);
    Object.keys(registrations).forEach((type) => insertType(order, type, placements[type]));
    return order;
  }

  function mergeLegacyDefinitions(legacyDefinitions) {
    const merged = {};
    const legacy = Object.assign(
      {},
      toObject(window.EDITOR_LEGACY_BLOCK_DEFINITIONS),
      toObject(legacyDefinitions)
    );
    const keys = new Set(Object.keys(legacy).concat(Object.keys(registrations)));

    keys.forEach((type) => {
      merged[type] = Object.assign({}, toObject(legacy[type]), toObject(registrations[type]));
    });

    return merged;
  }

  function finalize(legacyDefinitions, legacyOrder) {
    const definitions = mergeLegacyDefinitions(legacyDefinitions);
    const order = getRegisteredOrder(
      Array.isArray(legacyOrder) && legacyOrder.length
        ? legacyOrder
        : window.EDITOR_LEGACY_BLOCK_ORDER
    );
    window.EDITOR_BLOCK_DEFINITIONS = definitions;
    window.EDITOR_BLOCK_ORDER = order;
    return { definitions, order };
  }

  window.EditorBlockRegistry = {
    register,
    getRegisteredDefinitions,
    getRegisteredOrder,
    mergeLegacyDefinitions,
    finalize
  };
})();
