const canvas = document.getElementById('graphCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.8;
const ctx = canvas.getContext('2d');

const graph = new Graph(ctx);
const canvasController = new CanvasController(canvas, graph);

function exportGraph() {
    const data = { nodes: graph.nodes, edges: graph.edges };
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "graph.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importGraph() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = JSON.parse(e.target.result);
            graph.nodes = data.nodes.map(n => new GraphNode(n.name, n.description, n.x, n.y));
            graph.edges = data.edges.map(e => new GraphEdge(e.from, e.to));
            graph.draw();
        };
        reader.readAsText(file);
    }
}

function clearGraph() {
    graph.nodes = [];
    graph.edges = [];
    graph.draw();
}

function addNode() {
    const nodeNameInput = document.getElementById('nodeNameInput');
    const nodeDescriptionInput = document.getElementById('nodeDescriptionInput');
    const nodeName = nodeNameInput.value;
    const nodeDescription = nodeDescriptionInput.value;

    if (nodeName && nodeDescription) {
        const newNode = new GraphNode(nodeName, nodeDescription, canvasController.contextMenuX, canvasController.contextMenuY);
        graph.addNode(newNode);
        nodeNameInput.value = '';
        nodeDescriptionInput.value = '';
        document.querySelector('.add-node-menu').style.display = 'none';
    } else {
        alert('Please enter both name and description.');
    }
}

function removeNode() {
    const selectedNode = canvasController.selectedNode;
    if (selectedNode) {
        graph.removeNode(selectedNode);
        document.getElementById('contextMenu').style.display = 'none';
        canvasController.selectedNode = null;
    }
}

graph.draw();
