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
  id: '1',
  children: [{name: '非洲游', id: '15'},{
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

 
 const R = 30
 const width = 960
 const height = 960
 const fontSize = 12
 const dx = 10
 const dy = 160
  
 function separation(a, b) {
   if (a.parent === b.parent) {
     return ((2*R + 1)*(a.value + b.value)/2) / dx
   } else {
     return 2
   }
 }

class Tree {
  constructor(selector) {
    this.data = null;
    this.root = null;
    this.container = selector ? document.querySelector(selector) : document.querySelector('body');
    
    this.tree = d3.tree().nodeSize([dx, dy]).separation(separation)
    this.diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x)

    this.eventEmitter = Object.create(null);

    // 事件绑定
    this.handleNodeClick = this.handleNodeClick.bind(this)
    this.handleEditClick = this.handleEditClick.bind(this)
    this.handleAddClick = this.handleAddClick.bind(this)
    this.handleDeleteClick = this.handleDeleteClick.bind(this)
    this.handleToggleCollapseClick = this.handleToggleCollapseClick.bind(this)
  }

  /************************************************************ 
   * eventEmitter
   * type: edit, add, delete
   ************************************************************/

  on(type, fn) {
    if (this.eventEmitter[type]) {
      this.eventEmitter[type].push(fn)
    } else {
      this.eventEmitter[type] = [fn];
    }
  }

  clearEventEmitter() {
    this.eventEmitter = null;
  }

  /************************************************************ 
   * 初始化
   ************************************************************/

  init(data) {
    this.data = data;
    this.initRoot(data);
    this.initSVG();
    if (this.root) {
      this.render(this.root)
    }
  }

  /************************************************************ 
   * 初始化root
   ************************************************************/

  initRoot() {
    const root = d3.hierarchy(this.data).count();

    root.x0 = dy / 2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
      d.id = d.data.id ? d.data.id : i;
      d._children = d.children;
    });

    this.root = root;
  }

  /************************************************************ 
   * 初始化SVG
   ************************************************************/

  initSVG() {
    this.svg = d3.create("svg")
        .style("font", "12px sans-serif")
        .style("user-select", "none");
  
    this.gLink = this.svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5);
  
    this.gNode = this.svg.append("g")
        .attr("cursor", "pointer");
    
    this.container.appendChild(this.svg.node());
  }

  /************************************************************ 
   * 更新树
   ************************************************************/

  update(data, d) {
    this.data = data;
    this.initRoot()
    this.render(d)
  }

  render(source) {
    const root = this.root;

    // Compute the new tree layout.
    this.tree(root);

    this.updateTransition();

    // Update the nodes…
    this.updateNodes(source);

    // Update the links…
    this.updateLinks(source);

    // Stash the old positions for transition.
    root.eachBefore(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  updateTransition() {
    const svg = this.svg;
    const duration = d3.event && d3.event.altKey ? 2500 : 250;
    const height = this.height(); // svg height
    const svgTranslateX = 2 * R;
    const svgTranslateY = height/2 - R;
    
    this.transition = this.svg.transition()
        .duration(duration)
        .attr("height", height)
        .attr("viewBox", [-svgTranslateX, -svgTranslateY, width, height])
        .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));
  }

  updateNodes(source) {
    const transition = this.transition;
    const nodes = this.root.descendants().reverse();
    const node = this.gNode.selectAll("g")
      .data(nodes, d => d.id);

    // if showToolkit is true, show toolkit
    const withToolKit = node.filter(d => d.showToolkit === true)
    this.addOperationButtonToNode(withToolKit)

    // Enter any new nodes at the parent's previous position.
    const nodeEnter = node.enter().append("g")
        .attr("transform", d => `translate(${source.y0},${source.x0})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .on("click", this.handleNodeClick);

    nodeEnter.append("circle")
        .attr("r", R)
        .attr("fill", d => d._children ? "#555" : "#999");

    nodeEnter.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => -(d.data.name.length * fontSize / 2))
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
  }

  updateLinks(source) {
    const transition = this.transition;
    const links = this.root.links();
    const link = this.gLink.selectAll("path")
      .data(links, d => d.target.id);

    // Enter any new links at the parent's previous position.
    const linkEnter = link.enter().append("path")
        .attr("d", d => {
          const o = {x: source.x0, y: source.y0};
          return this.diagonal({source: o, target: o});
        });

    // Transition links to their new position.
    link.merge(linkEnter).transition(transition)
        .attr("d", this.diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition(transition).remove()
        .attr("d", d => {
          const o = {x: source.x, y: source.y};
          return this.diagonal({source: o, target: o});
        });
  }

  /************************************************************ 
   * 公共函数，可提取出去
   ************************************************************/

  height() {
    if (this.root.value) {
      return (2*R + dx/2) * this.root.value + 2*R
    } else {
      return height
    }
  }

  /************************************************************ 
   * 事件处理函数，可提取出去
   ************************************************************/

  // 节点点击事件
  handleNodeClick(d) {
    // toggle toolkit
    this.toggleToolkit(d);
    this.render(d);
  }
  // 编辑
  handleEditClick(d) {
    const editFnArr = this.eventEmitter.edit;
    if (editFnArr) {
      editFnArr.forEach(fn => fn.call(null, d))
    }
  }
  // 添加 
  handleAddClick(d) {
    const addFnArr = this.eventEmitter.add;
    if (addFnArr) {
      addFnArr.forEach(fn => fn.call(null, d))
    }
  }
  // 删除 
  handleDeleteClick(d) {
    const deleteFnArr = this.eventEmitter.delete;
    if (deleteFnArr) {
      deleteFnArr.forEach(fn => fn.call(null, d))
    }
  }
  // toggle collapse
  handleToggleCollapseClick(d) {
    this.toggleCollapse(d);
  }

  /************************************************************ 
   * 数据操作，可提取出去
   ************************************************************/

  // 展开/收起子树
  toggleCollapse(d) {
    d.children = d.children ? null : d._children;
    this.render(d)
  }

  // 展开/收起操作按钮
  toggleToolkit(d) {
    d.showToolkit = d.showToolkit ? false : true;
  }

  /************************************************************ 
   * 节点操作，可提取出去
   ************************************************************/
  
  // 给node添加操作按钮
  addOperationButtonToNode(node) {
    if (!node) throw new TypeError('need valid node')
    
    // 左下 编辑
    const LBG = node.append('g').on('click', this.handleEditClick)
    LBG.append('circle')
      .attr("r", R/2)
      .attr('fill', '#ccc')
      .attr("cx", -1.1*R)
      .attr("cy", R)
    LBG.append('text').text('编辑')
    .attr("x", -(R + fontSize))
    .attr("y", 0.7*R + fontSize)
    // 右下 添加
    const RBG = node.append('g').on('click', this.handleAddClick)
    RBG.append('circle')
      .attr("r", R/2)
      .attr('fill', '#ccc')
      .attr("cx", 1.1*R)
      .attr("cy", R)
    RBG.append('text').text('添加')
    .attr("x", 0.5*R + fontSize)
    .attr("y", 0.7*R + fontSize)
    // 右 展开
    const RG = node.append('g').on('click', this.handleToggleCollapseClick)
    RG.append('circle')
      .attr("r", R/2)
      .attr('fill', '#ccc')
      .attr("cx", R + R/2)
    RG.append('text')
    .text('展开')
    .attr("x", R)
    // 左 删除
    const LG = node.append('g').on('click', this.handleDeleteClick)
    LG.append('circle')
      .attr("r", R/2)
      .attr('fill', 'red')
      .attr("cx", -(R + R/2))
    LG.append('text').text('删除')
    .attr("x", -(R + 2*fontSize))
  }
}

class App extends React.Component {
  constructor() {
    super();
    this.treeInstance = null;

    this.handleAddClick = this.handleAddClick.bind(this)
  }

  componentDidMount() {
    this.treeInstance = new Tree('#tree')
    this.treeInstance.init(data)
    this.treeInstance.on('add', this.handleAddClick)
  }

  render() {
    return (
      <div>
        <div id="tree"></div>
      </div>
    )
  }

  handleAddClick(d) {
    console.log(d.data.name)
    this.treeInstance.update(newData, d)
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
)
