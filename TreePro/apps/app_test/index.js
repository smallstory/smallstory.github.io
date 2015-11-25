'use strict'

require(["less!app_test/style"])

define([
	"text!app_test/view", "app_test/model",
	"jquery", "vue", "postal"
], function (
	view, model,
	$, Vue, postal
) {
	var self;

	return { 
		/* ... */ 
		template: view,
		data: function () {
			self = this;
			return {
				
			}
		},
		watch: {

		},
		methods: {

		},
		components:{

		},
		ready: function () {
            
		}
	}
})