# Test Framework

## Intro
signageOS Test Framework allows you to write tests for your [Applet](https://docs.signageos.io/hc/en-us/articles/4405068855570-Introduction-to-Applets) and run those tests automatically on emulator and physical (digital signage) devices connected to [signageOS](https://box.signageos.io).

## How to start
### Prerequisites
* [signageOS Account](https://box.signageos.io)
* [Node.js](https://nodejs.org/en/) (v12)
* [signageOS SDK](https://github.com/signageos/sdk)
* [signageOS CLI](https://github.com/signageos/cli)
* You have [Multi-file Applet](https://docs.signageos.io/hc/en-us/articles/4405070294674-Hello-World-Setup-Developer-Environment) (Single-file is deprecated)

### Creating the first test
1. Navigate to your Multi-file Applet project root (based on your project file structure it can be out of the root of the repository. E.g. `cd applets/first-applet`)
1. Copy `./lib/` folder into your project root (it contains all necessary helper files)
1. Copy the following files to the root of your project `./.mocharc.js`, `.babelrc`
1. Add the following lines to the `package.json` file
	```json
	"scripts": {
		"test": "mocha --timeout 120000",
	},
	```
	> Your project probably already contains `scripts` section. Just add the `test` line to it.
	```json
	"sos": {
		"tests": [
			"test/first.spec.js"
		]
	},
	```
	> Don't forget to remove comma after the last line of JSON. Otherwise, the JSON will be invalid.
1. Run the following command:
	```sh
	npm add mocha should @signageos/sdk@latest @babel/register @babel/core @babel/preset-env --save-dev
	```
1. Start writing your first test to the Spec file (E.g. `test/first.spec.js`)
	```js
	const { waitUntil } = require('@signageos/sdk');
	const should = require('should');
	const { setupPlayerTiming, cleanTimings } = require("../lib/helper");
	const { appletUid, appletVersion } = require("../lib/general");

	describe('My first test', () => {

		/** Current instance of running applet on the device */
		let currentTiming;

		beforeEach(async function () {
			// Prepare timing on device with current applet and version
			const { timing } = await setupPlayerTiming(appletUid, appletVersion);
			currentTiming = timing;

			// We have to wait until applet is loaded and ready
			await waitUntil(async () => {
				await currentTiming.onLoaded;
				const consoleLogs = await currentTiming.console.log.getAll();
				// The applet is ready when it logs "sOS is ready" to the console
				should(consoleLogs).containEql('sOS is ready');
			}, 60000);
		});

		afterEach(async function() {
			// We clean up device applets after each test
			await cleanTimings();
		});

		it('should load your first applet', async function () {
			// Wait until content element contains correct expected text "First applet loaded"
			await waitUntil(async () => {
				const document = await currentTiming.html.getDOMDocument();
				const contentElement = document.getElementById('index');
				should(contentElement.innerHTML).equal('First applet loaded');
			});
			// Now test passed
		});
	});
	```

## Running tests
### On your machine
```sh
npm install
npm run build
sos applet upload

export SOS_DEVICE_UID=__REPLACE_WITH_DEVICE_UID__
export SOS_APPLET_UID=__REPLACE_WITH_APPLET_UID__
export SOS_APPLET_VERSION=__REPLACE_WITH_APPLET_VERSION__ # E.g. 0.0.0
# for Windows use `set` command instead of `export`. E.g.: set SOS_DEVICE_UID=__REPLACE_WITH_DEVICE_UID__
npm test
```

Expected output:
```
$ npm test

> first-applet@0.0.0 test
> mocha --timeout 120000

Environment variable SOS_PROFILE found. Will use non default profile from ~/.sosrc


  My first test
    ✔ should load your first applet (6873ms)


  1 passing (22s)
```

### In Box
```sh
npm install
npm run build
sos applet upload

export SOS_APPLET_UID=__REPLACE_WITH_APPLET_UID__
export SOS_APPLET_VERSION=__REPLACE_WITH_APPLET_VERSION__ # E.g. 0.0.0
# for Windows use `set` command instead of `export`. E.g.: set SOS_DEVICE_UID=__REPLACE_WITH_DEVICE_UID__
sos applet test upload
```

Expected output:
```
$ sos applet test upload
Next files is being created...
test/first.spec.js
✔ Do you want to do applet version test changes for applet first-applet and version 0.0.0? … yes
[■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■] Uploading applet test files 100% | ETA: 0s | 2/1Applet first-applet version 0.0.0 tests has been uploaded.
```

1. Log in to [Box](https://box.signageos.io)
1. Open device detail page
1. Navigate to "Testing" tab
1. Select your applet and version
1. Click "Run applet tests" button

### Editing tests
> When you edit tests or code, apply following
1. `npm run build`
1. `sos applet upload`
1. `npm test`

> In case you restart/reopen the Terminal, you have to set the environment variables again
```sh
export SOS_DEVICE_UID=__REPLACE_WITH_DEVICE_UID__
export SOS_APPLET_UID=__REPLACE_WITH_APPLET_UID__
export SOS_APPLET_VERSION=__REPLACE_WITH_APPLET_VERSION__ # E.g. 0.0.0
# for Windows use `set` command instead of `export`. E.g.: set SOS_DEVICE_UID=__REPLACE_WITH_DEVICE_UID__
```

## Framework API overview
### Setup Applet to the tested device
In test:
```js
setupPlayerTiming(appletUid, appletVersion)
```
Before every test case (`it`) we have to setup applet to the tested device. This function returns `timing` instance of the applet.
We can use this instance to interact with the applet.

### Clean Applet from the tested device
In test:
```js
cleanTimings()
```
After every test case (`it`) we have to clean applet from the tested device.

### Console logs
In applet:
```js
console.log('sOS is ready');
```
In test:
```js
const consoleLogs = await currentTiming.console.log.getAll();
should(consoleLogs).containEql('sOS is ready');
```

### HTML
In applet:
```js
document.getElementById('index').innerHTML = 'First applet loaded';
```
```html
<div id="index">First applet loaded</div>
```

In test:
```js
const document = await currentTiming.html.getDOMDocument();
const contentElement = document.getElementById('index');
should(contentElement.innerHTML).equal('First applet loaded');
```

### File System
In applet:
```js
const storageUnits = await sos.fileSystem.listStorageUnits();
const internalStorageUnit = storageUnits.find((storageUnit) => !storageUnit.removable);
await sos.fileSystem.downloadFile({
		storageUnit: internalStorageUnit,
		filePath: 'test.png'
	},
	'https://example.com/test.png',
);
```
In test:
```js
const storageUnits = await currentTiming.fileSystem.listStorageUnits();
const internalStorageUnit = storageUnits.find((storageUnit) => !storageUnit.removable);
const files = await currentTiming.fileSystem.listFiles(internalStorageUnit);
should(files).containEql('test.png');
```

### File Cache
In applet:
```js
const { filePath } = await sos.offline.cache.loadOrSaveFile('test-file.mp4', 'https://example.com/test.mp4');
```
In test:
```js
const files = await currentTiming.offline.cache.listFiles();
should(files).containEql('test-file.mp4');
```

### Video
In applet:
```js
await sos.video.play('test.mp4', 0, 0, 1920, 1080);
await sos.video.onceEnded('test.mp4', 0, 0, 1920, 1080);
await sos.video.stop('test.mp4', 0, 0, 1920, 1080);
```
In test:
```js
const playingVideos = await currentTiming.video.play.getAll();
should(playingVideos[0].uri).equal('test.mp4');
should(playingVideos[0].x).equal(0);
should(playingVideos[0].y).equal(0);
should(playingVideos[0].width).equal(1920);
should(playingVideos[0].height).equal(1080);

const stoppedVideos = await currentTiming.video.stop.getAll();
should(stoppedVideos[0].uri).equal('test.mp4');
should(stoppedVideos[0].x).equal(0);
should(stoppedVideos[0].y).equal(0);
should(stoppedVideos[0].width).equal(1920);
should(stoppedVideos[0].height).equal(1080);
```

## How to add more tests
1. Add new test file to `test` folder (E.g. `test/second.spec.js`)
1. Add the test file path to "sos.tests" in `package.json`
	```json
	"sos": {
		"tests": [
			"test/first.spec.js",
			"test/second.spec.js"
		]
	}
	```
1. Continue with [Editing tests](#editing-tests)
