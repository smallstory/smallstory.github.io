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
				isShow: false
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

		},
		ready: function () {
			postal.subscribe({
                channel: "Tree",
                topic: "node.detail",
                callback: function (node) {
                	self.node = node;
                }
            });
		}
	}
})