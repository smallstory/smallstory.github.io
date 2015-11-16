'usr strict'

require(["less!component/tree/style"])

define([
	"text!component/tree/view", "apps/model",
	"jquery", "vue",
	"component/tree/leaf"
], function (
	view, model,
	$, Vue,
	leafs
) {
	var self;

	var data = {
		name: 'My Tree',
		children: [
			{ name: 'hello' },
			{ name: 'wat' },
			{
				name: 'child folder',
				children: [
					{
						name: 'child folder',
						children: [
							{ name: 'hello' },
							{ name: 'wat' }
						]
					},
					{ name: 'hello' },
					{ name: 'wat' },
					{
						name: 'child folder',
						children: [
							{ name: 'hello' },
							{ name: 'wat' }
						]
					}
				]
			}
		]
	}

	return {
		template: view,
		data: function () {
			self = this;
			return {
				treeData: data
			}
		}
	}
})