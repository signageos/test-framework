const { waitUntil } = require('@signageos/sdk');
const should = require('should');
const { setupPlayerTiming, cleanTimings } = require("../lib/helper");
const { appletUid, appletVersion } = require("../lib/general");

describe('My second test', () => {

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

	it('should load save file to local file system (cache)', async function () {
		// Wait until file is downloaded
		await waitUntil(async () => {
			const files = await currentTiming.offline.cache.listFiles();
			should(files).containEql('test-file.png');
		});
		// Wait until file path is logged to the console
		await waitUntil(async () => {
			const consoleLogs = await currentTiming.console.log.getAll();
			should(consoleLogs).containEql('Downloaded file path');
		});
		// Now test passed
	});
});
