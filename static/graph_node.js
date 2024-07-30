class GraphNode {
    constructor(name, description, x, y) {
        this.name = name;
        this.description = description;
        this.x = x;
        this.y = y;
        this.radius = 10; // Default radius
        this.edgeHandleRadius = 10; // Radius for edge handle detection
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

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    isOverEdgeHandle(x, y, zoom) {
        const distance = Math.hypot(this.x - x, this.y - y);
        const adjustedRadius = this.radius * zoom;
        const adjustedEdgeHandleRadius = this.edgeHandleRadius * zoom;
        return distance > adjustedRadius && distance < adjustedRadius + adjustedEdgeHandleRadius;
    }

    isUnderCursor(x, y, zoom) {
        const distance = Math.hypot(this.x - x, this.y - y);
        const adjustedRadius = this.radius * zoom;
        return distance < adjustedRadius;
    }

    doubleEdgeHandleRadius() {
        this.edgeHandleRadius *= 2;
    }
}
