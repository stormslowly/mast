/**
 * 
 */
define(function(require, exports, module) {

	"use strict";
	
	require('./mouse.js');
	
	function mousemovingHandler(e,status){
		$(this).css({
			left : status.targetpos.left+status.current.x-status.start.x+'px',
			top : status.targetpos.top+status.current.y-status.start.y+'px'
		});
	}
	
	
	/**
	 * extend to jQuery
	 */
	$.fn.moveable = function(){
		this.spymousemove();
		this.on('mousemoving',mousemovingHandler);
		return this;
	};
	
	$.fn.unMoveable = function(){
		this.spymousemove(true);
		this.off('mousemoving',mousemovingHandler);
		return this;
	};
	
});