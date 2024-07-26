class CanvasController {
    constructor(canvas, graph) {
        this.canvas = canvas;
        this.graph = graph;
        this.ctx = canvas.getContext('2d');
        this.isPanning = false;
        this.startPanX = 0;
        this.startPanY = 0;
        this.isDraggingNode = false;
        this.isCreatingEdge = false;
        this.draggingNode = null;
        this.startNode = null;
        this.selectedNode = null;
        this.contextMenuX = 0;
        this.contextMenuY = 0;

        this.setupEventListeners();
        this.resizeCanvas();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());

        this.canvas.addEventListener('contextmenu', e => this.handleContextMenu(e));
        this.canvas.addEventListener('mousedown', e => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', e => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', e => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', e => this.handleWheel(e));
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight * 0.8;
        this.graph.draw();
    }

    handleContextMenu(e) {
        e.preventDefault();
        const x = (e.offsetX - this.graph.offsetX) / this.graph.zoom;
        const y = (e.offsetY - this.graph.offsetY) / this.graph.zoom;
        this.selectedNode = this.graph.nodes.find(node => this.isNodeUnderCursor(node, x, y));
        this.contextMenuX = x;
        this.contextMenuY = y;
        if (this.selectedNode) {
            this.showContextMenu(e.clientX, e.clientY);
        } else {
            this.showAddNodeMenu(e.clientX, e.clientY);
        }
    }

    handleMouseDown(e) {
        if (document.getElementById('contextMenu').style.display === 'block') {
            document.getElementById('contextMenu').style.display = 'none';
        }

        const x = (e.offsetX - this.graph.offsetX) / this.graph.zoom;
        const y = (e.offsetY - this.graph.offsetY) / this.graph.zoom;
        this.startNode = this.graph.nodes.find(node => this.isNodeUnderCursor(node, x, y));

        if (this.startNode && this.startNode.isOverEdgeHandle(x, y, this.graph.zoom)) {
            this.isCreatingEdge = true;
            this.draggingNode = this.startNode;
        } else if (this.startNode) {
            this.isDraggingNode = true;
            this.draggingNode = this.startNode;
        } else {
            this.isPanning = true;
            this.startPanX = e.clientX;
            this.startPanY = e.clientY;
        }
    }

    handleMouseMove(e) {
        const x = (e.offsetX - this.graph.offsetX) / this.graph.zoom;
        const y = (e.offsetY - this.graph.offsetY) / this.graph.zoom;

        if (this.isPanning) {
            this.graph.offsetX += e.clientX - this.startPanX;
            this.graph.offsetY += e.clientY - this.startPanY;
            this.startPanX = e.clientX;
            this.startPanY = e.clientY;
            this.graph.draw();
        } else if (this.isDraggingNode && this.draggingNode) {
            this.draggingNode.setPosition(x, y);
            this.graph.draw();
        } else if (this.isCreatingEdge && this.draggingNode) {
            this.graph.draw();
            this.drawLine(this.draggingNode.x, this.draggingNode.y, x, y);
        } else {
            const hoveredNode = this.graph.nodes.find(node => this.isNodeUnderCursor(node, x, y));
            this.graph.draw(); // Redraw entire graph to clear previous hover effects
            if (hoveredNode) {
                hoveredNode.draw(this.ctx, true, this.graph.zoom);
            }
        }
    }

    handleMouseUp(e) {
        if (this.isPanning) {
            this.isPanning = false;
        } else if (this.isDraggingNode) {
            this.isDraggingNode = false;
            this.draggingNode = null;
        } else if (this.isCreatingEdge) {
            const endNode = this.graph.nodes.find(node => this.isNodeUnderCursor(node, (e.offsetX - this.graph.offsetX) / this.graph.zoom, (e.offsetY - this.graph.offsetY) / this.graph.zoom));
            if (endNode && this.draggingNode && endNode !== this.draggingNode) {
                this.graph.addEdge(this.draggingNode.name, endNode.name);
            }
            this.isCreatingEdge = false;
            this.draggingNode = null;
            this.graph.draw(); // Ensure to clear any temporary lines drawn
        }
    }

    handleWheel(e) {
        e.preventDefault();
        const mouseX = e.offsetX;
        const mouseY = e.offsetY;
        const wheel = e.deltaY < 0 ? 1 : -1;
        const zoomFactor = 1.1;
        const newZoom = this.graph.zoom * (wheel > 0 ? zoomFactor : 1 / zoomFactor);

        if (newZoom !== this.graph.zoom) {
            this.graph.zoom = Math.min(this.graph.maxZoom, Math.max(this.graph.minZoom, newZoom));
            this.graph.offsetX -= (mouseX - this.graph.offsetX) * (newZoom / this.graph.zoom - 1);
            this.graph.offsetY -= (mouseY - this.graph.offsetY) * (newZoom / this.graph.zoom - 1);
            this.graph.draw();
        }
    }

    isNodeUnderCursor(node, x, y) {
        const distance = Math.hypot(node.x - x, node.y - y) / this.graph.zoom;
        return distance < node.radius;
    }

    drawLine(x1, y1, x2, y2) {
        this.ctx.save();
        this.ctx.translate(this.graph.offsetX, this.graph.offsetY);
        this.ctx.scale(this.graph.zoom, this.graph.zoom);
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.ctx.restore();
    }

    showContextMenu(x, y) {
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.style.display = 'block';
    }

    showAddNodeMenu(x, y) {
        const addNodeMenu = document.querySelector('.add-node-menu');
        addNodeMenu.style.left = `${x}px`;
        addNodeMenu.style.top = `${y}px`;
        addNodeMenu.style.display = 'flex';
        addNodeMenu.style.flexDirection = 'column';

        document.addEventListener('click', function removeMenu(event) {
            if (!addNodeMenu.contains(event.target)) {
                addNodeMenu.style.display = 'none';
                document.removeEventListener('click', removeMenu);
            }
        }, { once: true });
    }
}
