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
				title: "_",
				isShow: false
			}
		},
		methods: {

		},
		ready: function () {
			// console.log('test');
		}
	}
})