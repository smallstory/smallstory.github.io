'usr strict'

require(["less!component/D3Tree/style"])

define([
	"text!component/D3Tree/view", "apps/model",
	"jquery", "vue", "postal",
	"component/D3Tree/Tree"
], function (
	view, model,
	$, Vue, postal,
	Tree
) {
	var self;
	var chart;

	return {
		template: view,
		data: function () {
			self = this;
			return {
				
			}
		},
		ready: function () {
			$.get('data.json', function (data) {
				chart = new Tree()
					.params({
						el: "#D3Tree",
						width: window.innerWidth,
						height: window.innerHeight
					})
					.data()
					.render();

				// postal.subscribe({
				// 	channel: "Tree",
				// 	topic: "node.addStart",
				// 	callback: function(data) {
				// 		// chart.addNode(data);
				// 		console.log('test');
				// 	}
				// });

			});
		}
	}
})