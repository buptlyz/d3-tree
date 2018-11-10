(function() {
  let leafCount = 0;
  const width = 932;
  const R = 50
  const dx = 10
  const fontSize = 12

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
        name: 'level-2-6'
      }]
    }]
  }

  const separation = (a, b) => {
    if (a.parent === b.parent) {
      // 同一层级
      const aChildrenCount = a.height === 0 ? 1 : a.children.length
      const bChildrenCount = b.height === 0 ? 1 : b.children.length

      const separation = (2*R/dx + 0.5) * (aChildrenCount + bChildrenCount) / 2

      return separation
    }

    return 2;
  }

  const calcHeight = (R, dx, leafCount) => (2*R + dx/2) * leafCount
  const svgTranslateX = R => R
  const svgTranslateY = (R, dx, leafCount) => calcHeight(R, dx, leafCount)/2 - R

  const textTranslateX = d => -(d.data.name.length * fontSize / 4)

  const tree = data => {
    const root = d3.hierarchy(data) // 生成分层数据
        .sort((a, b) => (a.height - b.height) || a.data.name.localeCompare(b.data.name));  // 按节点后代层级数升序排列(叶节点在前)， 或者按节点name升序排列
    root.dx = dx;
    root.dy = width / (root.height + 1);
    // return d3.cluster().nodeSize([root.dx, root.dy])(root);
    
    return d3.tree()
    .nodeSize([root.dx, root.dy])
    .separation(separation)(root);
  };

  const chart = () => {
    const root = tree(data);
    console.log("root: ", root)
  
    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
      if (d.height === 0) leafCount++
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
      // const temp = d.x
      // d.x = d.y
      // d.y = temp
    });
    console.log("x0: ", x0, "x1: ", x1)
    console.log("leafCount: ", leafCount)
  
    console.log('svg height: ', calcHeight(R, dx, leafCount))
    d3.select('#tree').append('svg');
    const svg = d3.select('#tree svg'/*DOM.svg(width, x1 - x0 + root.dx * 2)*/)
        .style("width", "100%")
        .style("height", calcHeight(R, dx, leafCount));      // 高度为叶节点数目 * (2R + dx/2)
  
    const g = svg.append("g")                     // tree的g
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        // .attr("transform", `translate(${root.dy / 3},${root.dx - x0})`);
        .attr("transform", `translate(${svgTranslateX(R)},${svgTranslateY(R, dx, leafCount)})`);
    
    console.log("links: ", root.links())
    const link = g.append("g")      // link的g
      .attr("fill", "none")         // 填充 
      .attr("stroke", "#555")       // 描边 color
      .attr("stroke-opacity", 0.4)  // 描边 opacity
      .attr("stroke-width", 1.5)    // 描边 width
    .selectAll("path")
      .data(root.links())
      .enter().append("path")
        .attr("d", d => `
          M${d.target.y},${d.target.x}
          C${d.source.y + root.dy / 2},${d.target.x}
           ${d.source.y + root.dy / 2},${d.source.x}
           ${d.source.y},${d.source.x}
        `);  // M moveTo   C curveTo
  
    const node = g.append("g")                                // node的g
        .attr("stroke-linejoin", "round")                     // 画笔在转角如何展示 miter round bevel
        .attr("stroke-width", 3)
      .selectAll("g")
      .data(root.descendants().reverse())                     // 所有节点
      .enter().append("g")
        .attr("transform", d => `translate(${d.y},${d.x})`);  // node 位置
  
    node.append("circle")
        .attr("fill", d => d.children ? "#999" : "#999")  // circle color
        .attr("r", R);                                   // circle r
  
    node.append("text")
        .attr("y", "0.31em")                             // y axis translate
        .attr('font-size', fontSize)
        .attr("x", textTranslateX)              // x axis translate
        .text(d => d.data.name)
      .filter(d => d.children)
      .clone(true).lower()
        .attr("stroke", "white");                         // text color
  
    return svg.node();
  }

  chart()
})()
