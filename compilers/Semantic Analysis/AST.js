class AbstractSyntaxTree {
    root = null;
    currentNode = null;
    newNode;
    scopeTable = new Map();
    currentScope;
    moveUp() {
        if ((this.currentNode.parent !== null) && (this.currentNode.parent.name !== undefined)) {
            this.currentNode = this.currentNode.parent;
        }
        else {
            // TODO: Some sort of error logging.
            // This really should not happen, but it will, of course.
        }
    }
    addNode(kind, label, line, char) {
        this.newNode = new TreeNode();
        this.newNode.name = label;
        this.newNode.children = [];
        //Added line and character to the tree for output in the scopeChecker function
        this.newNode.line = line;
        this.newNode.character = char;
        if (this.root == null) {
            this.root = this.newNode;
            this.newNode.parent = null;
        }
        else {
            this.newNode.parent = this.currentNode;
            this.newNode.parent.children.push(this.newNode);
        }
        if (kind != "leaf") {
            this.currentNode = this.newNode;
        }
    }
    depth2 = [];
    toString() {
        // Initialize the result string.
        var traversalResult = "";
        let depth3 = [];
        // Recursive function to handle the expansion of the nodes.
        function expand(node, depth) {
            // Space out based on the current depth so
            // this looks at least a little tree-like.
            for (var i = 0; i < depth; i++) {
                traversalResult += "-";
            }
            // If there are no children (i.e., leaf nodes)...
            if (!node.children || node.children.length === 0) {
                // ... note the leaf node.
                depth3.push(node);
                traversalResult += "[" + node.name + "]";
                traversalResult += "\n";
            }
            else {
                // There are children, so note these interior/branch nodes and ...
                depth3.push(node);
                traversalResult += "<" + node.name + "> \n";
                // .. recursively expand them.
                for (var i = 0; i < node.children.length; i++) {
                    expand(node.children[i], depth + 1);
                }
            }
        }
        // Make the initial call to expand from the root.
        expand(this.root, 0);
        // Return the result.
        this.depth2 = depth3;
        return traversalResult;
    }
    ;
}
//# sourceMappingURL=AST.js.map