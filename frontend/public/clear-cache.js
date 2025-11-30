// Force clear all caches and service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Service Worker unregistered:', registration);
    }
  });
}

if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
      console.log('Cache deleted:', name);
    }
  });
}

console.log('🔄 Cache cleared! Page will reload...');
setTimeout(() => {
  window.location.reload(true);
}, 1000);