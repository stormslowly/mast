/**
 * 
 */
define(function(require, exports, module) {

	'use strict';
	require('./core.js');
	
	var indexCache = [200];
	var modalIndexCache = [];
	function getIndex(modal){
		var result = indexCache[indexCache.length-1]+1;
		indexCache.push(result);
		if (modal){
			modalIndexCache.push(result);
			modalDiv.show().css({'z-index':result});
		}
		return result;
	}
	
	function destroyIndex(index){
		indexCache.remove(index);
		modalIndexCache.remove(index);
		if (modalIndexCache.length===0){
			modalDiv.hide();
		} else {
			modalDiv.css({'z-index':modalIndexCache[modalIndexCache.length-1]});
		}
	}
	
	var modalDiv = $('<div class="i-modal"></div>').appendTo(document.body);
	
	/**
	 * export
	 */
	UI.Modal = {
		getIndex : getIndex,
		destroyIndex : destroyIndex
	}
	
});