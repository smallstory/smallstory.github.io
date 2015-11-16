'use strict'

define([
	"text!component/tree/leaf/view", 
	"jquery", "vue", "jqueryui"
], function (
	view, 
	$, Vue, jqueryui
) {
	var self = this;

	Vue.component('item', { 
		/* ... */ 
		props: ['model'],
		template: view,
		replace: true,
		data: function () {
			self = this;
			return {
				open: false
			}
		},
		computed: {
			isFolder: function () {
				return this.model.children && this.model.children.length;
			}
		},
		methods: {
			toggle: function () {
				if (this.isFolder) {
					this.open = !this.open
				}
			},
			changeType: function () {
				if (!this.isFolder) {
					this.model.$add('children', [])
					this.addChild()
					this.open = true
				}
			},
			addChild: function () {
				this.model.children.push({
					name: 'new stuff'
				})
			}
		},
		ready: function () {
			$(this.$el).mouseenter(function () {
				console.log('test');
			})
			$(this.$el).draggable({
				// containment: "parent",
				start: function( event, ui ) {
					$(this).css({
						position: "absolute"
					});
				},
				drag: function ( event, ui ) {
					// console.log(event, ui);

					// console.log(event);
					// $("#demo li").each(function (n, d) {
					// 	console.log($(d));
					// })

				}
			});
		}
	});
})