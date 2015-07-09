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

    // 'tests/functional/pointerevent_button_attribute_mouse-manual',
    'tests/functional/pointerevent_capture_mouse-manual',
    'tests/functional/pointerevent_capture_suppressing_mouse-manual',

    // 'tests/functional/pointerevent_change-touch-action-onpointerdown_touch-manual',
    'tests/functional/pointerevent_constructor',

    // 'tests/functional/pointerevent_gotpointercapture_before_first_pointerevent-manual',
    // 'tests/functional/pointerevent_lostpointercapture_for_disconnected_node-manual',
    'tests/functional/pointerevent_lostpointercapture_is_first-manual',

    // 'tests/functional/pointerevent_pointercancel_touch-manual',
    'tests/functional/pointerevent_pointerdown-manual',
    'tests/functional/pointerevent_pointerenter_does_not_bubble-manual',
    'tests/functional/pointerevent_pointerenter-manual',

    // 'tests/functional/pointerevent_pointerleave_after_pointercancel_touch-manual',
    // 'tests/functional/pointerevent_pointerleave_after_pointerup_nohover-manual',

    'tests/functional/pointerevent_pointerleave_descendant_over-manual',
    'tests/functional/pointerevent_pointerleave_descendants-manual',

    // 'tests/functional/pointerevent_pointerleave_does_not_bubble-manual',
    // 'tests/functional/pointerevent_pointerleave_mouse-manual',

    'tests/functional/pointerevent_pointermove_isprimary_same_as_pointerdown-manual'
  ],
  excludeInstrumentation: /^(?:node_modules|tests)\//
});
