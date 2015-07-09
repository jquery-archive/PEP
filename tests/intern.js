define({
  proxyPort: 9000,
  proxyUrl: 'http://localhost:9000/',
  capabilities: {},
  environments: [
    { browserName: 'chrome' },
    { browserName: 'internet explorer', version: ['11', '10', '9'] },

    // TODO: Remove old Firefox version once BrowserStack has Selenium 2.45.0
    { browserName: 'firefox', version: '34' }
  ],
  maxConcurrency: 2,
  tunnel: 'BrowserStackTunnel',
  loader: {
    packages: [
      { name: 'chai-spies', location: 'node_modules/chai-spies', main: 'chai-spies' },
      { name: 'pep', location: 'dist', main: 'pep' },
      { name: 'tests', location: 'tests' }
    ]
  },
  suites: [
    'tests/unit/capture',
    'tests/unit/constructor',
    'tests/unit/dispatcher',
    'tests/unit/loader',
    'tests/unit/pointermap'
  ],
  functionalSuites: [

    //'tests/functional/pointerevent_button_attribute_mouse-manual',
    'tests/functional/pointerevent_capture_mouse-manual',
    'tests/functional/pointerevent_capture_suppressing_mouse-manual'
  ],
  excludeInstrumentation: /^(?:node_modules|tests)\//
});
