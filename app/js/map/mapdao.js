/**
 * 
 */
define(function(require, exports, module) {

	"use strict";
	
	var actions = [],
		ajaxing = false,
		statusAjaxing = 'ajaxing',
		updateDelay  = 1000;
	
	var fields = {
		node : {
			moved : {x:true,y:true}
		}
	};

	function getAction(data){
		var i,action;
		for (i=0;action=actions[i];i+=1){
			if (action.status !== statusAjaxing && data === action.data){
				return action;
			}
		}
		return null;
	}
	
	function insertNode(node){
		var param = $.extend({},node.getData());
		actions.push({
			url : '/api/'+node.map.projectId+'/node',
			type : 'post',
			fields : 'all',
			param : param,
			getData : getData,
			time : new Date(),
			data : node
		});
		if (!ajaxing){
			doAjax();
		}
	}


	function poiMergeSuccess(data){
		//
		this.setPoi(data);
		shiftActions();
	}

	function insertNodePoi(node,poi){
		var param = poi;
		actions.push({
			url : '/api/'+node.map.projectId+'/poi',
			type : 'post',
			fields : 'all',
			param : param,
			getData : getData,
			time : new Date(),
			data : node,
			success : poiMergeSuccess
		});
	}
	
	function updateNodePoi(node,poi){
		actions.push({
			url : '/api/'+node.map.projectId+'/poi/'+node.getPoi().id,
			type : 'put',
			fields : 'all',
			param : poi,
			getData : getData,
			time : new Date(),
			data : node,
			success : poiMergeSuccess
		});
	}

	function getInsertLineParam(){
		var param = $.extend({},this.data.getData());
		param.nodeid1 = this.data.n1.getData().id;
		param.nodeid2 = this.data.n2.getData().id;
		return JSON.stringify(param);
	}

	function insertLine(line){
		var param = $.extend({},line.getData());
		actions.push({
			url : '/api/'+line.map.projectId+'/node_distance',
			type : 'post',
			fields : 'all',
			getData : getInsertLineParam,
			time : new Date(),
			data : line
		});
		if (!ajaxing){
			doAjax();
		}
	}
	
	function getData(){
		return this.param ? JSON.stringify(this.param) : null;
	}
	
	function updateMovedNode(node){
		
		var action = getAction(node);
		var param, key, data = node.getData();
		if (!action){
			param = {} ;
			for (key in fields.node.moved){
				param[key] = data[key];
			}
			actions.push({
				url : '/api/'+node.map.projectId+'/node/'+node.data.id,
				type : 'put',
				param : param,
				getData : getData,
				time : new Date(),
				data : node
			});
		} else {
			param = action.param;
			for (key in fields.node.moved){
				param[key] = data[key];
			}
		}
		if (!ajaxing){
			doAjax();
		}
	}
	
	function delNode(node){
		actions.push({
			url : '/api/'+node.map.projectId+'/node/'+node.getData().id,
			type : 'delete',
			getData : getData,
			time : new Date(),
			data : node
		});
		if (!ajaxing){
			doAjax();
		}
	}
	
	function delLine(node){
		actions.push({
			url : '/api/'+node.map.projectId+'/node_distance/'+node.getData().id,
			type : 'delete',
			getData : getData,
			time : new Date(),
			data : node
		});
		if (!ajaxing){
			doAjax();
		}
	}

	function shiftActions(){
		actions.shift();
	}
	
	function ajaxSuccess(json){
		if (this.type === 'put' || this.type === 'post'){
			$.extend(this.data.data,json);
		}
		shiftActions();
	}
	
	function doAjax(){
		ajaxing = true;
		if (actions.length===0){
			ajaxing = false;
			return;
		}
		var action = actions[0];
		if (new Date()-action.time < updateDelay){
			setTimeout(doAjax,updateDelay);
			return;
		}
		
		action.status = statusAjaxing;
		$.ajax({
			contentType : 'application/json',
			url : action.url,
			type : action.type,
			data : action.getData(),
			context : action,
			success : action.success || ajaxSuccess,
			complete : doAjax
		});
	}
	
	/**
	 * 加载 mapdata
	 */
	function loadMapData(projectId,mapdataId,fn){
		$.ajax({
			url :  '/api/'+projectId+'/mapdata/'+mapdataId,
			dataType : 'json',
			type : 'get',
			success : fn
		});
	}
	
	return {
		loadMapData : loadMapData,
		insertLine : insertLine,
		delLine : delLine,
		insertNode : insertNode,
		updateMovedNode : updateMovedNode,
		delNode : delNode,
		insertNodePoi : insertNodePoi,
		updateNodePoi : updateNodePoi
	};
	
});