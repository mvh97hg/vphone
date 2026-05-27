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
  const ui = read("src/ui/phone-widget.js");
  const dom = ui;
  const controls = ui;
  const harness = read("scripts/ui-harness.html");

  const dialpadCoreItems = [
    {
      key: "ShowTab + tab switching",
      legacy: /function ShowTab\(/.test(phone),
      modern: hasAny(ui + dom, [/#bindTabButtons\(/, /showTab\(tabName\)/]),
      evidence: ["src/ui/phone-widget.js#bindTabButtons", "src/ui/phone-widget.js#showTab"]
    },
    {
      key: "RenderMobileTopBar actions",
      legacy: /function RenderMobileTopBar\(/.test(phone),
      modern: /renderMobileTopBar\(tabName\)/.test(dom),
      evidence: ["src/ui/phone-widget.js#renderMobileTopBar"]
    },
    {
      key: "Dial keypad digit input (KeyPress)",
      legacy: /function KeyPress\(/.test(phone),
      modern: /data-dial-digit/.test(ui) && /#bindDialpadDigits\(/.test(ui),
      evidence: ["src/ui/phone-widget.js#renderDialpad [data-dial-digit]", "src/ui/phone-widget.js#bindDialpadDigits"]
    },
    {
      key: "Dial input sanitize (handleDialInput)",
      legacy: /function handleDialInput\(/.test(phone),
      modern: ui.replace(/\s+/g, "").includes('replace(/[^\\d*#+]/g,"")'),
      evidence: ["src/ui/phone-widget.js#bindDialpadInputState(input listener)"]
    },
    {
      key: "Enter/Ctrl+Enter call mode (dialOnkeydown)",
      legacy: /function dialOnkeydown\(/.test(phone),
      modern: /event\.key !== "Enter"/.test(ui) && /video:\s*!!event\.ctrlKey/.test(ui),
      evidence: ["src/ui/phone-widget.js#bindDialpadInputState(keydown listener)"]
    },
    {
      key: "Sync dial delete key state",
      legacy: /function SyncDialDeleteKey\(/.test(phone),
      modern: /#syncDialDeleteKeyState\(/.test(ui) && /hasDigits/.test(ui),
      evidence: ["src/ui/phone-widget.js#syncDialDeleteKeyState"]
    },
    {
      key: "Dialpad setting toggles",
      legacy: /function ToggleDialpadSetting\(/.test(phone),
      modern: /onDialpadToggle/.test(controls) && /#toggleDialpadSetting\(/.test(ui) && /id="dialpad-setting-toggles"/.test(ui),
      evidence: ["src/ui/phone-widget.js#dialpad-toggle-*", "src/ui/phone-widget.js#toggleDialpadSetting"]
    },
    {
      key: "No custom in-dialpad call control rows",
      legacy: /html \+= "<div class=dialActionsRow>"/.test(phone),
      modern:
        (ui.match(/class="dialActionsRow"/g) || []).length === 1 &&
        !/<button[^>]+data-action="mute"/.test(ui) &&
        !/<button[^>]+data-action="hold"/.test(ui) &&
        !/<button[^>]+data-action="transfer"/.test(ui) &&
        !/<button[^>]+data-action="conference"/.test(ui),
      evidence: ["src/ui/phone-widget.js#renderDialpad", "scripts/ui-harness.html#dialActionsRowCount"]
    },
    {
      key: "Mobile top bar actions",
      legacy: /mobileTopBtn[\s\S]*data-action=add-contact/.test(phone) && /ShowMyProfileMenu\(this\)/.test(phone),
      modern:
        /#promptAddContact\(/.test(ui) &&
        /onMore:\s*\(\{\s*element\s*\}\s*=\s*\{\}\)\s*=>\s*this\.#openProfileMenu\(element\)/.test(ui) &&
        /data-role=['"]profile-menu['"]/.test(ui + harness) &&
        /promptCountAfterMore\s*===\s*0/.test(harness),
      evidence: ["src/ui/phone-widget.js#renderMobileTopBar", "src/ui/phone-widget.js#openProfileMenu", "scripts/ui-harness.html#mobileTopBtn"]
    },
    {
      key: "UI bindings regression guard",
      legacy: true,
      modern: /runUiBindingTest/.test(harness),
      evidence: ["scripts/ui-harness.html#runUiBindingTest"]
    }
  ];

  const extendedItems = [
    {
      key: "ShowRecentsTab dynamic list rendering",
      legacy: /function ShowRecentsTab\(/.test(phone),
      modern: /#renderRecents\(/.test(ui) && /enterpriseRecentItem/.test(ui),
      evidence: ["Phone/phone.js#ShowRecentsTab", "src/ui/phone-widget.js#renderRecents"]
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
      modern:
        /#handleClearTab\(/.test(ui) &&
        /#confirmInPanel\(/.test(ui) &&
        /panelConfirmOverlay/.test(ui + harness) &&
        /confirmCount\s*===\s*0/.test(harness),
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
