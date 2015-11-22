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
				isDrag: false,
				types: [
					{
						name: "节点类型A",
						icon: "flag",
						type: "\uf024",
					},
					{
						name: "节点类型B",
						icon: "male",
						type: "\uf183"
					},
					{
						name: "节点类型C",
						icon: "home",
						type: "\uf015"
					},
					{
						name: "节点类型D",
						icon: "automobile",
						type: "\uf1b9"
					}
				],
				currentType: "\uf024",
				diagonal: [
					{
						name: "直线",
						type: "line",
						icon: "align-right"
					},
					{
						name: "曲线",
						type: "raidus",
						icon: "stethoscope"
					}
				],
			}
		},
		methods: {
			StartAddNode: function (type) {
				this.currentType = type;
				this.isDrag = true;
				postal.publish({
				    channel: "Tree",
				    topic: "node.dragstart"
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
				        type: this.currentType,
				        style: "node-important",
				        children: []
				    }
				});
				
				// console.log('end add node');	
			},
			ChangeDiagonal: function (type) {
				postal.publish({
		            channel: "Tree",
		            topic: "opts.diagonal",
		            data: type
		        });
			},
			CloseFp: function () {
				$("#fpDialog").hide();
			}
		},
		components:{
			D3Tree: D3Tree,
			detail: Detail
		},
		ready: function () {
            postal.subscribe({
	            channel: "Tree",
	            topic: "node.showFp",
	            callback: function (d) {
	                $("#fpDialog").show();
	            }
	        });
		}
	}
})