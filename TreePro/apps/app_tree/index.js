'use strict'

require(["less!app_tree/style"])

define([
	"text!app_tree/view", "app_tree/model",
	"jquery", "vue", "postal",
	"component/D3Tree",
	"component/D3NodeDetail"
], function (
	view, model,
	$, Vue, postal,
	D3Tree,
	Detail
) {
	var self;


	return { 
		/* ... */ 
		template: view,
		data: function () {
			self = this;
			return {
				isDrag: false
			}
		},
		methods: {
			StartAddNode: function (event) {
				this.isDrag = true
				postal.publish({
				    channel: "Tree",
				    topic: "node.dragstart",
				    data: {
				    	event: event,
				    	node: {
					        name: "新节点",
					        children: []
					    }
				    }
				});
				// console.log('start add node');
			},
			DragAddNode: function (event) {
				if(!this.isDrag) return;
				postal.publish({
				    channel: "Tree",
				    topic: "node.draging",
				    data: event
				});
				// console.log('drag node');
			},
			EndAddNode: function () {
				if(!this.isDrag) return;

				this.isDrag = false;
				postal.publish({
				    channel: "Tree",
				    topic: "node.dragend",
				    data: {
				        name: "新节点",
				        style: "node-important",
				        children: []
				    }
				});
				
				// console.log('end add node');	
			}
		},
		components:{
			D3Tree: D3Tree,
			detail: Detail
		},
	}
})