if (typeof require === 'function') {
  var Tel = require('../tel.js');
  var assert = require('chai').assert;
} else {
  var assert = chai.assert;
}

describe('Using tel', function() {
  // Create a new container for each execution
  var tel;
  beforeEach(function() { tel = Tel(); });

  describe('get/set concrete values', function() {
    beforeEach(function() {
      tel('array', []);
      tel('number', 5);
    })
    it('should provide access to values', function() {
      assert.equal(0, tel.array.length);
      tel.array.push(tel.number);
      assert.equal(1, tel.array.length);
      assert.equal(5, tel.array[0]);
    })
    it('tears down on subsequence test runs', function() {
      assert.equal(0, tel.array.length);
      assert.equal(5, tel.number);
    })
  })

  describe('get/set lazy values', function() {
    beforeEach(function() {
      tel('array', function() { return [] });
      tel('number', function() { return 5 });
    })
    it('should provide access to memoised values', function() {
      assert.equal(tel.array.length, 0);
      tel.array.push(tel.number);
      assert.equal(tel.array.length, 1);
      assert.equal(tel.array[0], 5);
    })
    it('tears down on subsequent test runs', function() {
      assert.equal(tel.array.length, 0);
      assert.equal(tel.number, 5);
    })
  })

  describe('dependant values', function() {
    beforeEach(function() {
      tel('array', function() { return [tel.a, tel.b] })
      // Can be concrete
      tel('a', 'foo')
      // Or lazy
      tel('b', function() { return 'bar' })
    })
    it('should resolve dependencies of values', function() {
      assert.deepEqual(tel.array, ['foo', 'bar']);
    })
    it('should be overridable via property', function() {
      tel.a = 'baz';
      assert.deepEqual(tel.array, ['baz', 'bar']);
    })
    it('has no effect if overridden after realised', function() {
      assert.deepEqual(tel.array, ['foo', 'bar']);
      tel.a = 'baz';
      assert.equal(tel.a, 'baz');
      assert.deepEqual(tel.array, ['foo', 'bar']);
    })
    it('tears down on subsequent test runs', function() {
      assert.deepEqual(tel.array, ['foo', 'bar']);
    })
    context('at a later time', function() {
      beforeEach(function() {
        tel('b', function() { return 'baz' })
      })
      it('can override properties', function() {
        assert.deepEqual(tel.array, ['foo', 'baz']);
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
      tel('sql', 'SELECT * FROM nowhere');
      tel('result', function(done) {
        dbquery(tel.sql, done)
      })
    })

    it('should run some SQL', function(done) {
      tel.result(function(err, results) {
        assert.deepEqual(results, ['nowhere']);
        done(err);
      })
    })

    it('should be able to run different SQL', function(done) {
      tel.sql = 'SELECT * FROM somewhere';
      tel.result(function(err, results) {
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

      tel.result(function(err, results, counter) {
        inc(counter)
        tel.result(function(err, results, counter) {
          inc(counter);
        })
        inc('bar');
      })
      inc('foo');
    })
  })
})