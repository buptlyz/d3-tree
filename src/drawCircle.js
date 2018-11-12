(function() {
  var svg = d3.select("svg"),
    radius = 32;

  var circles = d3.range(20).map(function(i) {
    return {
      x: i > 10 ? (i-10)*100+100 : i*100+100,
      y: i > 10 ? 200 : 600
    };
  });
  console.log("circles: ", circles)
  
  var color = d3.scaleOrdinal()     // 创建一个序数比例尺。
      .range(d3.schemeCategory20);  // 20种分类颜色

  var circle = svg.selectAll("g")   // 从文档中选择多个元素
    .data(circles)                  // 元素和数据绑定
    .enter().append("g")            // 获得进入（enter）选择器（数据无元素）  selection.append: 创建，添加或选择新的元素
      .call(d3.drag()               // 选择器调用指定的方法
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));
  
  circle.append("circle")
      .attr("clip-path", function(d, i) { return "url(#clip-" + i + ")"; })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", radius)
      .style("fill", function(d, i) { return color(i); });

  function dragstarted(d) {
    d3.select(this).raise().classed("active", true);
  }
  
  function dragged(d) {
    d3.select(this).select("circle").attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
  }
  
  function dragended(d, i) {
    d3.select(this).classed("active", false);
  }
})()
