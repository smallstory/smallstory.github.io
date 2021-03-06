'use strict'

require(["less!component/D3NodeDetail/style"])

define([
	"text!component/D3NodeDetail/view",
	"jquery", "vue", "postal"
], function (
	view,
	$, Vue, postal
) {
	var self;

	return { 
		/* ... */ 
		template: view,
		data: function () {
			self = this;
			return {
				title: "节点属性",
				node: {},
				isShow: false,
				form: {
					name: "",
					value: "",
				}
			}
		},
		watch: {
			'node.name': function (val, oldVal) {
	            postal.publish({
				    channel: "Tree",
				    topic: "node.update",
				    data: {
				    	node: self.node,
				    	key: "name"
				    }
				});
			}
		},
		methods: {
			ClosePanel: function () {
				$("#detailPanel").hide();
			}
		},
		ready: function () {
			postal.subscribe({
                channel: "Tree",
                topic: "node.detail",
                callback: function (d) {
                	var event = d3.event;
                	self.node = d.node;
                	$("#detailPanel").css({
                		top: event.y + 10,
                		left: event.x + 10
                	})
                	$("#detailPanel").show();
                }
            });

            postal.subscribe({
                channel: "Tree",
                topic: "node.detailClose",
                callback: function (node) {
                	$("#detailPanel").hide();
                }
            });

		}
	}
})