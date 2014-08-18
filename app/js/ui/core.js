/**
 * 
 */
define(function(require, exports, module) {
	
	Array.prototype.indexOf = Array.prototype.indexOf || function(item){
		var i,len;
		for (i=arguments[1]||0,len=this.length;i<len;i+=1){
			if (item === this[i]){
				return i;
			}
		}
		return -1;
	};
	
	Array.prototype.lastIndexOf = Array.prototype.lastIndexOf || function(item){
		var i;
		for (i=arguments[1]||this.length-1;i>-1;i-=1){
			if (item === this[i]){
				return i;
			}
		}
		return -1;
	};
	
	var splice = Array.prototype.splice;
	Array.prototype.remove = Array.prototype.remove || function(item){
		var i;
		for (i=this.length-1;i>-1;i-=1){
			if (this[i]===item){
				splice.call(this,i,1);
			}
		}
		return this;
	};
	
	var index = 1;
	function newid(pre){
		return (pre?pre:'ui')+(index+=1);
	}
	
	function getField(object, path) {
		if (!object||!path){
			return object;
		}
		path = path.replace(/\[/g,".").replace(/\]/g,"");
		var fields = path.split("."),i,field;
		for (i = 0; i < fields.length; i+=1) {
			field = fields[i];
			if (typeof(object[field]) != "undefined") {
				object = object[field];
			} else {
				return ;
			}
		}
		return object;
	}

	function setField(object,path,value){
		if (!object||!path)
			return ;
		var fields = path.split("."),obj = object,i;
		for (i=0;i<fields.length-1;i+=1){
			if (typeof obj[fields[i]] === "undefined"){
				obj[fields[i]] = {};
			}
			obj = obj[fields[i]];
		}
		obj[fields[fields.length-1]] = value;
	}

	function deleteField(object,path){
		if (!object||!path)
			return ;
		var fields = path.split("."),obj = object,i;
		for (i=0;i<fields.length-1;i+=1){
			var field = obj[fields[i]];
			if (field === undefined){
				obj[fields[i]] = {};
				field = obj[fields[i]];
			}
			obj = field;
		}
		delete obj[fields[fields.length-1]] ;
	}
	
	var data2Cache = {};
	function data2(namespace,key,data){
		if (key === undefined){
			return;
		} else if (data === undefined){
			return data2Cache[namespace] && data2Cache[namespace][key];
		} else {
			(data2Cache[namespace] || (data2Cache[namespace] = {}))[key] = data;
		}
	}
	
	function clearData2(namespace){
		delete data2Cache[namespace];
	}
	
	$.fn.data2 = function(key,data){
		if (this.length>0){
			var namespace = this[0].id || (this[0].id = newid());
			if (data === undefined){
				return data2(this[0].id,key,data);
			} else {
				data2(this[0].id,key,data);
				return this;
			}
		}
	};
	
	function parseCircle(data,oriData){
		oriData = oriData || data;
		// {$ref:$.data[0]}
		var key,value;
		for (key in data){
			value = data[key];
			if (value && value.$ref){
				data[key] = UI.getField(oriData,value.$ref.substring(2));
			} else if (typeof value === 'object') {
				parseCircle(value,oriData);
			}
		}
	}
	
	function extend(clazz,superclazz){
		function P(){}
		P.prototype = superclazz.prototype;
		(clazz.prototype = new P()).constructor = clazz;
		P = null;
		clazz = null;
		superclazz = null;
	}
	
	/*
	  y 年
	  M 月
	  d 日
	  h 时 在一天中 (0~23)
	  m 分
	  s 秒
	  S 毫秒
	*/
	var format = function(date,pattern){
		var temp = {
			y : date.getFullYear(),
			M : date.getMonth()+1,
			d : date.getDate(),
			h : date.getHours(),
			m : date.getMinutes(),
			s : date.getSeconds(),
			S : date.getMilliseconds()
		};
		return pattern.replace(/[yMdhmsS]/g,function(m){
			var v = temp[m];
			var r = v;
			if (v<10){
				r = '0' + r;
			}
			if (m==='S' && v<100){
				r = '0' + r;
			}
			return r;
		});
	};
	
	var datereg = /^(\d+)-(\d+)-(\d+)/;
	var parse = function(s){
		if (datereg.test(s)){
			return new Date(s.replace(/-/g,'/'));
		}
	};
	
	
	/**
	 * 一次注册多个jquery事件
	 * {
	 * 	e:
	 * 	s:
	 * 	data:
	 * 	h:
	 * }
	 */
	$.fn.on2 = function(events){
		var i,event;
		for (i=0;event=events[i];i+=1){
			if (event.s){
				this.on(event.e,event.s,event.data,event.h);
			} else {
				this.on(event.e,event.data,event.h);
			}
		}
		return this;
	};
	
	/**
	 * 一次取消多个jquery事件
	 */
	$.fn.off2 = function(events){
		var i,event;
		for (i=0;event=events[i];i+=1){
			if (event.s){
				this.off(event.e,event.s,event.h);
			} else {
				this.off(event.e,event.h);
			}
		}
		return this;
	};
	
	/**
	 * export
	 */
	var UI = window.UI = {};
	UI.newid = newid;
	UI.getField = getField;
	UI.setField = setField;
	UI.deleteField = deleteField;
	
	UI.data2 = data2;
	UI.clearData2 = clearData2;
	
	UI.parseCircle = parseCircle;
	
	UI.extend = extend;
	
	UI.Date = {
			parse : parse ,
			format : function(date){
				return format(date,'y-M-d');
			},
			msformat : function(t){
				if (!t){
					return '';
				} else {
					var date = new Date();
					date.setTime(t);
					return format(date,'y-M-d');
				}
			},
			pmsformat : function(t,p){
				if (!t){
					return '';
				} else {
					var date = new Date();
					date.setTime(t);
					return format(date,p);
				}
			},
			pformat : format
		};
	
});