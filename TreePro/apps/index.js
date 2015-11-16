'usr strict'

require(["less!apps/style"])

define([
	"text!apps/view", "apps/model",
	"jquery", "vue",
	"app_tree"
], function (
	view, model,
	$, Vue,
	app_tree
) {

	new Vue({
		el: 'body',
        template: view,
        replace: false,
		data: {
			aciveView: "app-tree"
		},
		components: {
			appTree: app_tree
		},

		methods: {

		},

		computed: {		// 计算属性

		},

		compiled: function () {
			// body...
		},

		ready: function () {
			// body...
		}

	})
})