YorpHives Focus Fence — free local-first browser extension

FEATURES
- Maintain a user-defined list of distracting domains.
- Start a temporary focus session (1–240 minutes).
- Block top-level navigation to listed domains during the session.
- Automatically remove blocking rules when the timer ends; stop manually at any time.

INSTALL (Chrome / Edge / other Chromium browsers)
1. Download/copy the focus-fence folder containing manifest.json.
2. Open the browser Extensions page and enable Developer mode.
3. Choose Load unpacked and select this folder.
4. Open the extension popup, review domains and start a session.

PERMISSIONS
- declarativeNetRequest and broad HTTP/HTTPS host access are required to block user-selected domains. The extension only creates top-level navigation block rules for domains you save.
- storage saves the domain list and session end locally.
- alarms ends a timed session.

PRIVACY AND LIMITS
No analytics, account, AI API or remote server. The extension does not inspect page content or cookies. It blocks main-frame navigation, not every embedded request. Browser-internal pages cannot be blocked. Because this version requests broad host access to implement user-chosen blocks, review the permission prompt carefully. This is a manually loaded source package, not a store-reviewed listing. Focus blocking is not tamper-proof and can be stopped by disabling/uninstalling the extension.