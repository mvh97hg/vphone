; Default language selector to Vietnamese (runs before MUI_LANGDLL_DISPLAY).
!macro preInit
  StrCpy $LANGUAGE ${LANG_VIETNAMESE}
!macroend

; appId was bumped com.vphone.app -> com.vphone.softphone for taskbar AUMID.
; electron-builder GUID is derived from appId, so the old ARP entry was orphaned.
!define VPHONE_LEGACY_UNINSTALL_GUID "1a7b4758-7242-5396-97c5-0cf39568734e"

!macro removeLegacyUninstallEntry root key
  DeleteRegKey ${root} "Software\Microsoft\Windows\CurrentVersion\Uninstall\${key}"
  DeleteRegKey ${root} "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${key}}"
  DeleteRegKey ${root} "Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\${key}"
  DeleteRegKey ${root} "Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\{${key}}"
!macroend

!macro customInit
  !insertmacro removeLegacyUninstallEntry HKCU "${VPHONE_LEGACY_UNINSTALL_GUID}"
  !insertmacro removeLegacyUninstallEntry HKLM "${VPHONE_LEGACY_UNINSTALL_GUID}"
!macroend

; After files + default shortcuts are created, force-refresh shortcut icons.
; Prefer sidecar VPhone.ico (extraFiles) so taskbar/Start Menu do not keep Electron.
!macro customInstall
  Delete "$newDesktopLink"
  Delete "$newStartMenuLink"
  StrCpy $0 "$appExe"
  IfFileExists "$INSTDIR\VPhone.ico" 0 +2
    StrCpy $0 "$INSTDIR\VPhone.ico"
  CreateShortCut "$newDesktopLink" "$appExe" "" "$0" 0 "" "" "${APP_DESCRIPTION}"
  CreateShortCut "$newStartMenuLink" "$appExe" "" "$0" 0 "" "" "${APP_DESCRIPTION}"
  WinShell::SetLnkAUMI "$newDesktopLink" "${APP_ID}"
  WinShell::SetLnkAUMI "$newStartMenuLink" "${APP_ID}"
  System::Call 'shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
  nsExec::ExecToLog '"$WINDIR\System32\ie4uinit.exe" -show'
!macroend

!macro customUnInstall
  System::Call 'shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend
