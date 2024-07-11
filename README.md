# LinkNodes

LinkNodes is a web application that allows users to create and manage graphs (nodes and edges) interactively. The application includes a canvas where users can add, edit, and remove nodes and edges. It also supports exporting and importing graphs in JSON format.

## Features

- Add nodes with a name and description
- Remove nodes and their associated edges
- Drag and drop to create edges between nodes
- View node details by clicking on them
- Export the graph to a JSON file
- Import a graph from a JSON file
- Clear the entire graph
- Context menu for node operations
- Responsive canvas that adjusts to the screen size

## Technologies Used

- HTML
- CSS
- JavaScript
- Flask (backend)

## Getting Started

### Prerequisites

- Python 3.x
- Flask

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/linknodes.git
   cd linknodes
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use \`venv\\Scripts\\activate\`
   ```

3. Install the required packages:

   ```bash
   pip install Flask
   ```

4. Run the Flask application:

   ```bash
   python app.py
   ```

5. Open your web browser and go to \`http://127.0.0.1:5000/\`.

## Usage

1. **Adding a Node**: Right-click on the canvas to bring up the context menu and select "Add Node". Enter the name and description for the node.

2. **Editing a Node**: Right-click on an existing node and select "Edit Description". Enter the new description and save.

3. **Removing a Node**: Right-click on an existing node and select "Remove Node". This will remove the node and all its associated edges.

4. **Creating an Edge**: Click and drag from one node to another to create an edge.

5. **Viewing Node Details**: Click on a node to view its details.

6. **Exporting the Graph**: Click the "Export Graph" button to download the graph as a JSON file.

7. **Importing a Graph**: Use the "Import File" button to upload a JSON file and load a saved graph.

8. **Clearing the Graph**: Click the "Clear Graph" button to remove all nodes and edges.

## Directory Structure

```bash
linknodes/
├── app.py
├── templates/
│   └── index.html
└── static/
    ├── styles.css
    ├── node.js
    └── main.js
```

## Contributing

1. Fork the repository.
2. Create a new branch (\`git checkout -b feature-branch\`).
3. Make your changes.
4. Commit your changes (\`git commit -am 'Add new feature'\`).
5. Push to the branch (\`git push origin feature-branch\`).
6. Open a pull request.
