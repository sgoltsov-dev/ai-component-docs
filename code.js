// code.js — runs in Figma sandbox

figma.showUI(__html__, { width: 380, height: 520, title: "Readme Generator" });

// ─── helpers ────────────────────────────────────────────────────────────────

function getComponentSet() {
  const sel = figma.currentPage.selection;
  if (!sel.length) return null;
  const node = sel[0];
  if (node.type === "COMPONENT_SET") return node;
  if (node.type === "COMPONENT" && node.parent && node.parent.type === "COMPONENT_SET") return node.parent;
  return null;
}

function cleanKey(key) {
  return key.replace(/#[^#]+$/, "").trim();
}

function extractProperties(cs) {
  const variants = {};
  const booleans = {};
  const booleanKeyMap = {};

  for (const [key, def] of Object.entries(cs.componentPropertyDefinitions)) {
    var clean = cleanKey(key);
    if (def.type === "VARIANT") {
      var vgp = cs.variantGroupProperties[key];
      variants[clean] = (vgp && vgp.values) ? vgp.values : [];
    } else if (def.type === "BOOLEAN") {
      booleans[clean] = (def.defaultValue !== undefined && def.defaultValue !== null) ? def.defaultValue : true;
      booleanKeyMap[clean] = key;
    }
  }
  return { variants, booleans, booleanKeyMap };
}

// Find a component inside the set that matches a property map
function findVariant(cs, propMap) {
  for (const child of cs.children) {
    if (child.type !== "COMPONENT") continue;
    const props = child.variantProperties;
    if (!props) continue;
    let match = true;
    for (const [k, v] of Object.entries(propMap)) {
      if (props[k] !== v) { match = false; break; }
    }
    if (match) return child;
  }
  return cs.defaultVariant ? cs.defaultVariant : cs.children.find(function(c) { return c.type === "COMPONENT"; });
}

// ─── readme builder ─────────────────────────────────────────────────────────

async function loadFonts() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
}

function makeText(chars, size, weight, color) {
  const t = figma.createText();
  t.fontName = { family: "Inter", style: weight };
  t.fontSize = size;
  t.characters = chars;
  t.fills = [{ type: "SOLID", color: color ? color : { r: 0.067, g: 0.067, b: 0.067 } }];
  t.textAutoResize = "HEIGHT";
  return t;
}

function makeDivider(width) {
  const r = figma.createRectangle();
  r.resize(width, 1);
  r.fills = [{ type: "SOLID", color: { r: 0.878, g: 0.878, b: 0.878 } }];
  return r;
}

// One "card" = variant label + description text + component instance
function makeCard(cs, label, description, propMap, boolOverrides) {
  const frame = figma.createFrame();
  frame.name = label;
  frame.layoutMode = "VERTICAL";
  frame.itemSpacing = 8;
  frame.paddingLeft = frame.paddingRight = 0;
  frame.paddingTop = frame.paddingBottom = 0;
  frame.fills = [];
  frame.clipsContent = false;

  // Label (bold)
  const titleText = makeText(label, 13, "Medium", { r: 0.067, g: 0.067, b: 0.067 });
  frame.appendChild(titleText);

  // Description
  const descText = makeText(description, 12, "Regular", { r: 0.4, g: 0.4, b: 0.4 });
  descText.resize(320, descText.height);
  descText.textAutoResize = "HEIGHT";
  frame.appendChild(descText);

  // Component instance
  const variant = findVariant(cs, propMap);
  const inst = variant.createInstance();

  // Apply boolean overrides
  if (boolOverrides && Object.keys(boolOverrides).length) {
    try {
      inst.setProperties(boolOverrides);
    } catch (_) {}
  }

  // Scale down if too wide
  if (inst.width > 360) {
    const scale = 360 / inst.width;
    inst.rescale(scale);
  }

  frame.appendChild(inst);
  frame.resize(Math.max(inst.width, 320), frame.height);

  return frame;
}

// Build two-column row frame from two cards
function makeRow(cardA, cardB) {
  const row = figma.createFrame();
  row.name = "row";
  row.layoutMode = "HORIZONTAL";
  row.itemSpacing = 40;
  row.fills = [];
  row.clipsContent = false;
  row.counterAxisSizingMode = "AUTO";
  row.primaryAxisSizingMode = "AUTO";
  row.appendChild(cardA);
  if (cardB) row.appendChild(cardB);
  return row;
}

function makeSection(title, cards) {
  const section = figma.createFrame();
  section.name = title;
  section.layoutMode = "VERTICAL";
  section.itemSpacing = 24;
  section.paddingLeft = section.paddingRight = 0;
  section.paddingTop = section.paddingBottom = 0;
  section.fills = [];
  section.clipsContent = false;

  // Section heading
  const heading = makeText(title, 18, "Bold");
  section.appendChild(heading);

  const divider = makeDivider(760);
  section.appendChild(divider);

  // Pair cards into rows of 2
  for (let i = 0; i < cards.length; i += 2) {
    const row = makeRow(cards[i], cards[i + 1] ? cards[i + 1] : null);
    section.appendChild(row);
  }

  section.primaryAxisSizingMode = "AUTO";
  section.counterAxisSizingMode = "AUTO";
  return section;
}

// ─── main build ─────────────────────────────────────────────────────────────

