var ReadyListener = function(itemLength, fn){
    this.itemLength = itemLength;
    this.haveItems = 0;
    this.fn = fn;
};

ReadyListener.prototype.add = function(name){
    this.haveItems++;
    this.haveAllCheck();
};

ReadyListener.prototype.haveAllCheck = function(){
    if(this.haveItems === this.itemLength){
        this.fn();
    }
};

this.init = {
	'init':function(test){
		test.expect(5);
		
		// No arguments
		test.throws(
			function(){
				new Voila();
			},
			Error,
			'Voila requires arguments work'
		);
		
		// Only API key
		test.doesNotThrow(
			function(){
				new Voila({apiKey: 'testapikey'});
			},
			Error,
			'An API key is the minimum requirement'
		);
		
		// Init with default logging
		test.equal(
			new Voila({apiKey: 'testapikey'}).logging,
			true,
			'Default logging is true'
		);
		
		// Init without logging
		test.equal(
			new Voila({apiKey: 'testapikey', logging: false}).logging,
			false,
			'Setting logging: false should turn off logging'
		);
		
		// Init with logging
		test.equal(
			new Voila({apiKey: 'testapikey', logging: true}).logging,
			true,
			'Setting logging: true should turn logging on'
		);
		
		test.done();
	}	
};

this.pageLoad = {
	'pageLoad':function(test){
		var v = new Voila({apiKey: '577d78df4b0a4788bd406edd300589c9', content: 'http://thespace.org/items/e0000372'}),
			rl = new ReadyListener(3, function(){
				test.done();
			});
		
		test.expect(3);
		
		// If content available
		v.pageLoad(function(e){
			console.log(e);
			test.ok(
				typeof e.success === 'string',
				'Callback should work with content and logging and return a string as the tracking code'
			);
			
			rl.add('this');
		});
		
		// If content available and logging: false
		v.logging = false;
		v.pageLoad(function(e){
			console.log(e);
			test.ok(
				typeof e.success === 'string',
				'Callback should work with content, but without logging'
			);
			
			rl.add('this');
		});
		
		// If content not available
		v.content = null;
		v.logging = true;
		v.pageLoad(function(e){
			console.log(e);
			test.strictEqual(
				e.success,
				null,
				'Callback should work without content, but with logging'
			);
			
			rl.add('this');
		});
		
	}	
};

this.getContent = {
	'getContent':function(test){
		/*
			1. Get content by init contentId
			2. Get content by passing content: argument
			3. Get content using annotation : description
		*/
		var v = new Voila({apiKey: '577d78df4b0a4788bd406edd300589c9', content: 'http://thespace.org/items/e0000372'}),
			rl = new ReadyListener(8, function(){
				test.done();
			});
		
		test.expect(8);
		
		v.getContent(null, function(e){
			console.log(e);
			test.equal(
				e.error,
				null,
				'a. There should be no errors'
			);
			rl.add('1. No errors');
			
			test.equal(
				typeof e.success,
				'object',
				'a. Success should be an object'
			);
			rl.add('1. is object');
		});
		
		v.getContent({content: 'http://thespace.org/items/e0000372'}, function(e){
			console.log(e);
			test.equal(
				e.error,
				null,
				'b. There should be no errors'
			);
			rl.add('2. No errors');
			
			test.equal(
				typeof e.success,
				'object',
				'b. Success should be an object'
			);
			rl.add('2. is object');
		});
		
		v.getContent({annotations: ['description']}, function(e){
			console.log(e);
			test.equal(
				e.error,
				null,
				'c. There should be no errors'
			);
			rl.add('3. No errors');
			
			test.equal(
				typeof e.success,
				'object',
				'c. Success should be an object'
			);
			rl.add('3. is object');
		});
		
		v.getContent({content: 'madeup'}, function(e){
			console.log(e);
			test.equal(
				e.error,
				null,
				'c. There should be no errors'
			);
			rl.add('4. No errors');
			
			test.equal(
				typeof e.success,
				'object',
				'c. Success should be an object'
			);
			rl.add('4. is object');
		});
	}
};

this.getTracking = {
	'getTracking':function(test){
		var v = new Voila({apiKey: '577d78df4b0a4788bd406edd300589c9'}),
			rl = new ReadyListener(4, function(){
				test.done();
			});
			
		test.expect(rl.itemLength);
			
		// With parent
		v.parent = 'h2';
		v.getTracking(function(e){
			console.log(e);
			test.equal(
				e.error,
				null,
				'a. There chould be no errors'
			);
			rl.add('1. No errors');
			
			test.equal(
				typeof e.success,
				'string',
				'a. Success should be a string'
			);
			rl.add('1. is a string');
		});
		
		// Without parent
		v.parent = null;
		v.getTracking(function(e){
			console.log(e);
			test.equal(
				e.error,
				null,
				'b. There chould be no errors'
			);
			rl.add('2. No errors');
			
			test.equal(
				typeof e.success,
				'string',
				'b. Success should be a string'
			);
			rl.add('2. is a string');
		});
		
		setTimeout(function(){
			for(var i = rl.itemLength - rl.haveItems; i--;){
				test.ok(false, 'Timeout');
				rl.add('Timeout');
			}
		}, 10000);
	}
};

this.logLoad = {
	'logLoad':function(test){
		
	}
};

this.logHover = {
	'logHover':function(test){
		
	}
};

this.watching = {
	'watching':function(test){
		
	}
};

this.notWatching = {
	'notWatching':function(test){
		
	}
};

this.cookieOptOut = {
	'cookieOptOut':function(test){
		
	}
};

this.cookieOptIn = {
	'cookieOptIn':function(test){
		
	}
};

this.cookieOptStatus = {
	'cookieOptStatus':function(test){
		
	}
};