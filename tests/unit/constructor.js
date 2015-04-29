define([
  '../support/tdd',
  'intern/chai!expect',
  'pep'
], function(tdd, expect, pep) {
  var suite = tdd.suite;
  var test = tdd.test;

  suite('Constructor', function() {

    test('PointerEvents have the required properties', function() {
      var props = [
        'bubbles',
        'cancelable',
        'view',
        'detail',
        'screenX',
        'screenY',
        'clientX',
        'clientY',
        'ctrlKey',
        'altKey',
        'shiftKey',
        'metaKey',
        'button',
        'relatedTarget',
        'pointerId',
        'width',
        'height',
        'pressure',
        'tiltX',
        'tiltY',
        'pointerType',
        'hwTimestamp',
        'isPrimary'
      ];
      var p = new pep.PointerEvent();
      props.forEach(function(k) {
        expect(p).to.have.property(k);
      });
    });

    test('PointerEvent can be initialized from an object', function() {
      var p = new pep.PointerEvent('foo', { pointerType: 'pen', button: 0, which: 1 });
      expect(p.pointerType).to.equal('pen');
      expect(p.button).to.equal(0);
      p = new pep.PointerEvent('bar', { button: 2, which: 3 });
      expect(p.button).to.equal(2);
    });

    test('Button properties are used for pressure', function() {
      var p = new pep.PointerEvent('foo', { buttons: 1 });
      expect(p.pressure).to.equal(0.5);

      // test for buttons property
      p = new pep.PointerEvent('bar');
      expect(p.pressure).to.equal(0);
    });
  });
});
