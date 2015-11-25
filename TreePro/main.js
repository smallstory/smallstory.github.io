'use strict'

require.config({
	baseUrl: "",
	paths: {
		"text": "bower_components/text/text",
		"less": "bower_components/require-less/lessc",

		"apps": "apps/index",
		"apps/model": "apps/model",
		"apps/style": "apps/style",
		"apps/view": "apps/view.html",

		"app_tree": "apps/app_tree/index",
		"app_tree/model": "apps/app_tree/model",
		"app_tree/style": "apps/app_tree/style",
		"app_tree/view": "apps/app_tree/view.html",

		"app_test": "apps/app_test/index",
		"app_test/model": "apps/app_test/model",
		"app_test/style": "apps/app_test/styles",
		"app_test/view": "apps/app_test/view.html", 
		
		// components
		"component/tree": "component/tree/tree",
		"component/tree/view": "component/tree/tree.tpl",
		"component/tree/leaf": "component/tree/leaf",
		"component/tree/leaf/view": "component/tree/leaf.tpl",
		"component/tree/style": "component/tree/style",

		"component/D3Tree": "component/D3Tree/index",
		"component/D3Tree/view": "component/D3Tree/view.html",
		"component/D3Tree/Tree": "component/D3Tree/Tree",
		"component/D3Tree/style": "component/D3Tree/style",

		"component/D3NodeDetail": "component/D3NodeDetail/index",
		"component/D3NodeDetail/view": "component/D3NodeDetail/view.html",
		"component/D3NodeDetail/style": "component/D3NodeDetail/style",
	},
	shim: {
		"lodash":{
			exports: "_"
		},
		"d3menu":{
			deps: ["d3"]
		}
	},
	packages: [
		
        {
            name: "jquery",
            location: "bower_components/jquery/dist",
            main: "jquery.min"
        },
        {
        	name: "vue",
        	location: "bower_components/vue/dist",
        	main: "vue"
        },
        {
        	name: "jqueryui",
        	location: "bower_components/jquery-ui",
        	main: "jquery-ui.min"
        },
        {
        	name: "d3",
        	location: "bower_components/d3",
        	main: "d3"
        },
        {
        	name: "d3menu",
        	location: "bower_components/d3-context-menu/js",
        	main: "d3-context-menu"
        },
        {
            name: 'lodash',
	        location: 'bower_components/lodash',
	        main: 'lodash'
        },
        {
        	name: "postal",
        	location: "bower_components/postal.js/lib",
        	main: "postal.min"
        }
    ],
    map: {
		'*': {
			'less': 'bower_components/require-less/less' // path to less
		}
	},
	urlArgs: "bust=" +  (new Date()).getTime()
});

require(["apps"]);