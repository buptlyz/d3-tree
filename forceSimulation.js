(function() {
  // 所有的点
  var nodes = [ { index: 0 },
    { index: 1 },
    { index: 2 },
    { index: 3 },
    { index: 4 },
    { index: 5 },
    { index: 6 },
    { index: 7 },
    { index: 8 },
    { index: 9 } ];
  
  // 所有的关系
  var links = [
    {source: 0, target: 1}, {source: 0, target: 2}, {source: 0, target: 3},   // 根节点 -> 第一层子节点
    {source: 1, target: 4}, {source: 1, target: 5},                           // 第一子树
    {source: 2, target: 6}, {source: 2, target: 7}, {source: 2, target: 8},   // 第二子树
    {source: 3, target: 9}                                                    // 第三子树
  ];
  
  var simulation = d3
      .forceSimulation(nodes)                                       // 创建一个力模拟
      .force("charge", d3.forceManyBody())                          //   添加力  d3.forceManyBody: 创建多体力
      .force("link", d3.forceLink(links).distance(20).strength(1))  //          d3.forceLink:创建连接力  link.distance:设置连接距离  link.strength:设置连接强度
      .force("x", d3.forceX())                                      //          创建x-定位力
      .force("y", d3.forceY())                                      //          创建y-定位力
      .on("tick", ticked);                                          //   添加或移除事件监听器
  
  var canvas = document.querySelector("canvas"),
      context = canvas.getContext("2d"),
      width = canvas.width,
      height = canvas.height;
  
  d3.select(canvas)               // 从文档中选择一个元素
    .call(                        //  selection.call: 选择器调用指定的方法
      d3.drag()                   //    创建一个拖曳行为    
        .container(canvas)        //      drag.container: 设置坐标系统
        .subject(dragsubject)     //      设置被拖曳对象
        .on("start", dragstarted) //      监听拖曳事件
        .on("drag", dragged)
        .on("end", dragended)
    );
  
  function ticked() {
    context.clearRect(0, 0, width, height);
    context.save();
    context.translate(width / 2, height / 2);
  
    context.beginPath();
    links.forEach(drawLink);
    context.strokeStyle = "#aaa";
    context.stroke();
  
    context.beginPath();
    nodes.forEach(drawNode);
    context.fill();
    context.strokeStyle = "#fff";
    context.stroke();
  
    context.restore();
  }
  
  function dragsubject() {
    return simulation.find(d3.event.x - width / 2, d3.event.y - height / 2);
  }
  
  function dragstarted() {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
  }
  
  function dragged() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
  }
  
  function dragended() {
    if (!d3.event.active) simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
  }
  
  function drawLink(d) {
    context.moveTo(d.source.x, d.source.y);
    context.lineTo(d.target.x, d.target.y);
  }
  
  function drawNode(d) {
    context.moveTo(d.x + 3, d.y);
    context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
  }
})()
