// overwrite the `webdriver` property to use a custom getter
Object.defineProperty(window.navigator, 'webdriver', {
  get: function() {
    return false;
  },
});
