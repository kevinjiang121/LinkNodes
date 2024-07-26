class GraphNode {
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
        this.edgeHandleRadius = 10;
    }

    draw(ctx, hovered, zoom) {
        const adjustedRadius = this.radius * zoom;
        const adjustedEdgeHandleRadius = this.edgeHandleRadius * zoom;

        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, adjustedRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.fillText(this.name, this.x - 10, this.y - 15);

        if (hovered) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, adjustedRadius + adjustedEdgeHandleRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = '#888';
            ctx.stroke();
        }
        ctx.restore();
    }

    isOverEdgeHandle(x, y, zoom) {
        const distance = Math.hypot(this.x - x, this.y - y) / zoom;
        return distance > this.radius && distance < this.radius + this.edgeHandleRadius;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
}
