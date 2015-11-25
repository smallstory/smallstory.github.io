'usr strict'

require(["less!apps/style"])

define([
	"text!apps/view", "apps/model",
	"jquery", "vue",
	"app_tree",
	"app_test"
], function (
	view, model,
	$, Vue,
	app_tree,
	app_test
) {

	new Vue({
		el: 'body',
        template: view,
        replace: false,
		data: {
			aciveView: "app-test"
		},
		components: {
			appTree: app_tree,
			appTest: app_test
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