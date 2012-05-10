(function(name, definition){
	if (typeof module != 'undefined') module.exports = definition()
	else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
	else this[name] = definition()
})('Voila', function(){
	/*
		Args:
			apiKey: voila apikey
			contentId: id of the piece of content
			hoverItems: class / id's for the list of content
			host: eg. https://voila-stage.metabroadcast.com
			trackingId: original tracking id
	*/
	var Voila = function(args){
		var v = this;
		var vers = '1.0';
		if(args.version){
			var vers = args.version;
		}
		this.version = vers;
		this.apiKey = null;
		if(args.apiKey){
			this.apiKey = args.apiKey;
		}
		
		this.contentId = args.contentId;

		this.url = 'https://voila.metabroadcast.com';
		if(args.host){
			this.url = 'https://'+args.host;
		}
		this.hoverItems = [];
		if(args.hoverItems){
			for(var i = 0, ii = args.hoverItems.length; i<ii; i++){
				var eles = qwery(args.hoverItems[i]);
				for(var j = 0, jj = eles.length; j<jj; j++){
					this.hoverItems.push(eles[j]);
					try {
					  this.hoverItems[this.hoverItems.length-1].addEventListener('mouseover', mouseOver);
					  this.hoverItems[this.hoverItems.length-1].addEventListener('mouseout', mouseOut);
					} catch(e) {
					  this.hoverItems[this.hoverItems.length-1].attachEvent('mouseover', mouseOver);
					  this.hoverItems[this.hoverItems.length-1].attachEvent('mouseout', mouseOut);
					}
				}
			}
		}
		
		this.trackingId = null;
		if(args.trackingId){
			this.parent = args.trackingId;
		}
		
		var hovering = null;
		function mouseOver(e){
			hovering = setTimeout(function(){
				var contentId = null;
				var attributes = e.target.attributes;
				for(var i = 0, ii = attributes.length; i<ii; i++){
					if(attributes[i].nodeName === 'data-contentid'){
						contentId = attributes[i].nodeValue;
					}
				}
				v.logHover(contentId, function(error, success){
					if(error){
						//console.log(error);
					} else {
						//console.log(success);
					}
				});
			}, 250);
		}
		
		function mouseOut(){
			clearTimeout(hovering);
		}
		
		this.createIframe();
	}
	
	Voila.prototype.pageLoad = function(callback){
		var v = this;
		v.getTracking(function(error, success){
			if(error){
				//console.log(error);
			} else {
				//console.log('done');
				callback(null, success);
				v.logLoad();
			}
		});
	}
	
	Voila.prototype.createIframe = function(){
		if(qwery('#voilaframe').length !== 0){
			this.deleteIframe();
		}
		var frame = document.createElement('iframe');
		frame.setAttribute('id','voilaframe');
		frame.style.width = 0;
		frame.style.height = 0;
		frame.style.visibility='hidden';
		frame.style.borderWidth=0;
		frame.style.position='absolute';
		frame.style.left=-9999+'px';
		frame.style.top=-9999+'px';
		document.body.appendChild(frame);
	}
	
	Voila.prototype.deleteIframe = function(){
		document.body.removeChild(qwery('#voilaframe')[0]);
	}
	
	Voila.prototype.createForm = function(url, id, inputs){
		var v = this;
		var form = document.createElement('form');
		form.setAttribute('id', id);
		form.setAttribute('target', 'voilaframe');
		form.setAttribute('method', 'POST');
		form.setAttribute('action', url);
		form.style.width = 0;
		form.style.height = 0;
		form.style.visibility='hidden';
		form.style.borderWidth=0;
		form.style.position='absolute';
		form.style.left=-9999+'px';
		form.style.top=-9999+'px';
		
		if(inputs){
			for(var i = 0, ii = inputs.length; i<ii; i++){
				form.appendChild(v.createInput(inputs[i]));
			}
		}
		return form;
	}
	
	Voila.prototype.deleteForm = function(id){
		document.body.removeChild(qwery('#'+id)[0]);
	}
	
	/*
		Args:
			name
			value
	*/
	Voila.prototype.createInput = function(args){
		var input = document.createElement('input');
		input.setAttribute('type','hidden');
		input.setAttribute('name', args.name);
		input.setAttribute('value', args.value);
		return input;
	}
	
	Voila.prototype.setContentId = function(id){
		this.contentId = id;
	}
	
	Voila.prototype.getContent = function(callback, contentId, annotations){
		var v = this;
		
		var content = v.contentId;
		if(contentId){
			content = contentId;
		}
		
		var annotate = null;
		if(annotations){
			annotate = annotations.join(',');
		}
		
		var ajax = new jXHR();
		ajax.onerrer = function(msg,url){
			callback(msg);
		}
		
		ajax.onreadystatechange = function(data){
			if(ajax.readyState === 4){
				if(data.content){
					callback(null, data.content);
				}
			}
		}
		var url = v.url+'/'+v.version+'/content?apiKey='+v.apiKey+'&id='+content;
		if(annotate){
			url += '&annotations='+annotate;
		}
		url += '&callback=?';
		ajax.open("GET",url);
		ajax.send();
	}
	
	Voila.prototype.getTracking = function(callback){
		var v = this;
		var ajax = new jXHR();
		ajax.onerrer = function(msg,url){
			callback(msg);
		}
		
		ajax.onreadystatechange = function(data){
			if(ajax.readyState === 2 && ajax.status !== 200){
				callback(ajax);
			}
			if(ajax.readyState === 4){
				if(data.tracking_id){
					v.trackingId = data.tracking_id;
					callback(null, data.tracking_id);
					return;
				}
				callback('error');
			}
		}
		var url = v.url+'/'+v.version+'/tracking?apiKey='+v.apiKey+'&contentId='+v.contentId;
		if(v.parent){
			url += '&parentTrackingId='+v.parent;
		}
		url += '&callback=?';
		ajax.open("GET",url);
		ajax.send();
	}
	
	Voila.prototype.logLoad = function(callback){
		var v = this;
		var inputs = null;
		if(v.trackingId){
			inputs = [{name: 'tracking_id', value: v.trackingId}];
		}
		if(v.contentId){
			if(!inputs){
				inputs = [];
			}
			inputs.push({name: 'x-purple-id', value: v.contentId});
		}
		var form = v.createForm(v.url+'/'+v.version+'/log?apiKey='+v.apiKey+'&event=page-load', 'voila-pageLog', inputs);
		try {
		  form.addEventListener("submit", formSubmit);
		} catch(e) {
		  form.attachEvent("submit", formSubmit); //Internet Explorer
		}
		form.submit();
	}
	
	Voila.prototype.logHover = function(callback, contentId){
		var v = this;
		var inputs = null;
		if(v.trackingId){
			inputs = [{name: 'tracking_id', value: v.trackingId}];
		}
		if(!contentId){
			if(v.contentId){
				if(!inputs){
					inputs = [];
				}
				inputs.push({name: 'x-purple-id', value: v.contentId});
			}
		} else {
			if(!inputs){
				inputs = [];
			}
			inputs.push({name: 'x-purple-id', value: contentId});
		}
		var form = v.createForm(v.url+'/'+v.version+'/log?apiKey='+v.apiKey+'&event=tv-listings-hover', 'voila-itemLog', inputs);
		try {
		  form.addEventListener("submit", formSubmit);
		} catch(e) {
		  form.attachEvent("submit", formSubmit); //Internet Explorer
		}
		form.submit();
	}
	
	Voila.prototype.watching = function(contentId){
		var v = this;
		if(v.contentId){
			inputs = [{name: 'id', value: v.contentId}];
		}
		if(contentId){
			inputs = [{name: 'id', value: contentId}];
		}
		var form = v.createForm(v.url+'/'+v.version+'/watching/me/@self?apiKey='+config.apiKey, 'voila-watching', inputs);
		try {
		  form.addEventListener("submit", formSubmit);
		} catch(e) {
		  form.attachEvent("submit", formSubmit); //Internet Explorer
		}
		form.submit();
	}
	
	Voila.prototype.notWatching = function(contentId){
		var v = this;
		var inputs = [{name: 'http_action', value: 'DELETE'}];
		var content = null;
		if(v.contentId){
			content = v.contentId;
		}
		if(contentId){
			content = contentId;
		}
		var form = v.createForm(v.url+'/'+v.version+'/watching/me/@self/contentId:'+config.contentId+'?apiKey='+config.apiKey, 'voila-watching', inputs);
		try {
		  form.addEventListener("submit", formSubmit);
		} catch(e) {
		  form.attachEvent("submit", formSubmit); //Internet Explorer
		}
		form.submit();
	}
	
	Voila.prototype.currentlyWatching = function(callback, contentId){
		var v = this;
		
		var content = null;
		if(v.contentId){
			content = v.contentId;
		}
		if(contentId){
			content = contentId;
		}
		
		if(!content){
			callback('Not watching');
			return;
		}
		
		var ajax = new jXHR();
		ajax.onerrer = function(msg,url){
			callback(msg);
		}

		ajax.onreadystatechange = function(data){
			if(ajax.readyState === 4){
				if(data.watching && data.watching.length > 0){
					var watching = false;
					for(var i = 0, ii = data.watching.length; i<ii; i++){
						if(data.watching[i].target.id.value === content){
							watching = true;
							break;
						}
					}
					callback(null, watching);
				}
			}
		}
		
		var url = v.url+'/'+v.version+'/watching/me/@self?apiKey='+v.apiKey+'&callback=?';
		ajax.open("GET",url);
		ajax.send();
	}
	
	Voila.prototype.cookieOptOut = function(){
		var exDate = new Date();
	}
	
	Voila.prototype.cookieOptIn = function(){
	
	}
	
	Voila.prototype.cookieStatus = function(){
		if(getCookie('purple')){
			return true;
		}
		return false;
	}
	
	var getCookie = function(c_name){
		var i,x,y,ARRcookies=document.cookie.split(";"),noCookies=ARRcookies.length;
		for(i=noCookies;i--;) {
			x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
			y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
			x=x.replace(/^\s+|\s+$/g,"");
			if(x==c_name) {
				return unescape(y);
				break;
			}
		}
		
		return false;
	};
	
	var formSubmit = function(callback){
		//console.log('submitted');
		var myIFrame = document.getElementById('voilaframe');
		if(myIFrame && myIFrame.contentWindow && myIFrame.contentWindow.document && myIFrame.contentWindow.document.body){
			var content = myIFrame.contentWindow.document.body.innerHTML;
			callback(null, content);
		}
		v.createIframe();
	};
	
	
	/*!
	 * contentloaded.js
	 *
	 * Author: Diego Perini (diego.perini at gmail.com)
	 * Summary: cross-browser wrapper for DOMContentLoaded
	 * Updated: 20101020
	 * License: MIT
	 * Version: 1.2
	 *
	 * URL:
	 * http://javascript.nwbox.com/ContentLoaded/
	 * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
	 *
	 */
	
	// @win window reference
	// @fn function reference
	function contentLoaded(win, fn) {
	
		var done = false, top = true,
	
		doc = win.document, root = doc.documentElement,
	
		add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
		rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
		pre = doc.addEventListener ? '' : 'on',
	
		init = function(e) {
			if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
			(e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
			if (!done && (done = true)) fn.call(win, e.type || e);
		},
	
		poll = function() {
			try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
			init('poll');
		};
	
		if (doc.readyState == 'complete') fn.call(win, true);
		else {
			if (doc.createEventObject && root.doScroll) {
				try { top = !win.frameElement; } catch(e) { }
				if (top) poll();
			}
			doc[add](pre + 'DOMContentLoaded', init, false);
			doc[add](pre + 'readystatechange', init, false);
			win[add](pre + 'load', init, false);
		}
	
	}
	
	
	return Voila;
});

/*!
  * Qwery - A Blazing Fast query selector engine
  * https://github.com/ded/qwery
  * copyright Dustin Diaz & Jacob Thornton 2011
  * MIT License
  */

(function (name, definition) {
  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()
})('qwery', function () {
  var doc = document
    , html = doc.documentElement
    , byClass = 'getElementsByClassName'
    , byTag = 'getElementsByTagName'
    , qSA = 'querySelectorAll'
    , useNativeQSA = 'useNativeQSA'
    , tagName = 'tagName'
    , nodeType = 'nodeType'
    , select // main select() method, assign later

    // OOOOOOOOOOOOH HERE COME THE ESSSXXSSPRESSSIONSSSSSSSS!!!!!
    , id = /#([\w\-]+)/
    , clas = /\.[\w\-]+/g
    , idOnly = /^#([\w\-]+)$/
    , classOnly = /^\.([\w\-]+)$/
    , tagOnly = /^([\w\-]+)$/
    , tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/
    , splittable = /(^|,)\s*[>~+]/
    , normalizr = /^\s+|\s*([,\s\+\~>]|$)\s*/g
    , splitters = /[\s\>\+\~]/
    , splittersMore = /(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/
    , specialChars = /([.*+?\^=!:${}()|\[\]\/\\])/g
    , simple = /^(\*|[a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/
    , attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/
    , pseudo = /:([\w\-]+)(\(['"]?([^()]+)['"]?\))?/
    , easy = new RegExp(idOnly.source + '|' + tagOnly.source + '|' + classOnly.source)
    , dividers = new RegExp('(' + splitters.source + ')' + splittersMore.source, 'g')
    , tokenizr = new RegExp(splitters.source + splittersMore.source)
    , chunker = new RegExp(simple.source + '(' + attr.source + ')?' + '(' + pseudo.source + ')?')
    , walker = {
        ' ': function (node) {
          return node && node !== html && node.parentNode
        }
      , '>': function (node, contestant) {
          return node && node.parentNode == contestant.parentNode && node.parentNode
        }
      , '~': function (node) {
          return node && node.previousSibling
        }
      , '+': function (node, contestant, p1, p2) {
          if (!node) return false
          return (p1 = previous(node)) && (p2 = previous(contestant)) && p1 == p2 && p1
        }
      }

  function cache() {
    this.c = {}
  }
  cache.prototype = {
    g: function (k) {
      return this.c[k] || undefined
    }
  , s: function (k, v, r) {
      v = r ? new RegExp(v) : v
      return (this.c[k] = v)
    }
  }

  var classCache = new cache()
    , cleanCache = new cache()
    , attrCache = new cache()
    , tokenCache = new cache()

  function classRegex(c) {
    return classCache.g(c) || classCache.s(c, '(^|\\s+)' + c + '(\\s+|$)', 1)
  }

  // not quite as fast as inline loops in older browsers so don't use liberally
  function each(a, fn) {
    var i = 0, l = a.length
    for (; i < l; i++) fn(a[i])
  }

  function flatten(ar) {
    for (var r = [], i = 0, l = ar.length; i < l; ++i) arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i])
    return r
  }

  function arrayify(ar) {
    var i = 0, l = ar.length, r = []
    for (; i < l; i++) r[i] = ar[i]
    return r
  }

  function previous(n) {
    while (n = n.previousSibling) if (n[nodeType] == 1) break;
    return n
  }

  function q(query) {
    return query.match(chunker)
  }

  // called using `this` as element and arguments from regex group results.
  // given => div.hello[title="world"]:foo('bar')
  // div.hello[title="world"]:foo('bar'), div, .hello, [title="world"], title, =, world, :foo('bar'), foo, ('bar'), bar]
  function interpret(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value, wholePseudo, pseudo, wholePseudoVal, pseudoVal) {
    var i, m, k, o, classes
    if (this[nodeType] !== 1) return false
    if (tag && tag !== '*' && this[tagName] && this[tagName].toLowerCase() !== tag) return false
    if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) return false
    if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
      for (i = classes.length; i--;) if (!classRegex(classes[i].slice(1)).test(this.className)) return false
    }
    if (pseudo && qwery.pseudos[pseudo] && !qwery.pseudos[pseudo](this, pseudoVal)) return false
    if (wholeAttribute && !value) { // select is just for existance of attrib
      o = this.attributes
      for (k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) {
          return this
        }
      }
    }
    if (wholeAttribute && !checkAttr(qualifier, getAttr(this, attribute) || '', value)) {
      // select is for attrib equality
      return false
    }
    return this
  }

  function clean(s) {
    return cleanCache.g(s) || cleanCache.s(s, s.replace(specialChars, '\\$1'))
  }

  function checkAttr(qualify, actual, val) {
    switch (qualify) {
    case '=':
      return actual == val
    case '^=':
      return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, '^' + clean(val), 1))
    case '$=':
      return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, clean(val) + '$', 1))
    case '*=':
      return actual.match(attrCache.g(val) || attrCache.s(val, clean(val), 1))
    case '~=':
      return actual.match(attrCache.g('~=' + val) || attrCache.s('~=' + val, '(?:^|\\s+)' + clean(val) + '(?:\\s+|$)', 1))
    case '|=':
      return actual.match(attrCache.g('|=' + val) || attrCache.s('|=' + val, '^' + clean(val) + '(-|$)', 1))
    }
    return 0
  }

  // given a selector, first check for simple cases then collect all base candidate matches and filter
  function _qwery(selector, _root) {
    var r = [], ret = [], i, l, m, token, tag, els, intr, item, root = _root
      , tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
      , dividedTokens = selector.match(dividers)

    if (!tokens.length) return r

    token = (tokens = tokens.slice(0)).pop() // copy cached tokens, take the last one
    if (tokens.length && (m = tokens[tokens.length - 1].match(idOnly))) root = byId(_root, m[1])
    if (!root) return r

    intr = q(token)
    // collect base candidates to filter
    els = root !== _root && root[nodeType] !== 9 && dividedTokens && /^[+~]$/.test(dividedTokens[dividedTokens.length - 1]) ?
      function (r) {
        while (root = root.nextSibling) {
          root[nodeType] == 1 && (intr[1] ? intr[1] == root[tagName].toLowerCase() : 1) && (r[r.length] = root)
        }
        return r
      }([]) :
      root[byTag](intr[1] || '*')
    // filter elements according to the right-most part of the selector
    for (i = 0, l = els.length; i < l; i++) {
      if (item = interpret.apply(els[i], intr)) r[r.length] = item
    }
    if (!tokens.length) return r

    // filter further according to the rest of the selector (the left side)
    each(r, function(e) { if (ancestorMatch(e, tokens, dividedTokens)) ret[ret.length] = e })
    return ret
  }

  // compare element to a selector
  function is(el, selector, root) {
    if (isNode(selector)) return el == selector
    if (arrayLike(selector)) return !!~flatten(selector).indexOf(el) // if selector is an array, is el a member?

    var selectors = selector.split(','), tokens, dividedTokens
    while (selector = selectors.pop()) {
      tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
      dividedTokens = selector.match(dividers)
      tokens = tokens.slice(0) // copy array
      if (interpret.apply(el, q(tokens.pop())) && (!tokens.length || ancestorMatch(el, tokens, dividedTokens, root))) {
        return true
      }
    }
    return false
  }

  // given elements matching the right-most part of a selector, filter out any that don't match the rest
  function ancestorMatch(el, tokens, dividedTokens, root) {
    var cand
    // recursively work backwards through the tokens and up the dom, covering all options
    function crawl(e, i, p) {
      while (p = walker[dividedTokens[i]](p, e)) {
        if (isNode(p) && (interpret.apply(p, q(tokens[i])))) {
          if (i) {
            if (cand = crawl(p, i - 1, p)) return cand
          } else return p
        }
      }
    }
    return (cand = crawl(el, tokens.length - 1, el)) && (!root || isAncestor(cand, root))
  }

  function isNode(el, t) {
    return el && typeof el === 'object' && (t = el[nodeType]) && (t == 1 || t == 9)
  }

  function uniq(ar) {
    var a = [], i, j
    o: for (i = 0; i < ar.length; ++i) {
      for (j = 0; j < a.length; ++j) if (a[j] == ar[i]) continue o
      a[a.length] = ar[i]
    }
    return a
  }

  function arrayLike(o) {
    return (typeof o === 'object' && isFinite(o.length))
  }

  function normalizeRoot(root) {
    if (!root) return doc
    if (typeof root == 'string') return qwery(root)[0]
    if (!root[nodeType] && arrayLike(root)) return root[0]
    return root
  }

  function byId(root, id, el) {
    // if doc, query on it, else query the parent doc or if a detached fragment rewrite the query and run on the fragment
    return root[nodeType] === 9 ? root.getElementById(id) :
      root.ownerDocument &&
        (((el = root.ownerDocument.getElementById(id)) && isAncestor(el, root) && el) ||
          (!isAncestor(root, root.ownerDocument) && select('[id="' + id + '"]', root)[0]))
  }

  function qwery(selector, _root) {
    var m, el, root = normalizeRoot(_root)

    // easy, fast cases that we can dispatch with simple DOM calls
    if (!root || !selector) return []
    if (selector === window || isNode(selector)) {
      return !_root || (selector !== window && isNode(root) && isAncestor(selector, root)) ? [selector] : []
    }
    if (selector && arrayLike(selector)) return flatten(selector)
    if (m = selector.match(easy)) {
      if (m[1]) return (el = byId(root, m[1])) ? [el] : []
      if (m[2]) return arrayify(root[byTag](m[2]))
      if (hasByClass && m[3]) return arrayify(root[byClass](m[3]))
    }

    return select(selector, root)
  }

  // where the root is not document and a relationship selector is first we have to
  // do some awkward adjustments to get it to work, even with qSA
  function collectSelector(root, collector) {
    return function(s) {
      var oid, nid
      if (splittable.test(s)) {
        if (root[nodeType] !== 9) {
         // make sure the el has an id, rewrite the query, set root to doc and run it
         if (!(nid = oid = root.getAttribute('id'))) root.setAttribute('id', nid = '__qwerymeupscotty')
         s = '[id="' + nid + '"]' + s // avoid byId and allow us to match context element
         collector(root.parentNode || root, s, true)
         oid || root.removeAttribute('id')
        }
        return;
      }
      s.length && collector(root, s, false)
    }
  }

  var isAncestor = 'compareDocumentPosition' in html ?
    function (element, container) {
      return (container.compareDocumentPosition(element) & 16) == 16
    } : 'contains' in html ?
    function (element, container) {
      container = container[nodeType] === 9 || container == window ? html : container
      return container !== element && container.contains(element)
    } :
    function (element, container) {
      while (element = element.parentNode) if (element === container) return 1
      return 0
    }
  , getAttr = function() {
      // detect buggy IE src/href getAttribute() call
      var e = doc.createElement('p')
      return ((e.innerHTML = '<a href="#x">x</a>') && e.firstChild.getAttribute('href') != '#x') ?
        function(e, a) {
          return a === 'class' ? e.className : (a === 'href' || a === 'src') ?
            e.getAttribute(a, 2) : e.getAttribute(a)
        } :
        function(e, a) { return e.getAttribute(a) }
   }()
  , hasByClass = !!doc[byClass]
    // has native qSA support
  , hasQSA = doc.querySelector && doc[qSA]
    // use native qSA
  , selectQSA = function (selector, root) {
      var result = [], ss, e
      try {
        if (root[nodeType] === 9 || !splittable.test(selector)) {
          // most work is done right here, defer to qSA
          return arrayify(root[qSA](selector))
        }
        // special case where we need the services of `collectSelector()`
        each(ss = selector.split(','), collectSelector(root, function(ctx, s) {
          e = ctx[qSA](s)
          if (e.length == 1) result[result.length] = e.item(0)
          else if (e.length) result = result.concat(arrayify(e))
        }))
        return ss.length > 1 && result.length > 1 ? uniq(result) : result
      } catch(ex) { }
      return selectNonNative(selector, root)
    }
    // no native selector support
  , selectNonNative = function (selector, root) {
      var result = [], items, m, i, l, r, ss
      selector = selector.replace(normalizr, '$1')
      if (m = selector.match(tagAndOrClass)) {
        r = classRegex(m[2])
        items = root[byTag](m[1] || '*')
        for (i = 0, l = items.length; i < l; i++) {
          if (r.test(items[i].className)) result[result.length] = items[i]
        }
        return result
      }
      // more complex selector, get `_qwery()` to do the work for us
      each(ss = selector.split(','), collectSelector(root, function(ctx, s, rewrite) {
        r = _qwery(s, ctx)
        for (i = 0, l = r.length; i < l; i++) {
          if (ctx[nodeType] === 9 || rewrite || isAncestor(r[i], root)) result[result.length] = r[i]
        }
      }))
      return ss.length > 1 && result.length > 1 ? uniq(result) : result
    }
  , configure = function (options) {
      // configNativeQSA: use fully-internal selector or native qSA where present
      if (typeof options[useNativeQSA] !== 'undefined')
        select = !options[useNativeQSA] ? selectNonNative : hasQSA ? selectQSA : selectNonNative
    }

  configure({ useNativeQSA: true })

  qwery.configure = configure
  qwery.uniq = uniq
  qwery.is = is
  qwery.pseudos = {}

  return qwery
});

