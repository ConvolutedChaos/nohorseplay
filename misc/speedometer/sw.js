/* Velo service worker — caches the app shell so the speedometer works with no signal.
   Bump CACHE when you change any file, or the old copy keeps getting served. */
const CACHE = "velo-v4";
const SHELL = [
	"./",
	"./index.html",
	"./manifest.json",
	"./icon-192.png",
	"./icon-512.png",
	"./icon-maskable-512.png"
];

self.addEventListener("install", e => {
	e.waitUntil(
		caches.open(CACHE)
			.then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener("activate", e => {
	e.waitUntil(
		caches.keys()
			.then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
			.then(() => self.clients.claim())
	);
});

/* Network first so edits show up, cache as the fallback when there's no signal. */
self.addEventListener("fetch", e => {
	const req = e.request;
	if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
	e.respondWith(
		fetch(req)
			.then(res => {
				const copy = res.clone();
				caches.open(CACHE).then(c => c.put(req, copy)).catch(() => { });
				return res;
			})
			.catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
	);
});
