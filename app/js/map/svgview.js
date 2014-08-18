/**
 * 
 */
define(function(require, exports, module) {

	"use strict";
	
	var Map = require('./map.js');
	var mapdao = require('./mapdao.js');
	var ButtonGroup = require('./buttongroup.js');
	var CategoryList = require('./category.js');
	require('ui/mouse.js');
	require('ui/svgelementrender.js');
	
	var lineStyle = "stroke:#555555;stroke-width:6;stroke-opacity:0.5;",
		lineMouseOverStyle = "stroke:#333333;stroke-width:8;stroke-opacity:0.5;",
		lineSelectedStyle = "stroke:blue;stroke-width:8;stroke-opacity:0.9;",
		nodeStyle = "stroke:#444444;stroke-width:3;fill:white;stroke-opacity:0.5;",
		nodeMouseOverStyle = "stroke:#222222;stroke-width:5;fill:white;stroke-opacity:0.5;",
		nodeSelectedStyle = "stroke:blue;stroke-width:5;fill:white;stroke-opacity:0.9;";
	
	/**
	 * @config el : 
	 * 
	 * @event zoomchange(SvgView view)  缩放发生改变触发  
	 * 
	 */
	function SvgView(cfg){
		$.extend(this,cfg);
		this.init();
	}
	
	$.extend(SvgView.prototype,UI.Events.prototype);
	
	SvgView.prototype.init = function(){
		if (!this.hasOwnProperty('id')){
			this.id = UI.newid('m');
		}
		
		this.el = UI.newid('m');
		
		var s = [],h,categoryId = UI.newid('cate');
		
		
		s.push('<div class="kb-icon-bar">');
		s.push(' <a href="javascript:;" class="kb-icon kb-active" _status="elementedit">EDIT</a>');
		s.push(' <a href="javascript:;" class="kb-icon" _status="drawline" >Draw Line</a>');
		s.push(' <a href="javascript:;" id="',this.id,'_drawPoiBtn" class="kb-icon" _status="drawpoi" >Draw Poi</a>');
		s.push(' <a href="javascript:;" id="',this.id,'_deleteSelectedBtn" class="kb-icon" _event="deleteSelected" >Delete Seleted</a>');
		s.push('</div>');

		s.push('<div class="kb-layout">')

		s.push('<div class="kb-left-panel">');
		s.push('<div id="',categoryId,'"  style="overflow: auto;height: 100%;"></div>');
		s.push('</div>');

		s.push('<div class="kb-right-panel">')
		// 地图操作区域 start
		s.push('<div id="',this.el,'" class="kb-workspace" >');
		s.push('<div class="kb-view">');
		s.push('<div class="kb-image"><img draggable=false /></div>');
		s.push('<div class="kb-svg"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" version="1.1"></svg></div>');
		s.push('</div>');
		s.push('</div>');
		// 地图操作区域 end
		s.push('</div>');

		s.push('</div>');
		
		h = $('#'+this.container).html(s.join('')).height();
		
		$('#'+this.container+' .kb-layout').height(h - 2 -$('#'+this.container +' .kb-icon-bar').outerHeight() +'px');
		
		this.initEvents();
		// 绑定dom事件
		this._bindDomEvent();
		
		this.loadMapData();
		
		this.categoryList = new CategoryList({
			projectId : this.projectId,
			type : 'POI',
			el : categoryId
		});

		this.emptyBG = new ButtonGroup({
			container : this.container,
			context : this,
			btns : [{
				text : 'Create',
				event : 'createNode'
			}]
		});

		this.nodeBG = new ButtonGroup({
			container : this.container,
			context : this,
			btns : [{
				text : 'LineTo',
				event : 'lineTo'
			},{
				text : 'Del',
				event : 'delNode'
			}]
		});
		
		this.lineBG = new ButtonGroup({
			container : this.container,
			context : this,
			btns : [{
				text : 'del',
				event : 'delLine'
			}]
		});
		
	};
	
	SvgView.prototype._bindDomEvent = function(){
		var me = this,status = $('#'+this.container+' .kb-icon-bar .kb-active').attr('_status');
		this.setWidth($('#'+this.container).width());
		$('#'+this.container+' .kb-icon-bar').on('click','.kb-icon[_status]',function(){
			$(this).addClass('kb-active').siblings('.kb-active[_status]').removeClass('kb-active');
			me.setStatus(this.getAttribute('_status'));
		}).on('click','[_event]',me,function(e){
			e.data[this.getAttribute('_event')](this);
		});
		if (status){
			this.setStatus(status);
		}
		$('#'+this.el).on('mouseover',this,this._mouseoverHandler).on('mouseout',this,this._mouseoutHandler);

		$('#'+this.el+' .kb-view').on('mousemoving',me,me._eleMovingHandler)
			.on('mousemovingstart',me,me._eleMoveStart);
		
	};
	
	SvgView.prototype.loadMapData = function(){
		var me = this;
		mapdao.loadMapData(me.projectId,me.mapdataId,function(mapdata){
			me.setMapData(mapdata);
		});
	};
	
	SvgView.prototype.setWidth = function(width){
		this.width = width || 800;
		$('#'+this.el+" .kb-view").width(this.width+'px');
		if (this.map instanceof Map){
			this.renderSvg();
		}
	};
	
	/**
	 * 初始化 事件对象
	 */
	SvgView.prototype.initEvents = function(){
		this.mapEvents = [];
		this.mapEvents.push(this._nodeSelected = new UI.Event({
			name : 'nodeSelected',
			context : this,
			handler : this._nodeSelectedHandler
		}));
		this.mapEvents.push(this._nodeUnSelected = new UI.Event({
			name : 'nodeUnSelected',
			context : this,
			handler : this._nodeUnSelectedHandler
		}));
		this.mapEvents.push(this._lineSelected = new UI.Event({
			name : 'lineSelected',
			context : this,
			handler : this._lineSelectedHandler
		}));
		this.mapEvents.push(this._lineUnSelected = new UI.Event({
			name : 'lineUnSelected',
			context : this,
			handler : this._lineUnSelectedHandler
		}));
		this.mapEvents.push(this._clearSelect = new UI.Event({
			name : 'clearSelect',
			context : this,
			handler : this._clearSelectHandler
		}));
		this.mapEvents.push(this._loadMap = new UI.Event({
			name : 'loadMap',
			context : this,
			handler : this._loadMapHandler
		}));
		this.mapEvents.push(this._addNode = new UI.Event({
			name : 'addNode',
			context : this,
			handler : this._addNodeHandler
		}));
		this.mapEvents.push(this._addLine = new UI.Event({
			name : 'addLine',
			context : this,
			handler : this._addLineHandler
		}));
		this.mapEvents.push(this._selectedNodesMoved = new UI.Event({
			name : 'selectedNodesMoved',
			context : this,
			handler : this._selectedNodesMovedHandler
		}));
		this.mapEvents.push(this._removeNode = new UI.Event({
			name : 'removeNode',
			context : this,
			handler : this._removeNodeHandler
		}));
		this.mapEvents.push(this._removeLine = new UI.Event({
			name : 'removeLine',
			context : this,
			handler : this._removeLineHandler
		}));
		
		var me =this;
		
		this.statusEvents = {
			drawpoi : {
				on : function(){
					$('#'+me.el+' .kb-view')
						.spymousemove()
						.on('click',me,me._eleSelectHandler)
						.on('mousewheel',me,me.zoomMousewheelHandler)
						.on('mousemove',me,me.drawLineMouseMoveHandler)
						.on('click',me,me.drawpoiHandler)
						.on('contextmenu',me,me._selectContextmenuHandler);
					if (me.map){
						me.clearSelect();
					}
				},
				off : function(){
					$('#'+me.el+' .kb-view')
						.spymousemove(false)
						.off('click',me._eleSelectHandler)
						.off('click',me.drawpoiHandler)
						.off('mousemove',me.drawLineMouseMoveHandler)
						.off('contextmenu',me._selectContextmenuHandler)
						.off('mousewheel',me.zoomMousewheelHandler);
				}
			},
			drawline : {
				on : function(){
					$('#'+me.el+' .kb-view')
						.spymousemove()
						.on('click',me,me._eleSelectHandler)
						.on('mousewheel',me,me.zoomMousewheelHandler)
						.on('mousemove',me,me.drawLineMouseMoveHandler)
						.on('click',me,me.drawlineHandler)
						.on('contextmenu',me,me._selectContextmenuHandler);
					if (me.map){
						me.clearSelect();
					}
					
				},
				off : function(){
					$('#'+me.el+' .kb-view')
						.spymousemove(false)
						.off('click',me._eleSelectHandler)
						.off('click',me.drawlineHandler)
						.off('mousemove',me.drawLineMouseMoveHandler)
						.off('contextmenu',me._selectContextmenuHandler)
						.off('mousewheel',me.zoomMousewheelHandler);
				}
			},
			elementedit : {
				on : function(){
					$('#'+me.el+' .kb-view')
						.spymousemove()
						.on('mousewheel',me,me.zoomMousewheelHandler)
						.on('mousemove',me,me.drawLineMouseMoveHandler)
						.on('click',me,me._eleSelectHandler)
						.on('click',me,me.editClickHandler)
						.on('contextmenu',me,me._selectContextmenuHandler);
	
				},
				off : function(){
					$('#'+me.el+' .kb-view')
						.spymousemove(false)
						.off('click',me.editClickHandler)
						.off('mousemove',me.drawLineMouseMoveHandler)
						.off('click',me._eleSelectHandler)
						.off('contextmenu',me._selectContextmenuHandler)
						.off('mousewheel',me.zoomMousewheelHandler);
				}
			}
		};
		
	};

	SvgView.prototype.clearSelect = function() {
		if (this.map){
			this.map.clearSelect();
		}
		this._tempNode = null;
		this._tempLine = null;
	};
	
	// 不同 status下对应的dom事件
	SvgView.prototype._selectContextmenuHandler = function(e){
		// 清除select
		if (e.data.map){
			e.data.map.unSelectAll();
		}
		return false;
	};

	SvgView.prototype.deleteSelected = function() {
		this.map.deleteSelected();
	};
	
	SvgView.prototype.zoomMousewheelHandler = function(event){
		var me = event.data,
			zoom = me._zoom,
			container = $('#'+me.el+" .kb-view"),
			currPos = container.offset(),
			basePos = container.offsetParent().offset(),
			x = event.clientX,
			y = event.clientY;
		if (event.deltaY>0){
			//up
			if (me.zoom>5){
				return;
			}
			me._zoom /= .8;
		} else if (event.deltaY<0){
			//down
			if (me.zoom<.3){
				return;
			}
			me._zoom *= 0.8;
		}
		container.css({
			left : x -(x - currPos.left)*me._zoom/zoom - basePos.left + 'px',
			top : y -(y - currPos.top)*me._zoom/zoom - basePos.top + 'px'
		});
		me.setWidth(me.map.getMapWidth()*me._zoom);
		me.trigger('zoomchange',this);
		return false;
	};
	
	SvgView.prototype.editClickHandler = function(e){
		var t = e.target,me = e.data,type = t.getAttribute('_type'),node;
		var offset = $('#'+me.el+" .kb-view").offset();
		if (type==='node'){
			node = me.map.getNode(t.getAttribute('_id'));
			if (me._drawingLine){
				me.map.createLine(me._tempNode,node);
				me._drawingLine.remove();
				me._drawingLine = null;
			}
			me._tempNode = node;
			if (me.map.isNodeSelected(me._tempNode)){
				me.nodeBG.showAt(e.clientX,e.clientY);
			}
		} else if (type==='line'){
			me._tempLine = me.map.getLine(t.getAttribute('_id'));
			if (me.map.isLineSelected(me._tempLine)){
				me.lineBG.showAt(e.clientX,e.clientY);
			}
		} else {
			me._tempPostion = {
				x : me.toXSize(e.pageX-offset.left),
				y : me.toYSize(e.pageY-offset.top)
			};
			me.emptyBG.showAt(e.clientX,e.clientY);
		}
	};

	SvgView.prototype.drawpoiHandler = function(e) {
		var t = e.target,me = e.data,type = t.getAttribute('_type'),node;
		var offset = $('#'+me.el+" .kb-view").offset();
		if (!type){
			me.map.createNode({
				x : me.toXSize(e.pageX-offset.left),
				y : me.toYSize(e.pageY-offset.top)
			});
		}
	};

	SvgView.prototype.drawlineHandler = function(e) {
		var t = e.target,me = e.data,type = t.getAttribute('_type'),node;
		var offset = $('#'+me.el+" .kb-view").offset();
		if (type === 'node'){
			node = me.map.getNode(t.getAttribute('_id'));
		} else {
			node = me.map.createNode({
					x : me.toXSize(e.pageX-offset.left),
					y : me.toYSize(e.pageY-offset.top)
				});
		}
		if (me._tempNode){
			me.map.createLine(me._tempNode,node);
		}
		
		me._tempNode = node;

		/*if (!type){
			me.map.createNode({
				x : me.toXSize(e.pageX-offset.left),
				y : me.toYSize(e.pageY-offset.top)
			});
		}*/
	};

	SvgView.prototype.drawLineMouseMoveHandler = function(e){
		var me = e.data;
		var offset = $('#'+me.el+" .kb-view").offset();
		me._tempX = e.clientX - offset.left;
		me._tempY = e.clientY - offset.top;
		if (me._drawingLine){
			me._drawingLine.attr({
				x2 : e.clientX - offset.left,
				y2 : e.clientY - offset.top
			});
		}
	};
	
	// SvgView 关注的事件handler start:
	SvgView.prototype._nodeSelectedHandler = function(node){
		$('#'+this.genNodeId(node)).attr({
			style:nodeSelectedStyle,
			_selected : true
		});
	};
	SvgView.prototype._nodeUnSelectedHandler = function(node){
		$('#'+this.genNodeId(node)).attr({
			style:nodeStyle,
			_selected : false
		});
	};
	SvgView.prototype._lineSelectedHandler = function(line){
		$('#'+this.genLineId(line)).attr({
			style:lineSelectedStyle,
			_selected : true
		});
	};
	SvgView.prototype._lineUnSelectedHandler = function(line){
		$('#'+this.genLineId(line)).attr({
			style:lineStyle,
			_selected : false
		});
	};
	SvgView.prototype._clearSelectHandler = function(){
		this.renderSvg();
	};
	SvgView.prototype._loadMapHandler = function(){
		this.renderSvg();
	};
	SvgView.prototype._addNodeHandler = function(node){
		$('#'+this.el+' svg').append($.renderSvgFragement(this.renderNode(node)));
	};
	SvgView.prototype._addLineHandler = function(line){
		$('#'+this.el+' svg').prepend($.renderSvgFragement(this.renderLine(line)));
	};
	
	SvgView.prototype._selectedNodesMovedHandler = function(){
		var nodes = this.map.selectedNodes().slice(0),i,j,node,lines,line,movedlines,n1,n2;
		lines = this.map.selectedLines();
		if (lines){
			for (j=0;line=lines[j];j+=1){
				if ($.inArray(line.n1,nodes)===-1){
					nodes.push(line.n1);
				}
				if ($.inArray(line.n2,nodes)===-1){
					nodes.push(line.n2);
				}
			}
		}
		movedlines = [];
		for (i=0;node=nodes[i];i+=1){
			$('#'+this.genNodeId(node)).attr({
				cx : this.toXPixel(node.x()),
				cy : this.toYPixel(node.y())
			});
			lines = this.map.getLinesByNode(node);
			if (lines){
				for (j=0;line=lines[j];j+=1){
					if ($.inArray(line,movedlines)===-1){
						movedlines.push(line);
					}
				}
			}
		}
		for (i=0;line=movedlines[i];i+=1){
			n1 = line.n1;
			n2 = line.n2;
			$('#'+this.genLineId(line)).attr({
				x1: this.toXPixel(n1.x()),
				y1: this.toYPixel(n1.y()),
				x2: this.toXPixel(n2.x()),
				y2: this.toYPixel(n2.y())
			});
		}
	};
	
	SvgView.prototype._removeNodeHandler = function(node){
		$('#'+this.genNodeId(node)).remove();
	};
	
	SvgView.prototype._removeLineHandler = function(line){
		$('#'+this.genLineId(line)).remove();
	};
	
	// SvgView 关注的事件handler  end.
	
	
	/**
	 * 设置 地图数据
	 * @param data
	 * @returns {SvgView}
	 */
	SvgView.prototype.setMapData = function(data){
		if (this.map && this.map.off){
			this.map.off2(this.mapEvents);
		}
		this.map = new Map({projectId:this.projectId,map:data});
		$('#'+this.el+' .kb-image img').attr('src',this.map.getMapUrl());
		this.map.on2(this.mapEvents);
		this._zoom = this.width/ this.map.getMapWidth();
		this.renderSvg();
		return this;
	};
	
	// 地图元素 mouse over out 事件  start :
	SvgView.prototype._mouseoverHandler = function(e){
		var t = e.target,me = e.data,type = t.getAttribute('_type');
		if (type === 'line'){
			me.lineMouseOver(me.map.getLine(t.getAttribute('_id')));
		} else if (type==='node'){
			me.nodeMouseOver(me.map.getNode(t.getAttribute('_id')));
		}
	};
	
	SvgView.prototype.lineMouseOver = function(line){
		if (this.map.isLineSelected(line)){
			return;
		}
		$('#'+this.genLineId(line)).attr({
			style:lineMouseOverStyle
		});
	};
	
	SvgView.prototype.nodeMouseOver = function(node){
		if (this.map.isNodeSelected(node)){
			return;
		}
		$('#'+this.genNodeId(node)).attr({
			style:nodeMouseOverStyle
		});
	};
	
	SvgView.prototype._mouseoutHandler = function(e){
		var t = e.target,me = e.data,type = t.getAttribute('_type');
		if (type === 'line'){
			me.lineMouseOut(me.map.getLine(t.getAttribute('_id')));
		} else if (type==='node'){
			me.nodeMouseOut(me.map.getNode(t.getAttribute('_id')));
		}
	};
	
	SvgView.prototype.lineMouseOut = function(line){
		if (this.map.isLineSelected(line)){
			return;
		}
		$('#'+this.genLineId(line)).attr({
			style:lineStyle
		});
	};
	
	SvgView.prototype.nodeMouseOut = function(node){
		if (this.map.isNodeSelected(node)){
			return;
		}
		$('#'+this.genNodeId(node)).attr({
			style:nodeStyle
		});
	};
	// 地图元素 mouse over out 事件  end :
	
	
	// 地图单击事件 start:
	/**
	 * 地图单击事件处理器
	 */
	SvgView.prototype._eleSelectHandler = function(e){
		var t = e.target,me = e.data,type = t.getAttribute('_type');
		if (me.mousemoving){
			me.mousemoving = false;
			return;
		}
		if (type === 'line'){
			me.lineClick(me.map.getLine(t.getAttribute('_id')));
		} else if (type==='node'){
			me.nodeClick(me.map.getNode(t.getAttribute('_id')));
		}
	};
	
	SvgView.prototype.nodeClick = function(node){
		if (this.map.isNodeSelected(node)){
			this.map.unSelectNode(node);
		} else {
			this.map.selectNode(node);
		}
	};
	
	SvgView.prototype.lineClick = function(line){
		if (this.map.isLineSelected(line)){
			this.map.unSelectLine(line);
		} else {
			this.map.selectLine(line);
		}
	};
	
	// 地图单击事件 end.
	
	// 渲染 SVG 内容 start :
	/**
	 * 生成 svg 代码
	 */
	SvgView.prototype.renderSvg = function(){
		var s = ['<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" version="1.1">'];
		this.renderLines(this.map.getLines(),s);
		this.renderNodes(this.map.getNodes(),s);
		s.push("</svg>");
		$('#'+this.el+' .kb-svg').html(s.join(''));
	};
	
	/**
	 * 生成 Line 的 html id
	 * @param bean
	 * @returns {String}
	 */
	SvgView.prototype.genLineId = function(bean){
		return this.id+"_l_"+bean.id;
	};
	
	/**
	 * 生成 Node 的 html id
	 * @param bean
	 * @returns {String}
	 */
	SvgView.prototype.genNodeId = function(bean){
		return this.id+"_n_"+bean.id;
	};
	
	/**
	 * 渲染 Line svg代码
	 * @param lines
	 * @param s
	 */
	SvgView.prototype.renderLines = function(lines,s){
		var i,line;
		for (i=0;line=lines[i];i+=1){
			s.push(this.renderLine(line));
		}
	};
	SvgView.prototype.renderLine = function(line){
		var n1 = line.n1,n2 = line.n2;
		return ['<line id="',this.genLineId(line),'" _type="line" _id="',line.id,'" x1="',this.toXPixel(n1.x()),'" y1="',this.toYPixel(n1.y()),'" x2="',this.toXPixel(n2.x()),'" y2="',this.toYPixel(n2.y()),'" style="',lineStyle,'" />'].join('');
	};
	
	/**
	 * 渲染 Node svg代码
	 * @param nodes
	 * @param s
	 */
	SvgView.prototype.renderNodes = function(nodes,s){
		var i,node;
		for (i=0;node=nodes[i];i+=1){
			s.push(this.renderNode(node));
		}
	};
	
	SvgView.prototype.renderNode = function(node){
		return ['<circle id="',this.genNodeId(node),'" _type="node" _id="',node.id,'" cx="',this.toXPixel(node.x()),'" cy="',this.toYPixel(node.y()),'" r="6" style="',nodeStyle,'" />'].join('');
	};
	
	
	// 渲染 SVG 内容 end :
	
	/**
	 * 设置状态
	 */
	SvgView.prototype.setStatus = function(status){
		if (this.status === status){
			return;
		}
		if (this.statusEvents[this.status]){
			this.statusEvents[this.status].off();
		}
		this.status = status;
		this.statusEvents[status].on();
	};
	
	/**
	 * 选择Node后拖动节点事件
	 * @param e
	 * @param status
	 */
	SvgView.prototype._eleMovingHandler = function(e,status){
		var me = e.data,eventTarget = status.eventTarget;
		me.mousemoving = true;
		if (eventTarget.getAttribute('_selected')!=='true'){
			// 拖动view
			$(this).css({
				left : status.targetpos.left+status.current.x-status.start.x+'px',
				top : status.targetpos.top+status.current.y-status.start.y+'px'
			});
			return;
		}
		// 拖动 选中项
		me.map.moveSelectedNodes({
			x : me.toXSize(status.current.x-status.start.x),
			y : me.toYSize(status.current.y-status.start.y)
		});
	};
	
	SvgView.prototype._eleMoveStart = function(e,status){
		if (status.eventTarget.getAttribute('_selected')==='true'){
			e.data.map.storeSelectedNodesPos();
		}
	};
	

	/**
	 * 真实距离转换为位置比例
	 * @param s
	 * @returns
	 */
	SvgView.prototype.toXPixel = function(s){
		return Math.round(s*this.map.getMapWidth()*this._zoom);
	};
	SvgView.prototype.toYPixel = function(s){
		return Math.round(s*this.map.getMapHeight()*this._zoom);
	};
	
	/**
	 * 位置比例转换为真实距离
	 * @param p
	 * @returns
	 */
	SvgView.prototype.toXSize = function(p){
		return p/this._zoom/this.map.getMapWidth();
	};
	SvgView.prototype.toYSize = function(p){
		return p/this._zoom/this.map.getMapHeight();
	};
	
	/**
	 * nodeBG 事件实现
	 */
	SvgView.prototype.delNode = function(){
		this.map.removeNode(this._tempNode);
	};
	SvgView.prototype.delLine = function(){
		this.map.removeLine(this._tempLine);
	};
	SvgView.prototype.createNode = function(){
		if (!this._tempPostion){
			return;
		}
		this.map.createNode(this._tempPostion);
		this._tempPostion = null;
	};
	
	SvgView.prototype.lineTo = function(){
		var n1 = this._tempNode;
		var s = ['<line x1="',this.toXPixel(n1.x()),'" y1="',this.toYPixel(n1.y()),'" x2="',this._tempX,'" y2="',this._tempY,'" style="',lineStyle,'" />'].join('');
		this._drawingLine = $.renderSvgFragement(s).prependTo($('#'+this.el+" svg"));
	};
	
	return SvgView;
});