// jXHR.js (JSON-P XHR)
// v0.1 © Kyle Simpson
// MIT License

(function(global){
	var SETTIMEOUT = global.setTimeout, // for better compression
		doc = global.document,
		callback_counter = 0;
		
	global.jXHR = function() {
		var script_url,
			script_loaded,
			jsonp_callback,
			scriptElem,
			publicAPI = null;
			
		function removeScript() { try { scriptElem.parentNode.removeChild(scriptElem); } catch (err) { } }
			
		function reset() {
			script_loaded = false;
			script_url = "";
			removeScript();
			scriptElem = null;
			fireReadyStateChange(0);
		}
		
		function ThrowError(msg) {
			try { publicAPI.onerror.call(publicAPI,msg,script_url); } catch (err) { throw new Error(msg); }
		}

		function handleScriptLoad() {
			if ((this.readyState && this.readyState!=="complete" && this.readyState!=="loaded") || script_loaded) { return; }
			this.onload = this.onreadystatechange = null; // prevent memory leak
			script_loaded = true;
			if (publicAPI.readyState !== 4) ThrowError("Script failed to load ["+script_url+"].");
			removeScript();
		}
		
		function fireReadyStateChange(rs,args) {
			args = args || [];
			publicAPI.readyState = rs;
			if (typeof publicAPI.onreadystatechange === "function") publicAPI.onreadystatechange.apply(publicAPI,args);
		}
				
		publicAPI = {
			onerror:null,
			onreadystatechange:null,
			readyState:0,
			open:function(method,url){
				reset();
				internal_callback = "cb"+(callback_counter++);
				(function(icb){
					global.jXHR[icb] = function() {
						try { fireReadyStateChange.call(publicAPI,4,arguments); } 
						catch(err) { 
							publicAPI.readyState = -1;
							ThrowError("Script failed to run ["+script_url+"]."); 
						}
						global.jXHR[icb] = null;
					};
				})(internal_callback);
				script_url = url.replace(/=\?/,"=jXHR."+internal_callback);
				fireReadyStateChange(1);
			},
			send:function(){
				SETTIMEOUT(function(){
					scriptElem = doc.createElement("script");
					scriptElem.setAttribute("type","text/javascript");
					scriptElem.onload = scriptElem.onreadystatechange = function(){handleScriptLoad.call(scriptElem);};
					scriptElem.setAttribute("src",script_url);
					doc.getElementsByTagName("head")[0].appendChild(scriptElem);
				},0);
				fireReadyStateChange(2);
			},
			setRequestHeader:function(){}, // noop
			getResponseHeader:function(){return "";}, // basically noop
			getAllResponseHeaders:function(){return [];} // ditto
		};

		reset();
		
		return publicAPI;
	};
})(window);