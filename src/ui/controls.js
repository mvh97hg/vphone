export function bindControls(root, handlers) {
  const idMap = {
    BtnFilter: handlers.onFilter,
    SettingsMenu: handlers.onSettings,
    dialAudio: handlers.onCallAudio || handlers.onCall,
    dialVideo: handlers.onCallVideo || handlers.onCall,
    dialDeleteKey: handlers.onDialDelete,
    "dialpad-toggle-auto": () => handlers.onDialpadToggle?.({ key: "auto" }),
    "dialpad-toggle-cw": () => handlers.onDialpadToggle?.({ key: "cw" }),
    "dialpad-toggle-dnd": () => handlers.onDialpadToggle?.({ key: "dnd" }),
    "dialpad-toggle-rec": () => handlers.onDialpadToggle?.({ key: "rec" })
  };

  const map = {
    call: handlers.onCall,
    answer: handlers.onAnswer,
    hangup: handlers.onHangup,
    mute: handlers.onMute,
    hold: handlers.onHold,
    reconnect: handlers.onReconnect,
    transfer: handlers.onTransfer,
    conference: handlers.onConference,
    search: handlers.onSearch,
    filter: handlers.onFilter,
    settings: handlers.onSettings,
    "add-contact": handlers.onAddContact,
    "clear-tab": handlers.onClearTab,
    more: handlers.onMore,
    reg: handlers.onRegisterToggle
  };
  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const btn = target.closest("[data-action]");
    if (btn && root.contains(btn)) {
      const action = btn.getAttribute("data-action") || "";
      const fn = map[action];
      if (typeof fn === "function") {
        const tab = btn.getAttribute("data-tab") || "";
        fn({ tab, action, element: btn });
        return;
      }
    }

    const idBtn = target.closest("[id]");
    if (!idBtn || !root.contains(idBtn)) return;
    const id = idBtn.getAttribute("id") || "";
    const idHandler = idMap[id];
    if (typeof idHandler === "function") idHandler({ element: idBtn, id });
  });
}
