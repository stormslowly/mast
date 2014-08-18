
define(function(require, exports, module) {

	"use strict";
	
	/**
		@config el
		@config projectId
		@config type  POI / VENUE
	*/
	function CategoryList(cfg){
		$.extend(this,cfg);
		this.init();
	}

	CategoryList.prototype.init = function() {
		this.ajaxLoad();
		this._bindDomEvent();
	};

	CategoryList.prototype._bindDomEvent = function() {
		$('#'+this.el).on('click','.kb-category-item',this,this.clickHandler);
	};

	CategoryList.prototype.clickHandler = function(e) {
		$(this).addClass('actived').parent().siblings('li').children('.kb-category-item').removeClass('actived');
	};

	CategoryList.prototype.ajaxLoad = function(){
		$.ajax({
			url :  '/api/'+ this.projectId + '/category?type=\''+this.type+'\'',
			success : this.loadData,
			context : this
		});
	}

	CategoryList.prototype.loadData = function(data) {
		data = this.data = data || [];
		var datamap = this._datamap = {},i,b;
		for (i=0;b=data[i];i+=1){
			datamap[data.id] = data;
		}
		this.render();
	};

	CategoryList.prototype.getActived = function(){
		var items = $('#'+this.el+' .actived');
		if (items.length === 1){
			return this.get(items.attr('_id'));
		}
		return null;
	}

	CategoryList.prototype.render = function() {
		var i,data = this.data,b,s;
		s = ['<ul class="kb-category-list">'];
		for (i=0;b=data[i];i+=1){
			s.push('<li>');
			s.push('<a href="javascript:;" _id="',b.id,'" class="kb-category-item" >');
			s.push('<img class="kb-category-item-icon" src="',this.getUrl(b.thumbnail_url),'" />');
			s.push('<span>',b.name,'</span> ');
			s.push('</a>');
			s.push('</li>')
		}
		s.push('</ul>');
		$('#'+this.el).html(s.join(''));
	};

	CategoryList.prototype.getUrl = function(url) {
		return '/api/'+this.projectId+url;
	};

	return CategoryList;

});