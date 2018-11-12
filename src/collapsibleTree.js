(function() {
  let root = null;
  const width = 960
  const dx = 10
  const dy = 160
  const R = 30
  const fontSize = 12
  
  let leafCount = 0
  const calcHeight = (R, dx, leafCount) => (2*R + dx/2) * leafCount + 2*R
  const calcSVGTranslateX = R => 2*R
  const calcSVGTranslateY = (R, dx, leafCount) => calcHeight(R, dx, leafCount)/2 - R
  const textTranslateX = d => -(d.data.name.length * fontSize / 2)

  const separation = (R, dx) => (a, b) => {
    if (a.parent === b.parent) {
      return ((2*R + 1)*(a.value + b.value)/2) / dx
    } else {
      return 2
    }
  }

  const tree = d3.tree().nodeSize([dx, dy]).separation(separation(R, dx))
  const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x)

  const data = {
    name: '地点',
    id: '1',
    children: [{
      name: '欧洲游',
      id: '11',
      children: [{
        name: '挪威游',
        id: '111'
      }, {
        name: '冰岛游',
        id: '112'
      }]
    }, {
      name: '北美游',
      id: '12',
      children: [{
        name: '美国游',
        id: '121',
        children: [{
          name: '加州游',
          id: '1211'
        }, {
          name: '纽约游',
          id: '1212'
        }]
      }, {
        name: '加拿大游',
        id: '122'
      }]
    }, {
      name: '亚洲游',
      id: '13',
      children: [{
        name: '日本游',
        id: '131'
      }, {
        name: '韩国游',
        id: '132'
      }, {
        name: '新马泰游',
        id: '133'
      }]
    }]
  }

  const newData = {
    name: '地点',
    children: [{
      name: '欧洲游',
      children: [{
        name: '挪威游'
      }, {
        name: '冰岛游'
      }]
    }, {
      name: '北美游',
      children: [{
        name: '美国游',
        children: [{
          name: '加州游'
        }, {
          name: '纽约游'
        }]
      }, {
        name: '加拿大游'
      }]
    }, {
      name: '亚洲游',
      children: [{
        name: '日本游'
      }, {
        name: '韩国游'
      }, {
        name: '新马泰游'
      }]
    }, {
      name: '非洲游',
      children: [{
        name: '刚果游'
      }]
    }]
  }

  const chart = () => {
    // node operation
    // collapse
    const toggleCollapse = d => {
      d.children = d.children ? null : d._children;
      update(d)
    }
    // toggle toolkit
    const toggleToolkit = d => {
      d.showToolkit = d.showToolkit ? false : true;
    }
    // edit
    const handleEditClick = d => {
      console.log("node id: ", d.id, ' action: edit')
    }
    // add 
    const handleAddClick = d => {
      console.log("node id: ", d.id, ' action: add')
      root = getRoot(newData);
      update(d);
    }
    // delete 
    const handleDeleteClick = d => {
      console.log("node id: ", d.id, ' action: delete')
    }
    // toggle collapse
    const handleToggleCollapseClick = d => {
      console.log("node id: ", d.id, ' action: toggle collapse')
      toggleCollapse(d)
    }
  
    // 事件
    const handleNodeClick = d => {
      // toggle toolkit
      toggleToolkit(d);
      update(d);
    }
  
    // 给所有node添加操作节点
    const addOpNode = (node) => {
      if (!node) throw new TypeError('need valid node')
      // 左下 编辑
      const LBG = node.append('g').on('click', handleEditClick)
      LBG.append('circle')
        .attr("r", R/2)
        .attr('fill', '#ccc')
        .attr("cx", -1.1*R)
        .attr("cy", R)
      LBG.append('text').text('编辑')
      .attr("x", -(R + fontSize))
      .attr("y", 0.7*R + fontSize)
      // 右下 添加
      const RBG = node.append('g').on('click', handleAddClick)
      RBG.append('circle')
        .attr("r", R/2)
        .attr('fill', '#ccc')
        .attr("cx", 1.1*R)
        .attr("cy", R)
      RBG.append('text').text('添加')
      .attr("x", 0.5*R + fontSize)
      .attr("y", 0.7*R + fontSize)
      // 右 展开
      const RG = node.append('g').on('click', handleToggleCollapseClick)
      RG.append('circle')
        .attr("r", R/2)
        .attr('fill', '#ccc')
        .attr("cx", R + R/2)
      RG.append('text')
      .text('展开')
      .attr("x", R)
      // 左 删除
      const LG = node.append('g').on('click', handleDeleteClick)
      LG.append('circle')
        .attr("r", R/2)
        .attr('fill', 'red')
        .attr("cx", -(R + R/2))
      LG.append('text').text('删除')
      .attr("x", -(R + 2*fontSize))
    }

    function getRoot(data) {
      const root = d3.hierarchy(data);
      root.count()
      leafCount = root.value;
  
      root.x0 = dy / 2;
      root.y0 = 0;
      root.descendants().forEach((d, i) => {
        d.id = d.data.id ? d.data.id : i;
        d._children = d.children;
      });

      return root;
    }
  
    const svg = d3.create("svg")
        .style("font", "12px sans-serif")
        .style("user-select", "none");
  
    const gLink = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5);
  
    const gNode = svg.append("g")
        .attr("cursor", "pointer");
    
    root = getRoot(data);
  
    function update(source) {
      const duration = d3.event && d3.event.altKey ? 2500 : 250;
      const nodes = root.descendants().reverse();
      const links = root.links();
  
      // Compute the new tree layout.
      tree(root);
  
      // svg height
      const height = calcHeight(R, dx, leafCount)
      const svgTranslateX = calcSVGTranslateX(R)
      const svgTranslateY = calcSVGTranslateY(R, dx, leafCount)
  
      const transition = svg.transition()
          .duration(duration)
          .attr("height", height)
          .attr("viewBox", [-svgTranslateX, -svgTranslateY, width, height])
          .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));
  
      // Update the nodes…
      const node = gNode.selectAll("g")
        .data(nodes, d => d.id);

      // if showToolkit is true, show toolkit
      const withToolKit = node.filter(d => d.showToolkit === true)
      addOpNode(withToolKit)
  
      // Enter any new nodes at the parent's previous position.
      const nodeEnter = node.enter().append("g")
          .attr("transform", d => `translate(${source.y0},${source.x0})`)
          .attr("fill-opacity", 0)
          .attr("stroke-opacity", 0)
          .on("click", handleNodeClick);
  
      nodeEnter.append("circle")
          .attr("r", R)
          .attr("fill", d => d._children ? "#555" : "#999");
  
      nodeEnter.append("text")
          .attr("dy", "0.31em")
          .attr("x", textTranslateX)
          .text(d => d.data.name)
        .clone(true).lower()
          .attr("stroke-linejoin", "round")
          .attr("stroke-width", 3)
          .attr("stroke", "white");
  
      // Transition nodes to their new position.
      const nodeUpdate = node.merge(nodeEnter).transition(transition)
          .attr("transform", d => `translate(${d.y},${d.x})`)
          .attr("fill-opacity", 1)
          .attr("stroke-opacity", 1);
  
      // Transition exiting nodes to the parent's new position.
      const nodeExit = node.exit().transition(transition).remove()
          .attr("transform", d => `translate(${source.y},${source.x})`)
          .attr("fill-opacity", 0)
          .attr("stroke-opacity", 0);
  
      // Update the links…
      const link = gLink.selectAll("path")
        .data(links, d => d.target.id);
  
      // Enter any new links at the parent's previous position.
      const linkEnter = link.enter().append("path")
          .attr("d", d => {
            const o = {x: source.x0, y: source.y0};
            return diagonal({source: o, target: o});
          });
  
      // Transition links to their new position.
      link.merge(linkEnter).transition(transition)
          .attr("d", diagonal);
  
      // Transition exiting nodes to the parent's new position.
      link.exit().transition(transition).remove()
          .attr("d", d => {
            const o = {x: source.x, y: source.y};
            return diagonal({source: o, target: o});
          });
  
      // Stash the old positions for transition.
      root.eachBefore(d => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }
  
    update(root);
  
    return svg.node();
  }

  const node = chart()
  document.querySelector('#tree').appendChild(node)

})()
