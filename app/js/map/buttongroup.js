/**
 * 
 */
define(function(require, exports, module) {

	"use strict";
	
	/**
	 * @config container : render to dom
	 * @config btns : Array of { text:'add',event:'add' } 
	 * @config handler : function(event,button){} 
	 * @config context : context of handler function
	 * 
	 */
	
	function handler(button){
		this[button.event](button);
	}
	
	function ButtonGroup(cfg){
		$.extend(this,cfg);
		this.init();
	}
	
	ButtonGroup.prototype.handler = handler;
	
	ButtonGroup.prototype.init = function(){
		this.id = UI.newid('gb');
		var s = ['<div id="',this.id,'" class="kb-group">'],i,btn,btns = this.btns;
		for (i=0;btn=btns[i];i+=1){
			s.push('<a href="javascript:;" class="kb-g-buton" bindex="',i,'" >',btn.text,'</a>');
		}
		s.push('</div>');
		$(s.join('')).appendTo($('#'+this.container)).on('click','.kb-g-buton',this,this._clickHandler);
	};
	
	ButtonGroup.prototype._clickHandler = function(e){
		var me = e.data;
		me.handler.call(me.context,me.btns[this.getAttribute('bindex')]);
	};
	
	ButtonGroup.prototype.showAt = function(x,y){
		$('#'+this.id).show().offset({left:x-40,top:y+20});
		$(document.body).on('mouseup',this,this._hide);
	};
	
	ButtonGroup.prototype._hide = function(e){
		var me = e.data;
		$('#'+me.id).hide();
		$(document.body).off('mouseup',me._hide);
	};
	
	return ButtonGroup;
	
});