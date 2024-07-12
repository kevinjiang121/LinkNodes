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
let contextMenuX = 0;
let contextMenuY = 0;

let isPanning = false;
let startPanX = 0;
let startPanY = 0;
let offsetX = 0;
let offsetY = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.8;

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.8;
    draw();
});

canvas.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    let x = e.offsetX - offsetX;
    let y = e.offsetY - offsetY;
    selectedNode = getNodeAt(x, y);
    contextMenuX = x;
    contextMenuY = y;
    if (selectedNode) {
        showContextMenu(e.clientX, e.clientY);
    } else {
        showAddNodeMenu(e.clientX, e.clientY);
    }
});

canvas.addEventListener('mousedown', function (e) {
    if (contextMenu.style.display === 'block') {
        contextMenu.style.display = 'none';
    }

    let x = e.offsetX - offsetX;
    let y = e.offsetY - offsetY;
    startNode = getNodeAt(x, y);

    if (startNode) {
        isDragging = true;
        mouseX = x;
        mouseY = y;
    } else {
        isPanning = true;
        startPanX = e.clientX;
        startPanY = e.clientY;
    }
});

canvas.addEventListener('mousemove', function (e) {
    let x = e.offsetX - offsetX;
    let y = e.offsetY - offsetY;
    displayCoordinates(e.offsetX, e.offsetY);

    if (isDragging) {
        draw();
        drawLine(startNode.x, startNode.y, x, y);
    } else if (isPanning) {
        offsetX += e.clientX - startPanX;
        offsetY += e.clientY - startPanY;
        startPanX = e.clientX;
        startPanY = e.clientY;
        draw();
    }
});

canvas.addEventListener('mouseup', function (e) {
    if (isDragging) {
        let x = e.offsetX - offsetX;
        let y = e.offsetY - offsetY;
        let endNode = getNodeAt(x, y);
        if (endNode && startNode && endNode !== startNode) {
            edges.push({ from: startNode.name, to: endNode.name });
            updateEdgeList();
        }
        isDragging = false;
        startNode = null;
        draw();
    } else if (isPanning) {
        isPanning = false;
    }
});

canvas.addEventListener('click', function (e) {
    let x = e.offsetX - offsetX;
    let y = e.offsetY - offsetY;
    let node = getNodeAt(x, y);
    if (node) {
        toggleNodeExpansion(node);
    }
});

function getNodeAt(x, y) {
    return nodes.find(node => {
        if (node.isExpanded) {
            return x > node.x - node.width / 2 && x < node.x + node.width / 2 &&
                   y > node.y - node.height / 2 && y < node.y + node.height / 2;
        } else {
            return Math.hypot(node.x - x, node.y - y) < node.radius;
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offsetX, offsetY);

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
        if (node.isExpanded) {
            ctx.beginPath();
            ctx.rect(node.x - node.width / 2, node.y - node.height / 2, node.width, node.height);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#000';
            ctx.fillText(node.description, node.x - node.width / 2 + 10, node.y);
        } else {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeText(node.name, node.x - 10, node.y - 15);
        }
        ctx.stroke();
    });

    ctx.restore();
}

function drawLine(x1, y1, x2, y2) {
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
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

function showAddNodeMenu(x, y) {
    // Remove any existing add node menu
    let existingMenu = document.querySelector('.add-node-menu');
    if (existingMenu) {
        document.body.removeChild(existingMenu);
    }

    let addNodeMenu = document.createElement('div');
    addNodeMenu.classList.add('add-node-menu');
    addNodeMenu.style.left = `${x}px`;
    addNodeMenu.style.top = `${y}px`;

    let nodeNameInput = document.createElement('input');
    nodeNameInput.type = 'text';
    nodeNameInput.placeholder = 'Node Name';
    nodeNameInput.classList.add('input-field');
    addNodeMenu.appendChild(nodeNameInput);

    let nodeDescriptionInput = document.createElement('input');
    nodeDescriptionInput.type = 'text';
    nodeDescriptionInput.placeholder = 'Node Description';
    nodeDescriptionInput.classList.add('input-field');
    addNodeMenu.appendChild(nodeDescriptionInput);

    let addButton = document.createElement('button');
    addButton.textContent = 'Add Node';
    addButton.classList.add('add-button');
    addButton.onclick = function () {
        let nodeName = nodeNameInput.value;
        let nodeDescription = nodeDescriptionInput.value;
        if (nodeName && nodeDescription) {
            nodes.push(new Node(nodeName, nodeDescription, contextMenuX, contextMenuY));
            draw();
            updateNodeList();
            document.body.removeChild(addNodeMenu);
        } else {
            alert('Please enter both name and description.');
        }
    };
    addNodeMenu.appendChild(addButton);

    document.body.appendChild(addNodeMenu);

    document.addEventListener('click', function removeMenu(event) {
        if (!addNodeMenu.contains(event.target)) {
            document.body.removeChild(addNodeMenu);
            document.removeEventListener('click', removeMenu);
        }
    });
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

function toggleNodeExpansion(node) {
    node.isExpanded = !node.isExpanded;
    animateNodeExpansion(node);
}

function animateNodeExpansion(node) {
    let startTime = null;
    const duration = 300; // Animation duration in milliseconds
    const initialRadius = node.radius;
    const targetRadius = node.isExpanded ? 0 : node.originalRadius;
    const initialWidth = node.isExpanded ? 0 : node.expandedWidth;
    const targetWidth = node.isExpanded ? node.expandedWidth : 0;
    const initialHeight = node.isExpanded ? 0 : node.expandedHeight;
    const targetHeight = node.isExpanded ? node.expandedHeight : 0;

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        node.radius = initialRadius + progress * (targetRadius - initialRadius);
        node.width = initialWidth + progress * (targetWidth - initialWidth);
        node.height = initialHeight + progress * (targetHeight - initialHeight);

        draw();

        if (elapsed < duration) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

function displayCoordinates(x, y) {
    ctx.clearRect(0, canvas.height - 20, canvas.width, 20); 
    ctx.fillText(`(${x}, ${y})`, 10, canvas.height - 10); 
}
