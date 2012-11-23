/**
 * Voila Javascript Client API
 * https://github.com/mbst/voila-js
 * Provided by MetaBroadcast
 * v0.2
 *
 * Plugins and licenses.
 * ---------------------
 * jXHR.js (JSON-P XHR)
 * v0.1 © Kyle Simpson
 * MIT License
 */

(function (name, definition) {
	if (typeof module !== 'undefined'){
		module.exports = definition();
	} else if (typeof define === 'function' && typeof define.amd === 'object'){
		define(definition);
	} else {
		this[name] = definition();
	}
})('Voila', function(){
	/*
		Args:
			apiKey: String - voila apikey
			content: String - id or URI of the piece of content
			hoverItems: Array - class / id's for the list of content
			hoverTimeout: Int - milliseconds to wait before the hover event is fired
			host: String - eg. https://voila-stage.metabroadcast.com
			trackingId: String - original tracking id
			version: String - api version
			logging: Bool - whether to enable logging or not,
			userCookieName: String - cookie to look for
		callback: Function - returns object
	*/
	var Voila = function(args, callback){
		var v = this,				// Reference to self
			eles = null,			// Placeholder for page element
			i = 0,					// Placeholder for array length loops
			j = 0,					// Placeholder for array length subloops
			hovering = null,		// Holder for hovering timeout
			hoverTimeout = 250;	// Hover timeout default
		
		if(!args){
			throw new Error('No arguments supplied');
		}

		this.apiKey = null;
		this.version = '1.0';
		this.content = null;
		this.url = 'https://voila.metabroadcast.com';
		this.hoverItems = [];
		this.trackingId = null;
		this.referrer = null;
		this.logging = true;
		this.userCookie = {
			name: false,
			value: false
		};
		this.timeout = 2000;
			
		/**
		 *	Voila parameters
		 */
		 
		// Set apiKey
		if(args && args.apiKey){
			this.apiKey = args.apiKey;
		}
		
		// Set the version to 1.0
		// If another version is supplied overwrite
		if(args && args.version){
			this.version = args.version;
		}

		
		// Set content contentId (0) / contentUri (1)
		if(args && args.content){
			this.content = args.content;
		}
		

		// Set url of host voila
		if(args && args.host){
			if(args && args.host.indexOf('http') === -1){
				this.url = 'https://'+args.host;
			} else {
				this.url = args.host;
			}
		}
		
		// Add tracking id
		if(args && args.trackingId){
			this.parent = args.trackingId;
		}
		
		if(document.referrer){
			this.referrer = document.referrer ;
		}
		
		if(args && typeof args.logging !== 'undefined'){
			this.logging = args.logging;
		}
		
		if(args && args.userCookieName){
			this.userCookie.name = args.userCookieName;
		}
		
		// Ajax timeout
		if(args && args.timeout){
			this.timeout = args.timeout;
		}
	};
	
	Voila.prototype.logLoad = function(callback){
		var v = this,
			ajax = new jXHR(),
			content = null,
			inputs = false,
			url = v.url;

		ajax.timeout = v.timeout;
		ajax.onerror = function(msg,url){
			if(callback){
				callback({error: msg});
			}
		};

		url = url + '/'	+ v.version+'/log?apiKey='+encodeURIComponent(v.apiKey)+'&event=page-load&url='+encodeURIComponent(window.location.href);

		if(v.trackingId){
			url += '&tracking_id=' + encodeURIComponent(v.trackingId);
			//inputs.push({name: 'tracking_id', value: v.trackingId});
		}
		if(v.content){
			if(!inputs){
				inputs = [];
			}
			if(v.content.indexOf('http') !== -1){
				url += '&x-purple-external-uri=' + encodeURIComponent(v.content);
				//inputs.push({name: 'x-purple-external-uri', value: v.content});
			} else {
				url += '&x-purple-id=' + encodeURIComponent(v.content);
				//inputs.push({name: 'x-purple-id', value: v.content});
			}
		}
		
		if(v.referrer){
			url += '&referrer=' + encodeURIComponent(v.referrer);
			//inputs.push({name: 'referrer', value: v.referrer});
		}
		
		url += '&cb='+(new Date().getTime());

		ajax.open("GET",url);
		ajax.send();
	};
	
	return Voila;
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
		
		function throwError(msg) {
			//console.log(msg);
			try { publicAPI.onerror.call(publicAPI,msg,script_url); } catch (err) { throw new Error(msg); }
		}

		function handleScriptLoad() {
			if ((this.readyState && this.readyState!=="complete" && this.readyState!=="loaded") || script_loaded) { return; }
			this.onload = this.onreadystatechange = null; // prevent memory leak
			script_loaded = true;
			if (publicAPI.readyState !== 4 && publicAPI.readyState === 2) {throwError("Script failed to load ["+script_url+"].");}
			removeScript();
		}
		
		function fireReadyStateChange(rs,args) {
			args = args || [];
			publicAPI.readyState = rs;
			if (typeof publicAPI.onreadystatechange === "function") {publicAPI.onreadystatechange.apply(publicAPI,args);}
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
							throwError("Script failed to run ["+script_url+"].");
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
