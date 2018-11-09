/**
 * @param data hierarchyData
 */

class Tree {
  constructor(data) {
    this.data = data

    this.root = null                                  // tree layout

    this.SVGWidth = 932;                              // SVG的宽
    this.SVGHeight = 'auto';                          // SVG的高

    this.dx = 10                                      // x axis 步长
    this.dy = 10                                      // y axis 步长

    this.leafNumber = 0;                              // 叶节点数目
    this.nodeRadius = 50;                             // 节点半径
    this.fontSize = 12                                // 节点文本 fontSize
  }

  // constructs root node from the specified hierarchical data
  constructRootNode(data) {
    const root = d3.hierarchy(data) // 生成分层数据
      .sort((a, b) => (a.height - b.height) || a.data.name.localeCompare(b.data.name));  // 按节点后代层级数升序排列(叶节点在前)， 或者按节点name升序排列    
    root.dx = 10
    root.dy = this.SVGWidth/(root.height + 1);
    
    return root;
  }

  // create a new tree layout
  createTree(rootNode) {
    return d3.tree().nodeSize([root.dx, root.dy]).separation(separation)(rootNode); 
  }

  calcRootDy() {
    return this.SVGWidth / (this.root.height + 1);
  }

  isLeaf(node) {
    return node.height === 0;
  }

  separation(nodeA, nodeB) {
    if (nodeA.parent === nodeB.parent) {
      const aChildrenCount = this.isLeaf(nodeA) ? 1 : nodeA.children.length
      const bChildrenCount = this.isLeaf(nodeB) ? 1 : nodeB.children.length

      const separation = (2 * this.nodeRadius / this.dx + 0.5) * (aChildrenCount + bChildrenCount) / 2;

      return separation
    }

    return 2;
  }

  CalcSVGHeight() {
    return (2 * this.nodeRadius + this.dx / 2) * this.leafNumber;
  }

  treeTranslateX() {
    return this.nodeRadius;
  }
  
  treeTranslateY() {
    return this.SVGHeight() / 2 - this.nodeRadius;
  }

  nodeTextTranslateX = d => -(d.data.name.length * fontSize / 4)
}
