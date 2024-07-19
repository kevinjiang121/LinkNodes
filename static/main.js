let canvas = document.getElementById('graphCanvas');
let ctx = canvas.getContext('2d');
let contextMenu = document.getElementById('contextMenu');
let nodes = [];
let edges = [];
let isDraggingNode = false;
let isCreatingEdge = false;
let draggingNode = null;
let startNode = null;
let selectedNode = null;
let mouseX = 0;
let mouseY = 0;
let contextMenuX = 0;
let contextMenuY = 0;
let isEdgeCreationActive = false;

let isPanning = false;
let startPanX = 0;
let startPanY = 0;
let offsetX = 0;
let offsetY = 0;
let clickThreshold = 5;
let dragStartX = 0;
let dragStartY = 0;
let gridSpacing = 20;
let zoom = 1;
let minZoom = 0.5;
let maxZoom = 2;

let hoveredNode = null;
let edgeHandleRadius = 10;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.8;

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.8;
    draw();
});

canvas.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    let x = (e.offsetX - offsetX) / zoom;
    let y = (e.offsetY - offsetY) / zoom;
    selectedNode = getNodeAt(x, y);
    contextMenuX = x;
    contextMenuY = y;
    if (selectedNode) {
        showContextMenu(e.clientX, e.clientY);
    }
});

canvas.addEventListener('mousedown', function (e) {
    if (contextMenu.style.display === 'block') {
        contextMenu.style.display = 'none';
    }

    let x = (e.offsetX - offsetX) / zoom;
    let y = (e.offsetY - offsetY) / zoom;
    startNode = getNodeAt(x, y);

    if (startNode && isOverEdgeHandle(startNode, x, y) && !startNode.isExpanded) {
        isCreatingEdge = true;
        isEdgeCreationActive = true;
        draggingNode = startNode;
        mouseX = x;
        mouseY = y;
        dragStartX = x;
        dragStartY = y;
    } else if (startNode && (!isOverEdgeHandle(startNode, x, y) || startNode.isExpanded)) {
        isDraggingNode = true;
        draggingNode = startNode;
        mouseX = x;
        mouseY = y;
        dragStartX = x;
        dragStartY = y;
    } else {
        isPanning = true;
        startPanX = e.clientX;
        startPanY = e.clientY;
    }
});

canvas.addEventListener('mousemove', function (e) {
    let x = (e.offsetX - offsetX) / zoom;
    let y = (e.offsetY - offsetY) / zoom;
    displayCoordinates(e.offsetX, e.offsetY);

    hoveredNode = getNodeAt(x, y);
    draw();

    if (isCreatingEdge && draggingNode) {
        drawLine(draggingNode.x, draggingNode.y, x, y);
    } else if (isDraggingNode && draggingNode) {
        draggingNode.x = x;
        draggingNode.y = y;
        updateNodeTextAreaPosition(draggingNode);
        draw();
    } else if (isPanning) {
        offsetX += e.clientX - startPanX;
        offsetY += e.clientY - startPanY;
        startPanX = e.clientX;
        startPanY = e.clientY;
        draw();
    }
});

canvas.addEventListener('mouseup', function (e) {
    let x = (e.offsetX - offsetX) / zoom;
    let y = (e.offsetY - offsetY) / zoom;

    if (isCreatingEdge) {
        let endNode = getNodeAt(x, y);
        if (endNode && draggingNode && endNode !== draggingNode) {
            edges.push({ from: draggingNode.name, to: endNode.name });
            updateEdgeList();
        }
        isCreatingEdge = false;
        isEdgeCreationActive = false;
        draggingNode = null;
        draw();
    } else if (isDraggingNode) {
        isDraggingNode = false;
        draggingNode = null;
    } else if (isPanning) {
        isPanning = false;
    }
});

canvas.addEventListener('click', function (e) {
    if (!isDraggingNode && !isCreatingEdge && !isEdgeCreationActive) {
        let x = (e.offsetX - offsetX) / zoom;
        let y = (e.offsetY - offsetY) / zoom;
        let node = getNodeAt(x, y);
        if (node) {
            toggleNodeExpansion(node);
        }
    }
});

canvas.addEventListener('wheel', function(e) {
    e.preventDefault();
    let mouseX = e.offsetX;
    let mouseY = e.offsetY;
    let wheel = e.deltaY < 0 ? 1 : -1;
    let zoomFactor = 1.1;
    let newZoom = zoom * (wheel > 0 ? zoomFactor : 1 / zoomFactor);
    newZoom = Math.min(maxZoom, Math.max(minZoom, newZoom));

    if (newZoom !== zoom) {
        offsetX -= (mouseX - offsetX) * (newZoom / zoom - 1);
        offsetY -= (mouseY - offsetY) * (newZoom / zoom - 1);
        zoom = newZoom;
        draw();
    }
});

