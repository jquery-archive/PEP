define([
  '../support/tdd',
  'intern/chai!expect',
  'pep'
], function(tdd, expect, pep) {
  var suite = tdd.suite;
  var test = tdd.test;

  suite('Loader', function() {
    test('PointerEvent', function() {
      expect(pep.PointerEvent).to.be.ok;
    });
    suite('PointerEventsPolyfill modules', function() {

//      var pep = window.PointerEventsPolyfill;
      test('PointerEventsPolyfill', function() {
        expect(pep).to.be.ok;
      });
      test('Map', function() {
        expect(pep.Map).to.be.ok;
      });
      test('Dispatcher', function() {
        expect(pep.dispatcher).to.be.ok;
      });
      test('Installer', function() {
        expect(pep.Installer).to.be.ok;
      });
      test('Target Finding', function() {
        expect(pep.targetFinding).to.be.ok;
      });
    });
  });
});
