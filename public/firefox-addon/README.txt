YorpHives QuickPanel — Firefox for Android / Firefox Desktop build
Version: 1.1.0
Status: AMO submission candidate; not yet signed or published.

FEATURES
- Selected text and readable active-page capture (when the user invokes the action).
- Save a page title, URL and excerpt locally.
- Extract the first HTML table to TSV.
- Reversible reading-style page formatting.
- Local snippets and profile-based assistance for supported blank fields.
- Text cleanup, deduplication, case conversion and URL extraction.
- Export locally stored pages, snippets and profile values.
- No hosted AI model, analytics endpoint, or required account.

PERMISSIONS
- activeTab: lets QuickPanel act on the current page after the user invokes it.
- scripting: runs page actions explicitly requested by the user.
- storage: saves snippets, pages and an optional profile in the current Firefox profile.

FIREFOX FOR ANDROID INSTALLATION
The ZIP downloaded from YorpHives is a source/submission package, not a directly installable Android add-on. To make it installable in stable Firefox for Android:
1. Sign in or create an account at addons.mozilla.org/developers/.
2. Submit this ZIP as a new add-on using the self-distribution/unlisted or listed route you prefer.
3. Review and resolve any AMO validation/review feedback; download the signed XPI or wait for the approved listing.
4. Once published/listed on AMO, open the listing in Firefox for Android and tap Add to Firefox.
5. Test each action on an ordinary HTTPS webpage. Browser-internal pages and some protected pages cannot be scripted.

PRIVACY AND SAFETY
- Saved pages, snippets and profile fields remain in Firefox's local extension storage; they are not automatically synced by QuickPanel.
- Do not store passwords, payment-card data, one-time codes or other secrets.
- Form assistance only fills supported blank fields after the user clicks it; it never submits the form. Review every filled field.
- Page capture is user-invoked and limited by Firefox permissions and protected-page restrictions.
- Export files may contain personal information. Store them securely.

TESTING STATUS
This package has been adapted for the Firefox WebExtensions API and declares gecko_android compatibility. It has not yet been installed and exercised on a physical Android device, and it has not been submitted, signed or approved by Mozilla. Complete those checks before advertising it as released.

YorpHives QuickPanel web app: https://yorphives.hatchable.site/quickpanel/
Workbench: https://yorphives.hatchable.site/workbench.html