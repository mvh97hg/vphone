const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function hasAny(content, patterns) {
  return patterns.some((p) => p.test(content));
}

function evaluate() {
  const phone = read("Phone/phone.js");
  const ui = read("src/ui/phone-ui.js");
  const dom = read("src/ui/dom-renderer.js");
  const controls = read("src/ui/controls.js");
  const harness = read("src/ui/harness.html");

  const dialpadCoreItems = [
    {
      key: "ShowTab + tab switching",
      legacy: /function ShowTab\(/.test(phone),
      modern: hasAny(ui + dom, [/#bindTabButtons\(/, /showTab\(tabName\)/]),
      evidence: ["src/ui/phone-ui.js#bindTabButtons", "src/ui/dom-renderer.js#showTab"]
    },
    {
      key: "RenderMobileTopBar actions",
      legacy: /function RenderMobileTopBar\(/.test(phone),
      modern: /renderMobileTopBar\(tabName\)/.test(dom),
      evidence: ["src/ui/dom-renderer.js#renderMobileTopBar"]
    },
    {
      key: "Dial keypad digit input (KeyPress)",
      legacy: /function KeyPress\(/.test(phone),
      modern: /data-dial-digit/.test(ui) && /#bindDialpadDigits\(/.test(ui),
      evidence: ["src/ui/phone-ui.js#renderDialpad [data-dial-digit]", "src/ui/phone-ui.js#bindDialpadDigits"]
    },
    {
      key: "Dial input sanitize (handleDialInput)",
      legacy: /function handleDialInput\(/.test(phone),
      modern: ui.replace(/\s+/g, "").includes('replace(/[^\\d*#+]/g,"")'),
      evidence: ["src/ui/phone-ui.js#bindDialpadInputState(input listener)"]
    },
    {
      key: "Enter/Ctrl+Enter call mode (dialOnkeydown)",
      legacy: /function dialOnkeydown\(/.test(phone),
      modern: /event\.key !== "Enter"/.test(ui) && /video:\s*!!event\.ctrlKey/.test(ui),
      evidence: ["src/ui/phone-ui.js#bindDialpadInputState(keydown listener)"]
    },
    {
      key: "Sync dial delete key state",
      legacy: /function SyncDialDeleteKey\(/.test(phone),
      modern: /#syncDialDeleteKeyState\(/.test(ui) && /hasDigits/.test(ui),
      evidence: ["src/ui/phone-ui.js#syncDialDeleteKeyState"]
    },
    {
      key: "Dialpad setting toggles",
      legacy: /function ToggleDialpadSetting\(/.test(phone),
      modern: /onDialpadToggle/.test(controls) && /#toggleDialpadSetting\(/.test(ui),
      evidence: ["src/ui/controls.js#dialpad-toggle-*", "src/ui/phone-ui.js#toggleDialpadSetting"]
    },
    {
      key: "UI bindings regression guard",
      legacy: true,
      modern: /runUiBindingTest/.test(harness),
      evidence: ["src/ui/harness.html#runUiBindingTest"]
    }
  ];

  const extendedItems = [
    {
      key: "ShowRecentsTab dynamic list rendering",
      legacy: /function ShowRecentsTab\(/.test(phone),
      modern: /#renderRecents\(/.test(ui) && /enterpriseRecentItem/.test(ui),
      evidence: ["Phone/phone.js#ShowRecentsTab", "src/ui/* (no equivalent yet)"]
    },
    {
      key: "ShowContacts uses stored tab search",
      legacy: /GetStoredTabSearch\("contacts"\)/.test(phone),
      modern: /tabSearch/.test(ui) && /#renderContacts\(/.test(ui) && /txtFindBuddy/.test(ui),
      evidence: ["Phone/phone.js#ShowContacts", "src/ui/*"]
    },
    {
      key: "HandleMobileClearTab confirmation flows",
      legacy: /function HandleMobileClearTab\(/.test(phone),
      modern: /#handleClearTab\(/.test(ui) && /window\.confirm/.test(ui),
      evidence: ["Phone/phone.js#HandleMobileClearTab", "src/ui/*"]
    },
    {
      key: "Persist ActiveTab to local storage",
      legacy: /localDB\.setItem\("ActiveTab"/.test(phone),
      modern: /localStorage\.setItem\(["']ActiveTab["']/.test(ui + dom),
      evidence: ["Phone/phone.js#ShowTab", "src/ui/*"]
    },
    {
      key: "Bind recent expanded actions",
      legacy: /function BindRecentExpandedActions\(/.test(phone),
      modern: /recentAction(Call|Add|Delete|History)|BindRecentExpandedActions/.test(ui + dom + controls),
      evidence: ["Phone/phone.js#BindRecentExpandedActions", "src/ui/*"]
    }
  ];

  function summarize(items) {
    const implemented = items.filter((x) => x.legacy && x.modern).length;
    const total = items.filter((x) => x.legacy).length;
    const percent = total === 0 ? 0 : Math.round((implemented / total) * 100);
    const missing = items.filter((x) => x.legacy && !x.modern).map((x) => x.key);
    return { implemented, total, percent, missing, items };
  }

  const dialpadCore = summarize(dialpadCoreItems);
  const mobileFlowExtended = summarize(extendedItems);

  const overallItems = [...dialpadCoreItems, ...extendedItems];
  const overall = summarize(overallItems);

  return {
    overall,
    dialpadCore,
    mobileFlowExtended
  };
}

module.exports = { evaluate };

if (require.main === module) {
  const result = evaluate();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(0);
}
