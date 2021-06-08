# IC Transaction Scanner

Security minded people prefer an air-gapped (AG) setup where they can always keep their private keys offline.
1. Create a transaction on AG computer (e.g. `dfx canister sign` [DFINITY SDK]) as a JSON file.
2. Create a QR-Code by `cat message.json|gzip -c|base64|qrencode -o message.png`.
3. Scan the QR-Code on a non-AG computer (e.g. mobile phone) using this single page app to send it.

This app has been deployed on the IC at https://p5deo-6aaaa-aaaab-aaaxq-cai.raw.ic0.app

Features:
- [x] Send both query and update calls produced by `dfx`.
- [x] Send update calls with request status produced by [nano].
- [x] Support request status for `dfx` >= 0.7.1.
- [ ] Decode message send result.
- [ ] Support [Add to Home screen] from mobile browser.
- [ ] Pick a better default camera (micro-lens) by default, or let user choose.

Note:
* A message has to fit in the QR-Code size limit, which is about 4000 characters after `gzip -c|base64`.
* Blurry image does not work, but you can always enlarge the QR code displayed on your AG computer to help with the scanning.

Acknowledgement:
* Single page deployment on IC using the minimalistic tool [monic], courtesy of [blynn].
* QR scanning is from [zbar.wasm].
* CSS is from [Simple.css].

[DFINITY SDK]: https://sdk.dfinity.org
[nano]: https://github.com/dfinity-lab/nano
[Add to Home screen]: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Add_to_home_screen
[zbar.wasm]: https://github.com/samsam2310/zbar.wasm
[Simple.css]: https://simplecss.org
[monic]: https://fmfd2-7qaaa-aaaae-aaapq-cai.raw.ic0.app
[blynn]: https://crypto.stanford.edu/~blynn

To learn more about developing apps on the Internet Computer, see the following documentation available online:

- [Quick Start](https://sdk.dfinity.org/docs/quickstart/quickstart-intro.html)
- [SDK Developer Tools](https://sdk.dfinity.org/docs/developers-guide/sdk-guide.html)
- [Motoko Programming Language Guide](https://sdk.dfinity.org/docs/language-guide/motoko.html)
- [Motoko Language Quick Reference](https://sdk.dfinity.org/docs/language-guide/language-manual.html)
