(async function bootDesktopPhone() {
  const statusEl = document.getElementById('desktop-status');
  const errorEl = document.getElementById('desktop-error');
  const panelEl = document.getElementById('phone-panel');
  const titleEl = document.querySelector('.desktop-title');
  const shortcutsPopupEl = document.getElementById('desktop-shortcuts-popup');
  const shortcutsListEl = document.getElementById('desktop-shortcuts-list');
  const shortcutsToggleEl = document.querySelector('[data-shortcuts-toggle]');
  let mountedPhone = null;

  const shortcutActionLabelsByLang = {
    en: {
      answer: 'Answer call',
      hangup: 'Hangup',
      hold: 'Hold or resume',
      mute: 'Mute or unmute',
      transfer: 'Transfer call',
      dialpad: 'Open dialpad'
    },
    vi: {
      answer: 'Trả lời cuộc gọi',
      hangup: 'Kết thúc cuộc gọi',
      hold: 'Giữ cuộc gọi',
      mute: 'Tắt hoặc bật tiếng',
      transfer: 'Chuyển cuộc gọi',
      dialpad: 'Mở bàn phím gọi'
    }
  };

  const shortcutPopupCopyByLang = {
    en: {
      title: 'Keyboard shortcuts',
      toggleTitle: 'Shortcuts',
      closeAriaLabel: 'Close',
      emptyText: 'No shortcuts configured.'
    },
    vi: {
      title: 'Các phím tắt',
      toggleTitle: 'Phím tắt',
      closeAriaLabel: 'Đóng',
      emptyText: 'Không có phím tắt nào được cấu hình.'
    }
  };

  const shortcutDefaults = {
    answer: 'Alt+A',
    hangup: 'Alt+C',
    hold: 'Alt+H',
    mute: 'Alt+M',
    transfer: 'Alt+T',
    dialpad: 'F2'
  };

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function showError(message) {
    errorEl.hidden = false;
    errorEl.textContent = message;
    setStatus('Error');
    logDesktop('error', message);
  }

  function logDesktop(level, message, meta) {
    if (window.VPhoneDesktop && typeof window.VPhoneDesktop.log === 'function') {
      window.VPhoneDesktop.log(level, message, meta || null);
    }
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Cannot load VPhone runtime: ' + src));
      document.head.appendChild(script);
    });
  }

  function bindWindowControls() {
    document.querySelectorAll('[data-window-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.getAttribute('data-window-action');
        if (action === 'minimize') window.VPhoneDesktop.minimizeWindow();
        if (action === 'close') window.VPhoneDesktop.closeWindow();
      });
    });
  }

  function normalizeKeyboardShortcuts(value) {
    let configured = {};
    if (value && typeof value === 'string') {
      try {
        configured = JSON.parse(value);
      } catch (error) {
        configured = {};
      }
    } else if (value && typeof value === 'object') {
      configured = value;
    }

    const normalized = {};
    Object.keys(shortcutDefaults).forEach((action) => {
      const candidate = configured[action];
      if (typeof candidate === 'string' && candidate.trim()) {
        normalized[action] = candidate.trim();
      } else {
        normalized[action] = shortcutDefaults[action];
      }
    });

    return normalized;
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function resolveAppLanguage(language) {
    const languageText = String(language || document.documentElement.lang || 'en').toLowerCase().trim();
    if (languageText.startsWith('vi')) return 'vi';
    return 'en';
  }

  function getShortcutActionLabels(language) {
    const appLanguage = resolveAppLanguage(language);
    return shortcutActionLabelsByLang[appLanguage] || shortcutActionLabelsByLang.en;
  }

  function getShortcutPopupCopy(language) {
    const appLanguage = resolveAppLanguage(language);
    return shortcutPopupCopyByLang[appLanguage] || shortcutPopupCopyByLang.en;
  }

  function applyShortcutPopupLocale(copy) {
    const titleNode = document.getElementById('desktop-shortcuts-title');
    if (titleNode) titleNode.textContent = copy.title;

    if (shortcutsToggleEl) {
      shortcutsToggleEl.setAttribute('title', copy.toggleTitle);
      shortcutsToggleEl.setAttribute('aria-label', copy.toggleTitle);
    }

    if (shortcutsPopupEl) {
      shortcutsPopupEl.querySelectorAll('[data-shortcuts-close]').forEach((button) => {
        button.setAttribute('aria-label', copy.closeAriaLabel);
      });
    }
  }

  function renderShortcutsList(shortcuts, labels, emptyText) {
    if (!shortcutsListEl) return;

    const rows = Object.keys(labels).map((action) => {
      const label = labels[action];
      const key = shortcuts[action] || '-';
      return (
        '<div class="desktop-shortcuts-item">' +
          '<span class="desktop-shortcuts-label">' + escapeHtml(label) + '</span>' +
          '<span class="desktop-shortcuts-key">' + escapeHtml(key) + '</span>' +
        '</div>'
      );
    });

    if (rows.length === 0) {
      shortcutsListEl.innerHTML = '<p class="desktop-shortcuts-empty">' + escapeHtml(emptyText) + '</p>';
      return;
    }

    shortcutsListEl.innerHTML = rows.join('');
  }

  function isShortcutsPopupOpen() {
    return !!(shortcutsPopupEl && shortcutsPopupEl.hidden === false);
  }

  function closeShortcutsPopup() {
    if (!shortcutsPopupEl) return;
    shortcutsPopupEl.hidden = true;
    if (shortcutsToggleEl) shortcutsToggleEl.focus();
  }

  function openShortcutsPopup() {
    if (!shortcutsPopupEl) return;
    shortcutsPopupEl.hidden = false;
    const firstCloseButton = shortcutsPopupEl.querySelector('[data-shortcuts-close]');
    if (firstCloseButton) firstCloseButton.focus();
  }

  function bindShortcutPopup(shortcuts, language) {
    if (!shortcutsPopupEl || !shortcutsToggleEl) return;

    const labels = getShortcutActionLabels(language);
    const copy = getShortcutPopupCopy(language);
    applyShortcutPopupLocale(copy);

    renderShortcutsList(shortcuts, labels, copy.emptyText);

    shortcutsToggleEl.addEventListener('click', () => {
      if (isShortcutsPopupOpen()) {
        closeShortcutsPopup();
      } else {
        openShortcutsPopup();
      }
    });

    shortcutsPopupEl.querySelectorAll('[data-shortcuts-close]').forEach((button) => {
      button.addEventListener('click', closeShortcutsPopup);
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isShortcutsPopupOpen()) {
        event.preventDefault();
        closeShortcutsPopup();
      }
    });
  }

  function normalizeDesktopPhoneConfig(config) {
    const normalized = Object.assign({ TraceSip: true }, config || {});
    if (normalized.wssServer === '') delete normalized.wssServer;
    if (normalized.WebSocketPort === '') delete normalized.WebSocketPort;
    if (normalized.ServerPath === '') delete normalized.ServerPath;
    if (normalized.SipDomain === '') delete normalized.SipDomain;
    if (normalized.SipUsername === '') delete normalized.SipUsername;
    if (normalized.SipPassword === '') delete normalized.SipPassword;
    if (normalized.SipPasswordType === '') delete normalized.SipPasswordType;

    const hasProvisionedAccount = !!(normalized.wssServer || normalized.WebSocketPort || normalized.SipUsername);
    if (!hasProvisionedAccount) {
      delete normalized.ServerPath;
      delete normalized.SipDomain;
      delete normalized.SipPasswordType;
    }

    return normalized;
  }
  function focusMountedPhone(mountedPhone) {
    try {
      panelEl.focus();
      if (mountedPhone && mountedPhone.iframe) {
        mountedPhone.iframe.focus();
        if (mountedPhone.iframe.contentWindow && typeof mountedPhone.iframe.contentWindow.focus === 'function') {
          mountedPhone.iframe.contentWindow.focus();
        }
      }
    } catch (error) {
      logDesktop('warn', 'Unable to focus mounted phone', {
        name: error && error.name,
        message: error && error.message
      });
    }
  }

  function sendDesktopShortcutAction(action) {
    if (!action || !mountedPhone || !mountedPhone.iframe || !mountedPhone.iframe.contentWindow) {
      return false;
    }

    try {
      mountedPhone.iframe.contentWindow.postMessage({
        action: 'desktop-shortcut',
        data: { shortcutAction: action }
      }, '*');
      return true;
    } catch (error) {
      logDesktop('warn', 'Unable to send desktop shortcut action', {
        name: error && error.name,
        message: error && error.message
      });
      return false;
    }
  }

  async function requestBrowserMediaAccess() {
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      logDesktop('warn', 'navigator.mediaDevices.getUserMedia is not available');
      return { audioinput: 0, audiooutput: 0, videoinput: 0 };
    }

    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      logDesktop('info', 'Browser microphone permission granted');
    } catch (error) {
      const missingDevice = error && (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError');
      logDesktop(missingDevice ? 'warn' : 'error', 'Browser microphone permission failed', {
        name: error && error.name,
        message: error && error.message
      });
      if (!missingDevice) throw error;
    } finally {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const counts = devices.reduce((acc, device) => {
      acc[device.kind] = (acc[device.kind] || 0) + 1;
      return acc;
    }, {});
    logDesktop('info', 'Media devices enumerated', counts);

    if (typeof navigator.mediaDevices.selectAudioOutput === 'function') {
      try {
        const outputDevice = await navigator.mediaDevices.selectAudioOutput();
        logDesktop('info', 'Browser speaker permission granted', {
          deviceId: outputDevice && outputDevice.deviceId ? 'set' : 'empty',
          label: outputDevice && outputDevice.label ? outputDevice.label : ''
        });
      } catch (error) {
        logDesktop('warn', 'Browser speaker permission was not granted', {
          name: error && error.name,
          message: error && error.message
        });
      }
    }

    return counts;
  }

  try {
    if (!window.VPhoneDesktop) {
      showError('Electron preload bridge is not available.');
      return;
    }
    bindWindowControls();

    const [desktopConfig, assetUrls] = await Promise.all([
      window.VPhoneDesktop.getConfig(),
      window.VPhoneDesktop.getAssetUrls()
    ]);
    const diagnostics = typeof window.VPhoneDesktop.getDiagnostics === 'function'
      ? await window.VPhoneDesktop.getDiagnostics()
      : null;
    logDesktop('info', 'Desktop renderer boot', diagnostics);

    await loadScript(assetUrls.vPhoneScriptUrl);

    if (!window.Vphone || typeof window.Vphone.mount !== 'function') {
      showError('Vphone.mount() is not available after loading the runtime.');
      return;
    }

    const mountConfig = desktopConfig.mount || {};
    const appTitle = mountConfig.title || 'VPhone';
    if (titleEl) titleEl.textContent = appTitle;
    document.title = appTitle;
    const keyboardShortcuts = normalizeKeyboardShortcuts(
      desktopConfig && desktopConfig.phone && desktopConfig.phone.KeyboardShortcuts
    );
    bindShortcutPopup(
      keyboardShortcuts,
      desktopConfig && desktopConfig.phone && desktopConfig.phone.Language
    );
    const phoneConfig = normalizeDesktopPhoneConfig(desktopConfig.phone);
    logDesktop('info', 'Mounting VPhone', {
      phoneUrl: mountConfig.phoneUrl || 'embedded',
      width: mountConfig.width || '250px',
      height: mountConfig.height || '425px',
      hasServer: !!phoneConfig.wssServer,
      hasPort: !!phoneConfig.WebSocketPort,
      hasUsername: !!phoneConfig.SipUsername,
      traceSip: phoneConfig.TraceSip === true
    });

    const mountedPhoneInstance = window.Vphone.mount({
      phoneUrl: mountConfig.phoneUrl || 'embedded',
      container: panelEl,
      floating: false,
      width: mountConfig.width || '250px',
      height: mountConfig.height || '425px',
      title: mountConfig.title || 'VPhone',
      showStatus: mountConfig.showStatus === true,
      config: phoneConfig,
      onStatusChange: (event) => {
        logDesktop('info', 'Phone status changed', event);
        setStatus(event && event.registered ? 'Online' : 'Offline');
      },
      onCallEvent: async (event) => {
        logDesktop('info', 'Phone call event', event);

        if (event?.phase === 'incoming') {
          setStatus('Incoming');

          const focusDelays = [0, 150, 350, 700, 1200];
          const focusIncomingWindow = async () => {
            try {
              if (typeof window.VPhoneDesktop.focusWindow === 'function') {
                await window.VPhoneDesktop.focusWindow('incoming-call');
              }

              focusMountedPhone(mountedPhone);
              window.focus();

              const answerBtn = document.querySelector('.vphone-answer-button');
              if (answerBtn) {
                answerBtn.focus();
              }
            } catch (error) {
              logDesktop('warn', 'Failed to focus incoming-call window', {
                name: error?.name,
                message: error?.message
              });
            }
          };

          focusDelays.forEach((delay) => {
            window.setTimeout(() => {
              focusIncomingWindow();
            }, delay);
          });
        }

        if (event?.phase === 'ended') {
          setStatus('Ready');
        }
      }
    });
    mountedPhone = mountedPhoneInstance;

    if (typeof window.VPhoneDesktop.onShortcutAction === 'function') {
      window.VPhoneDesktop.onShortcutAction((payload) => {
        if (payload && payload.action) {
          sendDesktopShortcutAction(payload.action);
        }
      });
    }

    setTimeout(() => focusMountedPhone(mountedPhoneInstance), 100);

    if (typeof window.VPhoneDesktop.requestMediaAccess === 'function') {
      window.VPhoneDesktop.requestMediaAccess()
        .then((mediaAccess) => {
          if (mediaAccess && mediaAccess.microphone === false) {
            showError('Microphone permission was denied by the operating system.');
          }
        })
        .catch((error) => {
          logDesktop('warn', 'Deferred media access request failed', {
            name: error && error.name,
            message: error && error.message
          });
        });
    }

    requestBrowserMediaAccess().catch((error) => {
      logDesktop('warn', 'Deferred browser media warm-up failed', {
        name: error && error.name,
        message: error && error.message
      });
    });

    setStatus('Ready');
  } catch (error) {
    showError(error && error.message ? error.message : String(error));
  }
}());
