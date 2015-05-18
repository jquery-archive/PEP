define([
  '../support/tdd',
  'intern/chai!expect',
  'pep'
], function(tdd, expect, pep) {
  var suite = tdd.suite;
  var test = tdd.test;

  suite('Map', function() {
    var Map = pep.Map;
    test('PEP Map has Map API', function() {
      var keys = [
        'set',
        'get',
        'has',
        'delete',
        'size',
        'clear',
        'forEach'
      ];
      var e = expect(Map.prototype);
      keys.forEach(function(k) {
        e.to.have.ownProperty(k);
      });
    });
    test('Map .set', function() {
      var p = new Map();
      p.set(1, true);
      expect(p.size).to.equal(1);
    });
    test('Map .size', function() {
      var p = new Map();
      expect(p.size).to.be.a('number');
      expect(p.size).to.equal(0);
      p.set(1, true);
      expect(p.size).to.equal(1);
      p.set(1, false);
      expect(p.size).to.equal(1);
    });
    test('Map .has', function() {
      var p = new Map();
      p.set(1, true);
      expect(p.has(1)).to.equal(true);
      expect(p.has(0)).to.equal(false);
    });
    test('Map .delete', function() {
      var p = new Map();
      p.set(1, true);
      p.set(2, false);
      expect(p.size).to.equal(2);
      p.delete(1);
      expect(p.size).to.equal(1);
      expect(p.get(2)).to.equal(false);
    });
    test('Map .clear', function() {
      var p = new Map();
      p.set(1, true);
      p.clear();
      expect(p.size).to.equal(0);
    });
    test('Map .forEach', function() {
      var p = new Map();
      p.set(1, true);
      p.set(2, false);
      p.set(3, {});
      p.forEach(function(v, k, m) {
        expect(k).to.be.ok;
        expect(v).to.equal(p.get(k));
        expect(m).to.equal(p);
      });
    });
  });
});
