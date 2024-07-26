class GraphEdge {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }

    draw(ctx, nodes, offsetX, offsetY, zoom) {
        const fromNode = nodes.find(node => node.name === this.from);
        const toNode = nodes.find(node => node.name === this.to);
        if (fromNode && toNode) {
            ctx.save();
            ctx.translate(offsetX, offsetY);
            ctx.scale(zoom, zoom);

            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.strokeStyle = '#000';
            ctx.stroke();
            ctx.restore();
        }
    }
}
