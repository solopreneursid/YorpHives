# YorpHives Developer Toolkit

Free, local-first VS Code extension with four commands: format JSON, decode a URL component, show text statistics, and convert selected text to camelCase. No accounts, telemetry, AI APIs, external dependencies, or network calls.

## Install from source
1. Download and extract the YorpHives Developer Toolkit package.
2. In VS Code, open Extensions and choose the `...` menu, then **Install from VSIX** only if you have packaged it as a VSIX; alternatively place this folder under your local `.vscode/extensions/yorphives-toolkit` directory and reload VS Code.
3. Open the Command Palette and run a command starting with `YorpHives:`.

For a standard distributable VSIX, package this folder using Microsoft's `vsce` tool. This downloadable source ZIP is not a signed VSIX and is not listed on the Visual Studio Marketplace.

## Privacy
All operations run locally in VS Code. JSON formatting replaces the selection if one exists, otherwise the whole document. URL decoding may fail on malformed percent encoding. Review changes before saving.

## License
MIT