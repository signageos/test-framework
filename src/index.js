require('./index.css');

import sos from '@signageos/front-applet';

// Wait on sos data are ready (https://sdk.docs.signageos.io/api/js/content/latest/js-applet-basics)
sos.onReady().then(async function () {
	console.log('sOS is ready');

	const contentElement = document.getElementById('index');

	contentElement.innerHTML = 'First applet loaded';
	console.log('First applet loaded');

	// Following code is for second test example
	const { filePath } = await sos.offline.cache.loadOrSaveFile(
		'test-file.png',
		'https://2.signageos.io/assets/android-benq-amy_bbd9afbc0655ceb6da790a80fbd90290.png',
	);
	console.log('Downloaded file path', filePath);
});
