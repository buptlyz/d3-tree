(function() {
  const margin = ({top: 10, right: 120, bottom: 10, left: 40})
  const width = 960
  const dx = 10
  const dy = width / 6
  const R = 30
  const fontSize = 12
  
  let leafCount = 0
  const calcHeight = (R, dx, leafCount) => (2*R + dx/2) * leafCount
  const calcSVGTranslateX = R => R
  const calcSVGTranslateY = (R, dx, leafCount) => calcHeight(R, dx, leafCount)/2 - R
  const textTranslateX = d => -(d.data.name.length * fontSize / 4)

  const separation = (R, dx) => (a, b) => {
    if (a.parent === b.parent) {
      // 同一层级
      const aChildrenCount = a.height === 0 ? 1 : a._children.length
      const bChildrenCount = b.height === 0 ? 1 : b._children.length

      const separation = (2*R/dx + 0.5) * (aChildrenCount + bChildrenCount) / 2

      return separation
    }

    return 2;
  }

  const tree = d3.tree().nodeSize([dx, dy]).separation(separation(R, dx))
  const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x)

  const data = {
    name: 'root',
    children: [{
      name: 'level-1-1',
      children: [{
        name: 'level-2-1'
      }]
    }, {
      name: 'level-1-2',
      children: [{
        name: 'level-2-2'
      }, {
        name: 'level-2-3'
      }]
    }, {
      name: 'level-1-3',
      children: [{
        name: 'level-2-4'
      }, {
        name: 'level-2-5'
      }, {
        name: 'level-2-5'
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
      // 上 编辑
      const topG = node.append('g').on('click', handleEditClick)
      topG.append('circle')
        .attr("r", R/2)
        .attr('fill', '#ccc')
        .attr("cy", -(R + R/2))
      topG.append('text').text('编辑')
      .attr("y", -(R + fontSize))
      // 下 添加
      const bottomG = node.append('g').on('click', handleAddClick)
      bottomG.append('circle')
        .attr("r", R/2)
        .attr('fill', '#ccc')
        .attr("cy", R + R/2)
      bottomG.append('text').text('添加')
      .attr("y", R + fontSize)
      // 右 展开
      const rightG = node.append('g').on('click', handleToggleCollapseClick)
      rightG.append('circle')
        .attr("r", R/2)
        .attr('fill', '#ccc')
        .attr("cx", R + R/2)
      rightG.append('text')
      .text('展开')
      .attr("x", R)
      // 左 删除
      const leftG = node.append('g').on('click', handleDeleteClick)
      leftG.append('circle')
        .attr("r", R/2)
        .attr('fill', 'red')
        .attr("cx", -(R + R/2))
      leftG.append('text').text('删除')
      .attr("x", -(R + 2*fontSize))
    }

    const root = d3.hierarchy(data);
  
    root.x0 = dy / 2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
      if (d.height === 0) leafCount++
      d.id = i;
      d._children = d.children;
      if (d.depth && d.data.name.length !== 7) d.children = null;
    });
  
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", dx)
        .attr("viewBox", [-margin.left, -margin.top, width, dx])
        .style("font", "10px sans-serif")
        .style("user-select", "none");
  
    const gLink = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5);
  
    const gNode = svg.append("g")
        .attr("cursor", "pointer");
  
    function update(source) {
      const duration = d3.event && d3.event.altKey ? 2500 : 250;
      const nodes = root.descendants().reverse();
      const links = root.links();
  
      // Compute the new tree layout.
      tree(root);
  
      let left = root;
      let right = root;
      root.eachBefore(node => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
      });
  
      // svg height
      // const height = right.x - left.x + margin.top + margin.bottom;
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
          // .attr("x", d => d._children ? -6 : 6)
          .attr("x", textTranslateX)
          // .attr("text-anchor", d => d._children ? "end" : "start")
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
