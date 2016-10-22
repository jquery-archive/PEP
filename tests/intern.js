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
  loaderOptions: {
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

    'tests/functional/pointerevent_button_attribute_mouse-manual',
    'tests/functional/pointerevent_capture_mouse-manual',
    'tests/functional/pointerevent_capture_suppressing_mouse-manual',

    // 'tests/functional/pointerevent_change-touch-action-onpointerdown_touch-manual',
    'tests/functional/pointerevent_constructor',

    'tests/functional/pointerevent_gotpointercapture_before_first_pointerevent-manual',

    // 'tests/functional/pointerevent_lostpointercapture_for_disconnected_node-manual',
    'tests/functional/pointerevent_lostpointercapture_is_first-manual',

    // 'tests/functional/pointerevent_pointercancel_touch-manual',
    'tests/functional/pointerevent_pointerdown-manual',

    'tests/functional/pointerevent_pointerenter-manual',
    'tests/functional/pointerevent_pointerenter_does_not_bubble-manual',

    // 'tests/functional/pointerevent_pointerenter_nohover-manual.html',
    // 'tests/functional/pointerevent_pointerleave_after_pointercancel_touch-manual',
    // 'tests/functional/pointerevent_pointerleave_after_pointerup_nohover-manual',

    'tests/functional/pointerevent_pointerleave_descendant_over-manual',
    'tests/functional/pointerevent_pointerleave_descendants-manual',
    'tests/functional/pointerevent_pointerleave_does_not_bubble-manual',
    'tests/functional/pointerevent_pointerleave_mouse-manual',

    // 'tests/functional/pointerevent_pointerleave_pen-manual',
    // 'tests/functional/pointerevent_pointerleave_touch-manual',

    'tests/functional/pointerevent_pointermove-manual',

    // 'tests/functional/pointerevent_pointermove-on-chorded-mouse-button',
    'tests/functional/pointerevent_pointermove_isprimary_same_as_pointerdown-manual',
    'tests/functional/pointerevent_pointermove_pointertype-manual',

    'tests/functional/pointerevent_pointerout-manual',

    // 'tests/functional/pointerevent_pointerout_after_pointercancel_touch-manual.js',
    // 'tests/functional/pointerevent_pointerout_after_pointerup_nohover-manual.js',
    // 'tests/functional/pointerevent_pointerout_pen-manual.js',

    'tests/functional/pointerevent_pointerout_received_once-manual.js',
    'tests/functional/pointerevent_pointerover-manual.js',
    'tests/functional/pointerevent_pointertype_mouse-manual.js',

    // 'tests/functional/pointerevent_pointertype_pen-manual.js',
    // 'tests/functional/pointerevent_pointertype_touch-manual.js',

    'tests/functional/pointerevent_pointerup-manual.js',
    'tests/functional/pointerevent_pointerup_isprimary_same_as_pointerdown-manual.js',
    'tests/functional/pointerevent_pointerup_pointertype-manual.js',

    // 'tests/functional/pointerevent_properties_mouse-manual.js',

    'tests/functional/pointerevent_releasepointercapture_events_to_original_target-manual.js',
    'tests/functional/pointerevent_releasepointercapture_invalid_pointerid-manual.js',

    // 'tests/functional/pointerevent_releasepointercapture_onpointercancel_touch-manual.js',
    'tests/functional/pointerevent_releasepointercapture_onpointerup_mouse-manual',

    'tests/functional/pointerevent_setpointercapture_disconnected-manual.js',
    'tests/functional/pointerevent_setpointercapture_inactive_button_mouse-manual.js',
    'tests/functional/pointerevent_setpointercapture_invalid_pointerid-manual.js',
    'tests/functional/pointerevent_setpointercapture_relatedtarget-manual.js'

    // 'tests/functional/pointerevent_touch-action-auto-css_touch-manual.js',
    // 'tests/functional/pointerevent_touch-action-button-test_touch-manual.js',
    // 'tests/functional/pointerevent_touch-action-illegal.js',
    // 'tests/functional/pointerevent_touch-action-inherit_child-auto-child-none_touch-manual.js',
    // 'tests/functional/pointerevent_touch-action-inherit_child-none_touch-manual.js',
    // 'tests/functional/pointerevent_touch-action-inherit_child-pan-x-child-pan-x_touch-manual.js',
    // 'tests/functional/pointerevent_touch-action-inherit_child-pan-x-child-pan-y_touch-manual.js',
    // 'tests/functional/pointerevent_touch-action-inherit_highest-parent-none_touch-manual.js',
    // 'tests/functional/pointerevent_touch-action-inherit_parent-none_touch-manual.js',
    // 'tests/functional/pointerevent_touch-action-keyboard-manual.js',
    // 'tests/functional/pointerevent_touch-action-mouse-manual.js'
    // 'tests/functional/pointerevent_touch-action-none-css_touch-manual.js',
    // 'tests/functional/pointerevent_touch-action-pan-x-css_touch-manual.js',
    // 'tests/functional/pointerevent_touch-action-pan-x-pan-y-pan-y_touch-manual.js',
    // 'tests/functional/pointerevent_touch-action-pan-x-pan-y_touch-manual.js',
    // 'tests/functional/pointerevent_touch-action-pan-y-css_touch-manual.js',
    // 'tests/functional/pointerevent_touch-action-span-test_touch-manual.js',
    // 'tests/functional/pointerevent_touch-action-svg-test_touch-manual.js',
    // 'tests/functional/pointerevent_touch-action-table-test_touch-manual.js',
    // 'tests/functional/pointerevent_touch-action-verification.js'
  ],
  excludeInstrumentation: /^(?:node_modules|tests)\//
});
