const cacheID = "vphone-cache-v1";
const CacheItems = [
  "index.html", // Special page: Loads from network

  "/favicon.ico",
  "icons/phone-256x256.ico",

  "wallpaper.dark.webp",
  "wallpaper.light.webp",

  "media/Ringtone.mp3",
  "media/Busy.mp3",
  "media/CallWaiting.mp3",
  "media/Congestion.mp3",
  "media/EarlyMedia.mp3",

  "https://dtd6jl0d42sve.cloudfront.net/lib/jquery/jquery-3.6.1.min.js",
  "https://dtd6jl0d42sve.cloudfront.net/lib/jquery/jquery-ui-1.13.2.min.js",
  "https://dtd6jl0d42sve.cloudfront.net/lib/jquery/jquery.md5-min.js",
  "https://dtd6jl0d42sve.cloudfront.net/lib/Chart/Chart.bundle-2.7.2.min.js",
  "https://dtd6jl0d42sve.cloudfront.net/lib/SipJS/sip-0.20.0.min.js",
  "https://dtd6jl0d42sve.cloudfront.net/lib/FabricJS/fabric-2.4.6.min.js",
  "https://dtd6jl0d42sve.cloudfront.net/lib/Moment/moment-with-locales-2.24.0.min.js",
  "https://dtd6jl0d42sve.cloudfront.net/lib/Croppie/Croppie-2.6.4/croppie.min.js",

  "https://dtd6jl0d42sve.cloudfront.net/lib/Normalize/normalize-v8.0.1.css",
  "https://dtd6jl0d42sve.cloudfront.net/lib/fonts/font_roboto/roboto.css",
  "https://dtd6jl0d42sve.cloudfront.net/lib/fonts/font_awesome/css/font-awesome.min.css",
  "https://dtd6jl0d42sve.cloudfront.net/lib/jquery/jquery-ui-1.13.2.min.css",
  "https://dtd6jl0d42sve.cloudfront.net/lib/Croppie/Croppie-2.6.4/croppie.css",

  "phone.js",
  "phone.css",
];

self.addEventListener("install", function (event) {
  console.log("Service Worker: Install");
  event.waitUntil(
    caches
      .open(cacheID)
      .then(function (cache) {
        console.log("Cache open, adding Items:", CacheItems);
        return cache.addAll(CacheItems);
      })
      .then(function () {
        console.log("Items Added to Cache, skipWaiting");
        // Skip waiting to activate
        self.skipWaiting();
      })
      .catch(function (error) {
        console.warn("Error opening Cache:", error);
        // Skip waiting to activate
        self.skipWaiting();
      }),
  );
});

self.addEventListener("activate", function (event) {
  console.log("Service Worker: Activate");
  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (cacheName !== cacheID) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          }),
        );
      })
      .then(function () {
        return clients.claim();
      }),
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  var reqUrl = new URL(event.request.url);
  var appShellRequest =
    reqUrl.origin === self.location.origin &&
    (reqUrl.pathname.endsWith("/index.html") ||
      reqUrl.pathname.endsWith("/phone.js") ||
      reqUrl.pathname.endsWith("/phone.css"));

  if (event.request.url.endsWith("index.html")) {
    console.log("Special Home Page handling...", event.request.url);
    event.respondWith(loadHomePage(event.request));
  } else if (appShellRequest) {
    event.respondWith(loadFromNetworkFirst(event.request));
  } else {
    // Other Request
    event.respondWith(loadFromCacheFirst(event.request));
  }
});

const canCacheRequest = function (request) {
  if (!request || !request.url) return false;
  try {
    var reqUrl = new URL(request.url);
    return reqUrl.protocol === "http:" || reqUrl.protocol === "https:";
  } catch (error) {
    return false;
  }
};

const loadFromCacheFirst = async function (request) {
  // First try to get the resource from the cache
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }
  // Next try to get the resource from the network
  try {
    const responseFromNetwork = await fetch(request);
    if (responseFromNetwork.ok) {
      // If the request was fine, add it to the cache
      addToCache(request, responseFromNetwork.clone());
    }
    return responseFromNetwork;
  } catch (error) {
    return new Response("Network Error", {
      status: 408,
      statusText: "Network Error",
      headers: { "Content-Type": "text/plain" },
    });
  }
};
const loadFromNetworkFirst = async function (request) {
  try {
    const responseFromNetwork = await fetch(request, { cache: "no-store" });
    if (responseFromNetwork && responseFromNetwork.ok) {
      addToCache(request, responseFromNetwork.clone());
    }
    return responseFromNetwork;
  } catch (error) {
    const responseFromCache = await caches.match(request);
    if (responseFromCache) return responseFromCache;
    return new Response("Network Error", {
      status: 408,
      statusText: "Network Error",
      headers: { "Content-Type": "text/plain" },
    });
  }
};
const loadHomePage = async function (request) {
  // First try to get the resource from the network
  try {
    const responseFromNetwork = await fetch(request);
    if (responseFromNetwork.ok) {
      // Normal Response from server
      return responseFromNetwork;
    } else {
      throw new Error("Server Error");
    }
  } catch (error) {
    return new Response("Network Error", {
      status: 408,
      statusText: "Network Error",
      headers: { "Content-Type": "text/plain" },
    });
  }
};
const addToCache = async function (request, response) {
  if (!canCacheRequest(request)) return;
  if (!response || !(response.ok || response.type === "opaque")) return;
  const cache = await caches.open(cacheID);
  await cache.put(request, response);
};
