/**
 * 
 */
define(function(require, exports, module) {
	'use strict';
	$.renderSvgFragement = function(s){
		return $('<svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg">'+s+'</svg>').children().detach();
	};
});