function getNodeAt(x, y) {
    return nodes.find(node => {
        let distance = Math.hypot(node.x - x, node.y - y);
        return distance < node.radius + edgeHandleRadius || (node.isExpanded && x >= node.x - node.width / 2 && x <= node.x + node.width / 2 && y >= node.y - node.height / 2 && y <= node.y + node.height / 2);
    });
}

function isOverEdgeHandle(node, x, y) {
    if (node.isExpanded) {
        return false;
    }
    let distance = Math.hypot(node.x - x, node.y - y);
    return distance > node.radius && distance < node.radius + edgeHandleRadius;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(zoom, zoom);

    drawGrid();

    edges.forEach(edge => {
        let fromNode = nodes.find(node => node.name === edge.from);
        let toNode = nodes.find(node => node.name === edge.to);
        if (fromNode && toNode) {
            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.strokeStyle = '#000';
            ctx.stroke();
        }
    });

    nodes.forEach(node => {
        if (node.isExpanded) {
            ctx.beginPath();
            ctx.rect(node.x - node.width / 2, node.y - node.height / 2, node.width, node.height);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.stroke();
            ctx.fillStyle = '#000';

            if (!node.textarea) {
                node.textarea = document.createElement('textarea');
                node.textarea.value = node.description;
                node.textarea.style.position = 'absolute';
                updateNodeTextAreaPosition(node);
                node.textarea.style.width = `${node.width - 20}px`;
                node.textarea.style.height = `${node.height - 20}px`;
                node.textarea.style.resize = 'none';
                document.body.appendChild(node.textarea);

                node.textarea.addEventListener('blur', function () {
                    node.description = node.textarea.value;
                    document.body.removeChild(node.textarea);
                    node.textarea = null;
                    node.isExpanded = false;
                    resetNodeDimensions(node);
                    draw();
                });
            } else {
                updateNodeTextAreaPosition(node);
            }

        } else {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
            ctx.fillStyle = node.color || '#000';
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.stroke();
            ctx.fillStyle = '#000';
            ctx.fillText(node.name, node.x - 10, node.y - 15);

            if (hoveredNode === node) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius + edgeHandleRadius, 0, 2 * Math.PI);
                ctx.strokeStyle = '#888';
                ctx.stroke();
            }
        }
    });

    ctx.restore();
}

function updateNodeTextAreaPosition(node) {
    if (node.textarea) {
        node.textarea.style.left = `${node.x - node.width / 2 + offsetX + canvas.offsetLeft}px`;
        node.textarea.style.top = `${node.y - node.height / 2 + offsetY + canvas.offsetTop}px`;
    }
}

function drawGrid() {
    ctx.save();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;

    let scaledSpacing = gridSpacing * zoom;
    let startX = -Math.floor((offsetX + canvas.width / zoom) / scaledSpacing) * scaledSpacing;
    let startY = -Math.floor((offsetY + canvas.height / zoom) / scaledSpacing) * scaledSpacing;

    for (let x = startX; x < (canvas.width / zoom) + Math.abs(offsetX) / zoom; x += scaledSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, -Math.abs(offsetY) / zoom);
        ctx.lineTo(x, (canvas.height / zoom) + Math.abs(offsetY) / zoom);
        ctx.stroke();
    }

    for (let y = startY; y < (canvas.height / zoom) + Math.abs(offsetY) / zoom; y += scaledSpacing) {
        ctx.beginPath();
        ctx.moveTo(-Math.abs(offsetX) / zoom, y);
        ctx.lineTo((canvas.width / zoom) + Math.abs(offsetX) / zoom, y);
        ctx.stroke();
    }

    ctx.restore();
}

function resetNodeDimensions(node) {
    node.radius = node.originalRadius;
    node.width = 0;
    node.height = 0;
}

function drawLine(x1, y1, x2, y2) {
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(zoom, zoom);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, x2);
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
    if (!node.isExpanded && node.textarea) {
        node.description = node.textarea.value;
        document.body.removeChild(node.textarea);
        node.textarea = null;
    }
    animateNodeExpansion(node);
}

function animateNodeExpansion(node) {
    let startTime = null;
    const duration = 300;
    const initialRadius = node.isExpanded ? node.radius : 0;
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

        if (node.textarea) {
            updateNodeTextAreaPosition(node);
        }

        draw();

        if (elapsed < duration) {
            requestAnimationFrame(animate);
        } else {
            if (!node.isExpanded) {
                resetNodeDimensions(node);
            }
            draw();
        }
    }

    requestAnimationFrame(animate);
}

function displayCoordinates(x, y) {
    ctx.clearRect(0, canvas.height - 20, canvas.width, 20);
    ctx.fillText(`(${x}, ${y})`, 10, canvas.height - 10);
}

draw();
