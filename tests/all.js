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
				e.success,
				'Callback should work'
			);
			
			rl.add('this');
		});
		
		// If content available and logging: false
		v.logging = false;
		v.pageLoad(function(e){
			console.log(e);
			test.ok(
				e.success,
				'Callback should work'
			);
			
			rl.add('this');
		});
		
		// If content not available
		v.content = null;
		v.logging = true;
		v.pageLoad(function(e){
			console.log(e);
			test.ok(
				e.success,
				'Callback should work'
			);
			
			rl.add('this');
		});
		
	}	
};