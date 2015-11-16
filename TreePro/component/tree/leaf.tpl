<li>
    <!-- click: toggle, dblclick: changeType -->
    <div v-class="bold: isFolder" v-on="dblclick: toggle" class="parent-node">
    	<span>
	        <span v-if="isFolder" class="open-icon">{{open ? '-' : '+'}}</span>
	        {{model.name}}
        </span>
    </div>
    <ul v-show="open" v-if="isFolder" class="child-node">
        <item class="item" v-repeat="model: model.children"></item>
        <li v-on="click: addChild"><div class="append-node">+</div></li>
    </ul>
</li>