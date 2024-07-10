// main.js

let canvas = document.getElementById('graphCanvas');
let ctx = canvas.getContext('2d');
let contextMenu = document.getElementById('contextMenu');
let nodeDetails = document.getElementById('nodeDetails');
let nodes = [];
let edges = [];
let isDragging = false;
let startNode = null;
let selectedNode = null;
let mouseX = 0;
let mouseY = 0;

canvas.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    let x = e.offsetX;
    let y = e.offsetY;
    selectedNode = getNodeAt(x, y);
    if (selectedNode) {
        showContextMenu(e.clientX, e.clientY);
    } else {
        let nodeName = prompt("Enter node name:");
        if (nodeName) {
            let nodeDescription = prompt("Enter node description:");
            nodes.push(new Node(nodeName, nodeDescription, x, y));
            draw();
            updateNodeList();
        }
    }
});

canvas.addEventListener('mousedown', function (e) {
    if (contextMenu.style.display === 'block') {
        contextMenu.style.display = 'none';
    }
    let x = e.offsetX;
    let y = e.offsetY;
    startNode = getNodeAt(x, y);
    isDragging = !!startNode;
    if (isDragging) {
        mouseX = x;
        mouseY = y;
    }
});

canvas.addEventListener('mousemove', function (e) {
    if (isDragging) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
        draw();
        drawLine(startNode.x, startNode.y, mouseX, mouseY);
    }
});

canvas.addEventListener('mouseup', function (e) {
    if (isDragging) {
        let x = e.offsetX;
        let y = e.offsetY;
        let endNode = getNodeAt(x, y);
        if (endNode && startNode && endNode !== startNode) {
            edges.push({ from: startNode.name, to: endNode.name });
            updateEdgeList();
        }
        isDragging = false;
        startNode = null;
        draw();
    }
});

canvas.addEventListener('click', function (e) {
    let x = e.offsetX;
    let y = e.offsetY;
    let node = getNodeAt(x, y);
    if (node) {
        showNodeDetails(e.clientX, e.clientY, node);
    }
});

function getNodeAt(x, y) {
    return nodes.find(node => Math.hypot(node.x - x, node.y - y) < 10);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    edges.forEach(edge => {
        let fromNode = nodes.find(node => node.name === edge.from);
        let toNode = nodes.find(node => node.name === edge.to);
        if (fromNode && toNode) {
            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.stroke();
        }
    });
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeText(node.name, node.x - 10, node.y - 15);
    });
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function updateNodeList() {
    let nodeList = document.getElementById('nodeList');
    nodeList.innerHTML = '';
    nodes.forEach(node => {
        let li = document.createElement('li');
        li.textContent = node.name;
        nodeList.appendChild(li);
    });
}

function updateEdgeList() {
    let edgeList = document.getElementById('edgeList');
    edgeList.innerHTML = '';
    edges.forEach(edge => {
        let li = document.createElement('li');
        li.textContent = `${edge.from} -> ${edge.to}`;
        edgeList.appendChild(li);
    });
}

function exportGraph() {
    let data = { nodes: nodes, edges: edges };
    let json = JSON.stringify(data);
    let blob = new Blob([json], { type: "application/json" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = "graph.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importGraph() {
    let fileInput = document.getElementById('importFile');
    let file = fileInput.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function (e) {
            let data = JSON.parse(e.target.result);
            nodes = data.nodes.map(n => new Node(n.name, n.description, n.x, n.y));
            edges = data.edges;
            draw();
            updateNodeList();
            updateEdgeList();
        };
        reader.readAsText(file);
    }
}

function clearGraph() {
    nodes = [];
    edges = [];
    draw();
    updateNodeList();
    updateEdgeList();
}

function showContextMenu(x, y) {
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.style.display = 'block';
}

function removeNode() {
    if (selectedNode) {
        nodes = nodes.filter(n => n !== selectedNode);
        edges = edges.filter(edge => edge.from !== selectedNode.name && edge.to !== selectedNode.name);
        draw();
        updateNodeList();
        updateEdgeList();
        contextMenu.style.display = 'none';
        selectedNode = null;
    }
}

function showNodeDetails(x, y, node) {
    nodeDetails.innerHTML = `<strong>${node.name}</strong><br>${node.description}`;
    nodeDetails.style.left = x + 'px';
    nodeDetails.style.top = y + 'px';
    nodeDetails.style.display = 'block';
}

document.addEventListener('click', function (e) {
    if (contextMenu.style.display === 'block') {
        contextMenu.style.display = 'none';
    }
    if (!e.target.closest('#nodeDetails') && !e.target.closest('#graphCanvas')) {
        nodeDetails.style.display = 'none';
    }
});
