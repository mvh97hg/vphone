export class DomRenderer {
  constructor(root) {
    if (!root) throw new Error("DomRenderer requires root");
    this.root = root;
    this.#ensureLegacyPhoneJsLayout();
    this.refs = {
      status: root.querySelector("[data-role='status']"),
      numberInput: root.querySelector("#dialText") || root.querySelector("#txtFindBuddy"),
      remoteMedia: root.querySelector("[data-role='remote-media']"),
      localMedia: root.querySelector("[data-role='local-media']"),
      searchArea: root.querySelector("#searchArea"),
      mobileTopBar: root.querySelector("#mobileTopBar"),
      contactsTabHeader: root.querySelector("#contactsTabHeader"),
      myContacts: root.querySelector("#myContacts"),
      actionArea: root.querySelector("#actionArea"),
      rightContent: root.querySelector("#rightContent"),
      tabDialpad: root.querySelector("#tab-dialpad"),
      tabRecents: root.querySelector("#tab-recents"),
      tabContacts: root.querySelector("#tab-contacts")
    };
    this.showTab("dialpad");
  }

  getTargetNumber() {
    const dialText = this.root.querySelector("#dialText");
    const findBuddy = this.root.querySelector("#txtFindBuddy");
    const value = (dialText?.value || findBuddy?.value || "").trim();
    return value;
  }

  setStatus(text) {
    if (this.refs.status) this.refs.status.textContent = text;
  }

  setRegistrationState({ online, user, error } = {}) {
    const regText = this.root.querySelector("#mobileRegText");
    const regDot = this.root.querySelector("#mobileRegDot");
    const regLink = this.root.querySelector("#reglink");
    const deregLink = this.root.querySelector("#dereglink");
    const userCallId = this.root.querySelector("#UserCallID");
    if (regText) regText.textContent = online ? (user || "Online") : (error ? "Offline" : "Offline");
    if (regDot) regDot.className = online ? "dotOnline" : "dotOffline";
    if (regLink) regLink.className = online ? "dotOnline" : "dotOffline";
    if (deregLink) deregLink.style.display = online ? "" : "none";
    if (userCallId && user) userCallId.textContent = user;
  }

  attachMedia(name, stream) {
    const el = name === "local" ? this.refs.localMedia : this.refs.remoteMedia;
    if (!el) return;
    try {
      el.srcObject = stream;
    } catch {
      el._vphoneDebugStream = stream;
    }
  }

  showTab(tabName) {
    const t = String(tabName || "dialpad");
    const isDialpad = t === "dialpad";
    const isContacts = t === "contacts";

    if (this.refs.contactsTabHeader) this.refs.contactsTabHeader.style.display = "none";
    if (this.refs.myContacts) this.refs.myContacts.style.display = isContacts ? "" : "none";
    if (this.refs.actionArea) this.refs.actionArea.style.display = isContacts ? "none" : "";
    if (this.refs.searchArea) this.refs.searchArea.style.display = "none";
    this.renderMobileTopBar(t);

    if (this.refs.tabDialpad) this.refs.tabDialpad.classList.toggle("activeTab", isDialpad);
    if (this.refs.tabRecents) this.refs.tabRecents.classList.toggle("activeTab", t === "recents");
    if (this.refs.tabContacts) this.refs.tabContacts.classList.toggle("activeTab", isContacts);
  }

  showSearch(show) {
    if (!this.refs.searchArea) return;
    this.refs.searchArea.style.display = show ? "" : "none";
  }

  renderMobileTopBar(tabName) {
    if (!this.refs.mobileTopBar) return;
    const regLink =
      "<button type=\"button\" class=\"mobileTopBtn\" data-action=\"reg\" title=\"Registration\">" +
      "<span class=\"mobileRegStatus\"><span id=\"mobileRegDot\" class=\"dotOffline\"></span>" +
      "<span id=\"mobileRegText\">Offline</span></span></button>";
    let actions = "";
    if (tabName === "recents") {
      actions += "<button type=\"button\" class=\"mobileTopBtn\" data-action=\"clear-tab\" data-tab=\"recents\" title=\"Delete\"><i class=\"fa fa-trash\"></i></button>";
    } else if (tabName === "contacts") {
      actions += "<button type=\"button\" class=\"mobileTopBtn\" data-action=\"add-contact\" title=\"Add\"><i class=\"fa fa-plus\"></i></button>";
      actions += "<button type=\"button\" class=\"mobileTopBtn\" data-action=\"clear-tab\" data-tab=\"contacts\" title=\"Delete\"><i class=\"fa fa-trash\"></i></button>";
    }
    actions += "<button type=\"button\" class=\"mobileTopBtn\" data-action=\"more\" title=\"More\"><i class=\"fa fa-ellipsis-v\"></i></button>";
    this.refs.mobileTopBar.innerHTML =
      "<div class=\"mobileTopBarInner\"><div class=\"mobileTopBarTitle\">" + regLink + "</div>" +
      "<div class=\"mobileTopBarActions\">" + actions + "</div></div>";
  }

  #ensureLegacyPhoneJsLayout() {
    if (this.root.querySelector("[data-role='number-input']")) return;
    this.root.innerHTML = `
      <div class="loading">
        <span class="fa fa-circle-o-notch fa-spin"></span>
      </div>
      <div id="Phone" class="pageContainer phoneStandalone phoneFrame250" style="max-width: 1240px;">
        <div id="leftContent" style="float:left; height:100%; width:100%" class="dialpadMode">
          <table id="leftContentTable" class="leftContentTable" style="height:100%; width:100%; border-left-width:0px; border-right-width:0px;" cellspacing="0" cellpadding="0">
            <tr>
              <td class="streamSection" style="height: 50px; box-sizing: border-box;">
                <div class="profileContainer">
                  <div class="contact" id="UserProfile" style="cursor: default; margin-bottom:5px;">
                    <span id="TxtVoiceMessages" class="voiceMessageNotifyer">0</span>
                    <div id="UserProfilePic" class="buddyIcon" style="background-image: url(&quot;icons/phone.ico&quot;);"></div>
                    <span class="settingsMenu">
                      <button class="roundButtons" id="BtnFreeDial" data-action="call" title="Call"><i class="fa fa-phone"></i></button>
                      <button class="roundButtons" id="SettingsMenu" title="Configure Extension"><i class="fa fa-cogs"></i></button>
                    </span>
                    <div class="contactNameText" style="margin-right: 0px;">
                      <span id="dereglink" class="dotOnline" style="display:none"></span>
                      <span id="reglink" class="dotOffline"></span>
                      <span id="UserCallID"></span>
                    </div>
                    <div class="presenceText">
                      <span id="regStatus" data-role="status">&nbsp;</span>
                      <span id="dndStatus"></span>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            <tr id="searchArea" style="display:none;">
              <td class="streamSection" style="height: 35px; box-sizing: border-box; padding-top: 3px; padding-bottom: 0px;">
                <span id="divFindBuddy" class="searchClean">
                  <input id="txtFindBuddy" type="text" autocomplete="none" data-role="number-input" style="width: calc(100% - 78px);" placeholder="Find someone...">
                </span>
                <button class="roundButtons" id="BtnFilter" style="margin-left:5px" title="Filter and Sort"><i class="fa fa-sliders"></i></button>
              </td>
            </tr>
            <tr id="contentAreaRow">
              <td class="streamSection" style="padding:0">
                <div id="mobileTopBar" class="mobileTopBar"></div>
                <div id="contactsTabHeader" class="contactsTabHeader" style="display:none;"><span style="flex:1;">Contacts</span></div>
                <div id="myContacts" class="contactArea cleanScroller" style="display:none;"></div>
                <div id="actionArea" style="" class="contactArea cleanScroller dialpadMode"></div>
              </td>
            </tr>
            <tr id="tabBarRow">
              <td class="streamSection" style="padding:0">
                <div id="bottomTabBar" class="mainTabBar">
                  <button type="button" id="tab-dialpad" class="mainTab activeTab" data-label="Dialpad"><i class="fa fa-th mainTabIcon"></i></button>
                  <button type="button" id="tab-recents" class="mainTab" data-label="Recents"><i class="fa fa-history mainTabIcon"></i></button>
                  <button type="button" id="tab-contacts" class="mainTab" data-label="Contacts"><i class="fa fa-address-book mainTabIcon"></i></button>
                </div>
              </td>
            </tr>
          </table>
        </div>
        <div id="rightContent" class="rightContent" style="margin-left:320px; height:100%; border-right-width:0px; display:none;"></div>
      </div>
    `;
  }
}
