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
