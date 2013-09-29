lett
====

lett is designed to provide a similar feature to [RSpec][rspec]'s [let function][let] in [mocha][mocha]. For more information on why this is useful, see [this stackoverflow question "When to use RSpec let"][let-on-so]

[rspec]: http://rspec.info
[let]: https://www.relishapp.com/rspec/rspec-core/v/2-11/docs/helper-methods/let-and-let
[mocha]: http://visionmedia.github.io/mocha/
[let-on-so]: http://stackoverflow.com/questions/5359558/when-to-use-rspec-let

Install
-------

Lett can be used with Node.js and in modern browsers

Install via npm

    npm install lett --save

Or simply copy `lett.js` into the desired location

Usage
-----

```javascript
var Lett = require('lett');
var lett = Lett();

// Set a value
lett('number', 5);
lett('url', 'http://google.com');
lett.also = 'as property';

// Set a lazy value
lett('later', function() {
	return [];
});

// Access values by property
5 === lett.number;

// Refer to other values
lett('added', function() {
	return lett.later.push(lett.number);
});

// Values can also be calculated asynchronously
lett('webpage', function(done) {
	request(lett.url, done);
});

// But make sure you access them asynchronously too
lett.webpage(function(err, response, body) {
	console.log(body);
});
```

Lazy and async values are only ever calculated once per `Lett()` instance.

For more examples, see the [unit tests](./test/test.js)

