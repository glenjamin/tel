var assert = require('assert');

var Lett = require('../lett.js');

describe('Using Lett', function() {
  // Create a new container for each execution
  var lett;
  beforeEach(function() { lett = Lett(); });

  describe('get/set concrete values', function() {
    beforeEach(function() {
      lett('array', []);
      lett('number', 5);
    })
    it('should provide access to values', function() {
      assert.equal(0, lett.array.length);
      lett.array.push(lett.number);
      assert.equal(1, lett.array.length);
      assert.equal(5, lett.array[0]);
    })
    it('tears down on subsequence test runs', function() {
      assert.equal(0, lett.array.length);
      assert.equal(5, lett.number);
    })
  })

  describe('get/set lazy values', function() {
    beforeEach(function() {
      lett('array', function() { return [] });
      lett('number', function() { return 5 });
    })
    it('should provide access to memoised values', function() {
      assert.equal(lett.array.length, 0);
      lett.array.push(lett.number);
      assert.equal(lett.array.length, 1);
      assert.equal(lett.array[0], 5);
    })
    it('tears down on subsequent test runs', function() {
      assert.equal(lett.array.length, 0);
      assert.equal(lett.number, 5);
    })
  })

  describe('dependant values', function() {
    beforeEach(function() {
      lett('array', function() { return [lett.a, lett.b] })
      // Can be concrete
      lett('a', 'foo')
      // Or lazy
      lett('b', function() { return 'bar' })
    })
    it('should resolve dependencies of values', function() {
      assert.deepEqual(lett.array, ['foo', 'bar']);
    })
    it('should be overridable via property', function() {
      lett.a = 'baz';
      assert.deepEqual(lett.array, ['baz', 'bar']);
    })
    it('has no effect if overridden after realised', function() {
      assert.deepEqual(lett.array, ['foo', 'bar']);
      lett.a = 'baz';
      assert.equal(lett.a, 'baz');
      assert.deepEqual(lett.array, ['foo', 'bar']);
    })
    it('tears down on subsequent test runs', function() {
      assert.deepEqual(lett.array, ['foo', 'bar']);
    })
    context('at a later time', function() {
      beforeEach(function() {
        lett('b', function() { return 'baz' })
      })
      it('can override properties', function() {
        assert.deepEqual(lett.array, ['foo', 'baz']);
      })
    })
  })

  describe('async calculation of values', function() {

    // A short database query simulator
    var counter = 0, resultSet = [];
    function dbquery(sql, callback) {
      process.nextTick(function() {
        // Async return the table name and a counter
        callback(null, [sql.substring(sql.lastIndexOf(' ') + 1)], ++counter)
      });
    }

    beforeEach(function() {
      counter = 0;
      lett('sql', 'SELECT * FROM nowhere');
      lett('result', function(done) {
        dbquery(lett.sql, done)
      })
    })

    it('should run some SQL', function(done) {
      lett.result(function(err, results) {
        assert.deepEqual(results, ['nowhere']);
        done(err);
      })
    })

    it('should be able to run different SQL', function(done) {
      lett.sql = 'SELECT * FROM somewhere';
      lett.result(function(err, results) {
        assert.deepEqual(results, ['somewhere']);
        done(err);
      })
    })

    it('should memoise callback but remain truly async', function(done) {
      var values = [];
      function inc(val) {
        values.push(val);
        if (values.length < 4) return;
        // checking execution order of inc()s below
        assert.deepEqual(['foo', 1, 'bar', 1], values);
        done();
      }

      lett.result(function(err, results, counter) {
        inc(counter)
        lett.result(function(err, results, counter) {
          inc(counter);
        })
        inc('bar');
      })
      inc('foo');
    })
  })
})