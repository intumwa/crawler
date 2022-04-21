// overwrite the `appVersion` property to use a custom getter
Object.defineProperty(window.navigator, 'appVersion', {
  get: function() {
    return 'None';
  },
});

// overwrite the `platform` property to use a custom getter
Object.defineProperty(window.navigator, 'platform', {
  get: function() {
    return 'None';
  },
});

// overwrite the `userAgent` property to use a custom getter
Object.defineProperty(window.navigator, 'userAgent', {
  get: function() {
    return 'None';
  },
});

// overwrite the `vendor` property to use a custom getter
Object.defineProperty(window.navigator, 'vendor', {
  get: function() {
    return 'None';
  },
});
