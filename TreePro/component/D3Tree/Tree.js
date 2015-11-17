'use strict';
define([
    'd3',
    'jquery',
    'postal',
    'd3menu'
], function(
    d3,
    $,
    postal,
    d3Menu
) {

    function Tree () {
        var instance = {},
            opts = {
                el: "body",                 // 容器
                width: 1000,                    // 宽
                height: 50, 
                duration: 1000,
                lineHeight: 125,
                lineWidth: 100
            };

        // Calculate total nodes, max label length
        var totalNodes = 0;
        var maxLabelLength = 0;
        // variables for drag/drop
        var selectedNode = null;
        var draggingNode = null;
        var currentNode = null;
        // panning variables
        var panSpeed = 200;
        var panBoundary = 20; // Within 20px from edges will pan when dragging.

        // Misc. variables
        var i = 0;

        var data,
            originalData,
            svg,
            paper,
            tree,
            root,
            diagonal;

        var nodes,
            links;
        var dragStarted;
        
        var domNode;
        // 定义画布缩放事件
        var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", function () {
            paper.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        });

        var menu = [
            {
                title: '删除节点',
                action: function(elm, d, i) {
                    instance.removeNode(d);
                }
            }
        ]

        instance.params = function (params) {
            opts = $.extend({}, opts, params);
            // opts.$el = $(opts.el);
            instance.$el = $(opts.el);

            svg = d3
                .select(opts.el)
                .append('svg')
                .attr({
                    width: opts.width,
                    height: opts.height
                })
                .attr("class", "overlay")
                .call(zoomListener);
                
            tree = d3.layout.tree()
                .size([opts.height, opts.width])
                .nodeSize([0, 20]);

            diagonal = d3.svg.diagonal()
                .projection(function(d) { 
                    return [d.y, d.x]; 
                });

            return instance;
        }

        instance.data = function (d) {
            data = d || {
                name: "新节点",
                style: "node-default"
            };

            originalData = $.extend({}, data, {});

            // 递归计算节点数和文字标签最大长度
            (function visit(d) {
                if (!d) return;

                totalNodes++;
                maxLabelLength = Math.max(d.name.length, maxLabelLength);

                var children = d.children && d.children.length > 0 ? d.children : null;
                if (children) {
                    var count = children.length;
                    for (var i = 0; i < count; i++) {
                        visit(children[i]);
                    }
                }
            })(data);

            root = data;
            root.x0 = opts.height / 2;
            root.y0 = 0;

            return instance;
        }

        instance.render = function () {

            paper && paper.remove();
            paper = svg.append("g");
            
            renderNode(root);
            setCenterNode(root);

            return instance;
        }

        // 绘制节点
        function renderNode(source) {
            // Compute the new height, function counts total children of root node and sets tree height accordingly.
            // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
            // This makes the layout more consistent.
            var levelWidth = [1];
            var childCount = function(level, n) {

                if (n.children && n.children.length > 0) {
                    if (levelWidth.length <= level + 1) levelWidth.push(0);

                    levelWidth[level + 1] += n.children.length;
                    n.children.forEach(function(d) {
                        childCount(level + 1, d);
                    });
                }
            };

            childCount(0, root);
            var newHeight = d3.max(levelWidth) * opts.lineHeight; // 25 pixels per line  
                tree = tree.size([newHeight, opts.height]);

            // Compute the new tree layout.
            nodes = tree.nodes(root).reverse();
            links = tree.links(nodes);
            // Set widths between levels based on maxLabelLength.
            nodes.forEach(function(d) {
                // d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
                // alternatively to keep a fixed scale one can set a fixed depth per level
                // Normalize for fixed-depth by commenting out below line
                // d.y = (d.depth * 500); //500px per level.

                d.y = d.depth * opts.lineWidth;
            });

            // Update the nodes…
            var node = paper.selectAll("g.node")
                .data(nodes, function(d) {
                    return d.id || (d.id = ++i);
                });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                .call(dragListener)
                .attr("class", function (d) {
                    return "node " + d.style || "--";
                })
                .attr("transform", function(d) {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                })
                .on('click', click)
                .on('dblclick', dblclick, true)
                .on('contextmenu', d3.contextMenu(menu));

            nodeEnter.append("circle")
                .attr('class', 'nodeCircle')
                .attr("r", 0)
                .style("fill", function(d) {
                    return d._children ? "lightsteelblue" : "rgba(255, 255, 255, 0.2)";
                });

            nodeEnter.append("text")
                .attr("x", function(d) {
                    return d.children || d._children ? -10 : 10;
                })
                .attr("dy", ".35em")
                .attr('class', 'nodeText')
                .attr("text-anchor", function(d) {
                    return d.children || d._children ? "end" : "start";
                })
                .text(function(d) {
                    return d.name;
                })
                .style("fill-opacity", 0);

            // phantom node to give us mouseover in a radius around it
            nodeEnter.append("circle")
                .attr('class', 'ghostCircle')
                .attr("r", 30)
                .attr("opacity", 0.2) // change this to zero to hide the target area
            .style("fill", "red")
                .attr('pointer-events', 'mouseover')
                .on("mouseover", function(node) {
                    selectedNode = node;
                })
                .on("mouseout", function(node) {
                    selectedNode = null;
                });

            // Update the text to reflect whether node has children or not.
            node.select('text')
                .attr("x", function(d) {
                    return d.children || d._children ? -10 : 10;
                })
                .attr("text-anchor", function(d) {
                    return d.children || d._children ? "end" : "start";
                })
                .text(function(d) {
                    return d.name;
                });

            // Change the circle fill depending on whether it has children and is collapsed
            node.select("circle.nodeCircle")
                .attr("r", 4.5)
                .style("fill", function(d) {
                    return d._children ? "lightsteelblue" : "rgba(105, 105, 105, 1)";
                });

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(opts.duration)
                .attr("transform", function(d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            // Fade the text in
            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(opts.duration)
                .attr("transform", function(d) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();

            nodeExit.select("circle")
                .attr("r", 0);

            nodeExit.select("text")
                .style("fill-opacity", 0);

            // Update the links…
            var link = paper.selectAll("path.link")
                .data(links, function(d) {
                    return d.target.id;
                });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function(d) {
                    var o = {
                        x: source.x0,
                        y: source.y0
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                });

            // Transition links to their new position.
            link.transition()
                .duration(opts.duration)
                .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(opts.duration)
                .attr("d", function(d) {
                    var o = {
                        x: source.x,
                        y: source.y
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        function initiateDrag(d, domNode) {
            draggingNode = d;
            d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
            d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
            d3.select(domNode).attr('class', 'node activeDrag');

            paper.selectAll("g.node").sort(function(a, b) { // select the parent and sort the path's
                if (a.id != draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
                else return -1; // a is the hovered element, bring "a" to the front
            });
            // if nodes has children, remove the links and nodes
            if (nodes.length > 1) {
                // remove link paths
                links = tree.links(nodes);
                paper.selectAll("path.link")
                    .data(links, function(d) {
                        return d.target.id;
                    }).remove();
                // remove child nodes
                paper.selectAll("g.node")
                    .data(nodes, function(d) {
                        return d.id;
                    }).filter(function(d, i) {
                        if (d.id == draggingNode.id) {
                            return false;
                        }
                        return true;
                    }).remove();
            }

            // remove parent link
            tree.links(tree.nodes(draggingNode.parent));
            paper.selectAll('path.link').filter(function(d, i) {
                if (d.target.id == draggingNode.id) {
                    return true;
                }
                return false;
            }).remove();

            dragStarted = null;
        }

        // Define the drag listeners for drag/drop behaviour of nodes.
        var dragListener = d3.behavior.drag()
            .on("dragstart", function(d) {
                if (d == root) {
                    return;
                }
                dragStarted = true;
                nodes = tree.nodes(d);
                d3.event.sourceEvent.stopPropagation();
                // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
            })
            .on("drag", function(d) {
                if (d == root) {
                    return;
                }
                if (dragStarted) {
                    domNode = this;
                    initiateDrag(d, domNode);
                }

                // get coords of mouseEvent relative to svg container to allow for panning
                var relCoords = d3.mouse($('svg').get(0));
                if (relCoords[0] < panBoundary) {
                    panTimer = true;
                    pan(this, 'left');
                } else if (relCoords[0] > ($('svg').width() - panBoundary)) {

                    panTimer = true;
                    pan(this, 'right');
                } else if (relCoords[1] < panBoundary) {
                    panTimer = true;
                    pan(this, 'up');
                } else if (relCoords[1] > ($('svg').height() - panBoundary)) {
                    panTimer = true;
                    pan(this, 'down');
                } else {
                    try {
                        clearTimeout(panTimer);
                    } catch (e) {

                    }
                }

                d.x0 += d3.event.dy;
                d.y0 += d3.event.dx;
                var node = d3.select(this);
                node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
                updateTempConnector();
            }).on("dragend", function(d) {
                if (d == root) {
                    return;
                }
                domNode = this;
                if (selectedNode) {
                    // now remove the element from the parent, and insert it into the new elements children
                    var index = draggingNode.parent.children.indexOf(draggingNode);
                    if (index > -1) {
                        draggingNode.parent.children.splice(index, 1);
                    }
                    if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
                        if (typeof selectedNode.children !== 'undefined') {
                            selectedNode.children.push(draggingNode);
                        } else {
                            selectedNode._children.push(draggingNode);
                        }
                    } else {
                        selectedNode.children = [];
                        selectedNode.children.push(draggingNode);
                    }
                    // Make sure that the node being added to is expanded so user can see added node is correctly moved
                    expand(selectedNode);
                    endDrag();
                } else {
                    endDrag();
                }
            });

        function endDrag() {
            selectedNode = null;
            d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');

            // d3.select(domNode).attr('class', 'node -');
            // now restore the mouseover event or we won't be able to drag a 2nd time
            d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
            updateTempConnector();
            if (draggingNode !== null) {
                renderNode(root);
                setCenterNode(draggingNode);
                draggingNode = null;
            }
        }

        // Helper functions for collapsing and expanding nodes.

        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        function expand(d) {
            if (d._children) {
                d.children = d._children;
                d.children.forEach(expand);
                d._children = null;
            }
        }

        // 进入连接圆内进行临时连接
        function updateTempConnector() {
            var data = [];
            if (draggingNode !== null && selectedNode !== null) {
                // have to flip the source coordinates since we did this for the existing connectors on the original tree
                data = [{
                    source: {
                        x: selectedNode.y0,
                        y: selectedNode.x0
                    },
                    target: {
                        x: draggingNode.y0,
                        y: draggingNode.x0
                    }
                }];
            }
            var link = paper.selectAll(".templink").data(data);

            link.enter().append("path")
                .attr("class", "templink")
                .attr("d", d3.svg.diagonal())
                .attr('pointer-events', 'none');

            link.attr("d", d3.svg.diagonal());

            link.exit().remove();
        };

        // 将目标节点移到屏幕中心
        function setCenterNode(source) {
            var scale = zoomListener.scale();
            var x = -source.y0;
            var y = -source.x0;
            x = x * scale + opts.width / 2;
            y = y * scale + opts.height / 2;
            d3.select('g').transition()
                .duration(opts.duration)
                .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
            zoomListener.scale(scale);
            zoomListener.translate([x, y]);

            postal.publish({
                channel: "Tree",
                topic: "node.detail",
                data: _.cloneDeep(source)
            });
        }

        // 展开/合并节点
        function toggleChildren(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else if (d._children) {
                d.children = d._children;
                d._children = null;
            }
            return d;
        }

        // 点击节点
        function click(d) {
            if (d3.event.defaultPrevented) return; // click suppressed
            setCenterNode(d);
            currentNode = d;            
        }

        function dblclick(d) {

            if (d3.event.defaultPrevented) return; // click suppressed
            d = toggleChildren(d);
            renderNode(d);

            d3.event.stopPropagation();
        }

        instance.addNode = function (n, p) {
            if(!p) return;

            n.id = nodes.length + 1;
            p.parent = p;
            p.children ? p.children.push(n) : p.children = [n];
            nodes.push(n);

            renderNode(root);
            setCenterNode(_.findWhere(nodes, { 'id': n.id }) || root);

            return instance;
        }

        instance.removeNode = function (node) {
            if(node.parent){
                node.parent.children.splice(_.findIndex(node.parent.children, {id: node.id}), 1);
                renderNode(root);
            }else{
                console.log('根节点不允许删除');
            }
            return instance;
        }

        instance.updateNode = function (node) {
            return instance;
        }

        var newNode = null;
        var linkNode = null;
        postal.subscribe({
            channel: "Tree",
            topic: "node.dragstart",
            callback: function(data) {
                newNode = paper.append("g")
                    .attr("class", "node");

                newNode.append("path")
                    .attr("class", "addtemplink");

                newNode.append("circle")
                    .attr({
                        cx: 0,
                        cy: 0,
                        r: 4.5,
                        opacity: 0
                    });
            }
        });

        postal.subscribe({
            channel: "Tree",
            topic: "node.draging",
            callback: function(event) {
                var translate = zoomListener.translate(),
                    scale = zoomListener.scale();

                var x = (event.offsetX - translate[0]) / scale,
                    y = (event.offsetY - translate[1]) / scale;

                newNode.select("circle").attr({
                    cx: x,
                    cy: y,
                    opacity: 1
                });

                var minArys = nodes.map(function (d, i) {
                    var a = d.y0 - x,
                        b = d.x0 - y;
                    return Math.sqrt(a * a + b * b);
                });

                var minDistance = minArys.indexOf(d3.min(minArys, function (n, i) { return n; }));
                linkNode = nodes[minDistance];

                var newlink = newNode.selectAll(".addtemplink")
                    .data([{
                        source: {
                            x: linkNode.y0,
                            y: linkNode.x0
                        },
                        target: {
                            x: x,
                            y: y
                        }
                    }]);

                newlink.enter().append("path")
                    .attr("class", "addtemplink")
                    .attr("d", d3.svg.diagonal())
                    .attr('pointer-events', 'none');

                newlink.attr("d", d3.svg.diagonal());

                newlink.exit().remove();
            }
        });

        postal.subscribe({
            channel: "Tree",
            topic: "node.dragend",
            callback: function(data) {
                newNode.remove();
                instance.addNode(data, linkNode);
            }
        });

        postal.subscribe({
            channel: "Tree",
            topic: "node.update",
            callback: function (data) {
                _.findWhere(nodes, { 'id': data.node.id })[data.key] = data.node[data.key];

                renderNode(root);
                setCenterNode(_.findWhere(nodes, { 'id': data.node.id }) || root);
            }
        });

        return instance;
    }

    return Tree;

});