async function buildReadme(cs, descriptions) {
  await loadFonts();

  const extracted = extractProperties(cs);
  const variants = extracted.variants;
  const booleans = extracted.booleans;
  const booleanKeyMap = extracted.booleanKeyMap;

  // Root readme frame
  const readme = figma.createFrame();
  readme.name = cs.name + " / Readme";
  readme.layoutMode = "VERTICAL";
  readme.itemSpacing = 48;
  readme.paddingLeft = readme.paddingRight = 40;
  readme.paddingTop = 40;
  readme.paddingBottom = 60;
  readme.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  readme.clipsContent = false;

  // Title block
  const titleFrame = figma.createFrame();
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.itemSpacing = 6;
  titleFrame.fills = [];
  titleFrame.clipsContent = false;
  titleFrame.appendChild(makeText(cs.name, 28, "Bold"));
  const subtitleText = descriptions.componentDescription ? descriptions.componentDescription : (cs.name + " is a UI component.");
  const subtitle = makeText(subtitleText, 14, "Regular", { r: 0.4, g: 0.4, b: 0.4 });
  subtitle.resize(760, subtitle.height);
  subtitle.textAutoResize = "HEIGHT";
  titleFrame.appendChild(subtitle);
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  readme.appendChild(titleFrame);

  // ── Variant sections (dynamic) ──────────────────────────────────────────
  // Expected schema:
  // descriptions.variants = { [propName]: { [value]: description } }
  var variantDescriptions = (descriptions && descriptions.variants) ? descriptions.variants : {};

  for (var propName in variants) {
    if (!variants.hasOwnProperty(propName)) continue;
    var values = variants[propName] || [];
    if (!values.length) continue;

    const cards = values.map(function(v) {
      var propBlock = variantDescriptions && variantDescriptions[propName] ? variantDescriptions[propName] : null;
      var desc = (propBlock && propBlock[v]) ? propBlock[v] : "Component description";
      var propMap = {};
      propMap[propName] = v;
      return makeCard(cs, v, desc, propMap, {});
    });

    readme.appendChild(makeSection(propName, cards));
  }

  // ── Boolean options ─────────────────────────────────────────────────────
  const boolKeys = Object.keys(booleans);
  if (boolKeys.length) {
    const boolCards = [];
    for (const key of boolKeys) {
      for (const val of [true, false]) {
        const label = key + " / " + (val ? "True" : "False");
        const boolSection = descriptions && descriptions.booleans && descriptions.booleans[key] ? descriptions.booleans[key] : null;
        const desc = boolSection ? (boolSection[val ? "true" : "false"] || "Component description") : "Component description";
        const override = {};
        override[booleanKeyMap[key] ? booleanKeyMap[key] : key] = val;
        boolCards.push(makeCard(cs, label, desc, {}, override));
      }
    }
    readme.appendChild(makeSection("Boolean options", boolCards));
  }

  readme.primaryAxisSizingMode = "AUTO";
  readme.counterAxisSizingMode = "AUTO";

  // Position readme to the right of the component set
  var bbox = cs.absoluteBoundingBox;
  const csX = bbox ? bbox.x : cs.x;
  const csW = bbox ? bbox.width : cs.width;
  readme.x = csX + csW + 80;
  readme.y = bbox ? bbox.y : cs.y;

  figma.currentPage.appendChild(readme);
  figma.viewport.scrollAndZoomIntoView([readme]);
}

// ─── message bus ────────────────────────────────────────────────────────────

var CONFIG_KEY = "plugin_config";

// load saved key on startup
figma.clientStorage.getAsync("claude_api_key").then(function(key) {
  if (key) figma.ui.postMessage({ type: "SAVED_KEY", key: key });
});

// load saved config on startup
figma.clientStorage.getAsync(CONFIG_KEY).then(function(cfg) {
  if (cfg) figma.ui.postMessage({ type: "SAVED_CONFIG", config: cfg });
});

figma.ui.onmessage = async function(msg) {
  if (msg.type === "SAVE_KEY") {
    figma.clientStorage.setAsync("claude_api_key", msg.key).then(function() {
      figma.ui.postMessage({ type: "KEY_SAVED" });
    });
    return;
  }

  if (msg.type === "SAVE_CONFIG") {
    figma.clientStorage.setAsync(CONFIG_KEY, msg.config).then(function() {
      figma.ui.postMessage({ type: "CONFIG_SAVED" });
    });
    return;
  }

  if (msg.type === "GET_COMPONENT") {
    const cs = getComponentSet();
    if (!cs) {
      figma.ui.postMessage({ type: "ERROR", message: "Выбери ComponentSet (или любой его вариант) на канвасе" });
      return;
    }
    const { variants, booleans } = extractProperties(cs);
    figma.ui.postMessage({
      type: "COMPONENT_DATA",
      name: cs.name,
      variants,
      booleans: Object.keys(booleans),
    });
  }

  if (msg.type === "BUILD_README") {
    const cs = getComponentSet();
    if (!cs) return;
    try {
      await buildReadme(cs, msg.descriptions);
      figma.ui.postMessage({ type: "DONE" });
    } catch (e) {
      figma.ui.postMessage({ type: "ERROR", message: String(e) });
    }
  }

  if (msg.type === "CLOSE") {
    figma.closePlugin();
  }
};
