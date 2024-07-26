class Graph {
    constructor(ctx) {
        this.ctx = ctx;
        this.nodes = [];
        this.edges = [];
        this.gridSpacing = 20;
        this.zoom = 1;
        this.minZoom = 0.5;
        this.maxZoom = 2;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    addNode(node) {
        this.nodes.push(node);
        this.draw();
    }

    removeNode(node) {
        this.nodes = this.nodes.filter(n => n !== node);
        this.edges = this.edges.filter(edge => edge.from !== node.name && edge.to !== node.name);
        this.draw();
    }

    addEdge(from, to) {
        this.edges.push(new GraphEdge(from, to));
        this.draw();
    }

    draw() {
        const canvas = this.ctx.canvas;
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.save();
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.scale(this.zoom, this.zoom);

        this.drawGrid();
        this.edges.forEach(edge => edge.draw(this.ctx, this.nodes));
        this.nodes.forEach(node => node.draw(this.ctx, false, 1 / this.zoom));

        this.ctx.restore();
    }

    drawGrid() {
        this.ctx.save();
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 0.5;

        const scaledSpacing = this.gridSpacing / this.zoom;
        const startX = -Math.floor((this.offsetX + this.ctx.canvas.width / this.zoom) / scaledSpacing) * scaledSpacing;
        const startY = -Math.floor((this.offsetY + this.ctx.canvas.height / this.zoom) / scaledSpacing) * scaledSpacing;

        for (let x = startX; x < (this.ctx.canvas.width / this.zoom) + Math.abs(this.offsetX) / this.zoom; x += scaledSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, -Math.abs(this.offsetY) / this.zoom);
            this.ctx.lineTo(x, (this.ctx.canvas.height / this.zoom) + Math.abs(this.offsetY) / this.zoom);
            this.ctx.stroke();
        }

        for (let y = startY; y < (this.ctx.canvas.height / this.zoom) + Math.abs(this.offsetY) / this.zoom; y += scaledSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(-Math.abs(this.offsetX) / this.zoom, y);
            this.ctx.lineTo((this.ctx.canvas.width / this.zoom) + Math.abs(this.offsetX) / this.zoom, y);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }
}
