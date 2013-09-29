tel
====

tel is designed to provide a similar feature to [RSpec][rspec]'s [let function][let] in [mocha][mocha]. For more information on why this is useful, see [this stackoverflow question "When to use RSpec let"][let-on-so]

[rspec]: http://rspec.info
[let]: https://www.relishapp.com/rspec/rspec-core/v/2-11/docs/helper-methods/let-and-let
[mocha]: http://visionmedia.github.io/mocha/
[let-on-so]: http://stackoverflow.com/questions/5359558/when-to-use-rspec-let

[![build status](https://secure.travis-ci.org/glenjamin/tel.png)](http://travis-ci.org/glenjamin/tel)

Install
-------

tel can be used with Node.js and in modern browsers

Install via npm

    npm install tel --save

Or simply copy `tel.js` into the desired location

Usage
-----

```javascript
var Tel = require('tel');
var tel = Tel();

// Set a value
tel('number', 5);
tel('url', 'http://google.com');
tel.also = 'as property';

// Set a lazy value
tel('later', function() {
	return [];
});

// Access values by property
5 === tel.number;

// Refer to other values
tel('added', function() {
	return tel.later.push(tel.number);
});

// Values can also be calculated asynchronously
tel('webpage', function(done) {
	request(tel.url, done);
});

// But make sure you access them asynchronously too
tel.webpage(function(err, response, body) {
	console.log(body);
});
```

Lazy and async values are only ever calculated once per `tel()` instance.

For more examples, see the [unit tests](./test/test.js)

