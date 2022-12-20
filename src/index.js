require('./index.css');

import sos from '@signageos/front-applet';

// Wait on sos data are ready (https://sdk.docs.signageos.io/api/js/content/latest/js-applet-basics)
sos.onReady().then(async function () {
	console.log('sOS is ready');

	const contentElement = document.getElementById('index');

	contentElement.innerHTML = 'First applet loaded';
	console.log('First applet loaded');
});
