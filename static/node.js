class Node {
    constructor(name, description, x, y) {
        this.name = name;
        this.description = description;
        this.x = x;
        this.y = y;
        this.isExpanded = false;
        this.originalRadius = 10;
        this.expandedWidth = 200;
        this.expandedHeight = 100;
        this.radius = this.originalRadius;
    }
}
