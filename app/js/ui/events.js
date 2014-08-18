/**
 *
 */
define(function(require, exports, module) {
	'use strict';
	require('js/ui/core.js');

	var slice = Array.prototype.slice;

	/**
	 * @config handler
	 * @config context
	 * @config name 事件类型
	 *
	 */
	function Event(cfg){
		$.extend(this,cfg);
	}

	function Events(){

	}

	Events.prototype.on = function(event){
		var _events = (this._events = this._events || {}),
			events = (_events[event.name] = _events[event.name] || []);
		if (!event instanceof Event){
			event = new Event(event);
		}
		if (events.indexOf(event)===-1){
			events.push(event);
		}
		return this;
	};

	Events.prototype.on2 = function(events){
		var i,event;
		for (i=0;event = events[i];i+=1){
			events[i] = this.on(event);
		}
		return this;
	};

	Events.prototype.off = function(event){
		var _events = (this._events = this._events || {}),
			events = (_events[event.name] = _events[event.name] || []);
		events.remove(event);
		return this;
	};

	Events.prototype.off2 = function(events){
		var i,event;
		for (i=0;event = events[i];i+=1){
			this.off(event);
		}
		return this;
	};

	Events.prototype.trigger = function(name){
		var args = slice.call(arguments,1),
			_events = (this._events = this._events || {}),
			events = (_events[name] = _events[name]),
			i,event;
		if (!events){
			return true;
		}
		switch (args.length) {
	        case 0:
	        	for (i=0;event=events[i];i+=1){
	        		if (event.handler.call(event.context||this) === false){
	        			return false;
	        		}
	        	}
	        	break;
	        case 1:
	        	for (i=0;event=events[i];i+=1){
	        		if (event.handler.call(event.context||this,args[0]) === false){
	        			return false;
	        		}
	        	}
	        	break;
	        case 2:
	        	for (i=0;event=events[i];i+=1){
	        		if (event.handler.call(event.context||this,args[0],args[1]) === false){
	        			return false;
	        		}
	        	}
	        	break;
	        case 3:
	        	for (i=0;event=events[i];i+=1){
	        		if (event.handler.call(event.context||this,args[0],args[1],args[2]) === false){
	        			return false;
	        		}
	        	}
	        	break;
	        default:
	        	for (i=0;event=events[i];i+=1){
	        		if (event.handler.apply(event.context||this,args) === false){
	        			return false;
	        		}
	        	}
	        	break;
		}
		return true;
	};

	/**
	 * export
	 */
	UI.Events = Events;
	UI.Event = Event;

});