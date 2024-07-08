from flask import Flask, request, render_template, redirect, url_for, send_file
import json
from io import BytesIO

app = Flask(__name__)

class Graph:
    def __init__(self):
        self.nodes = []
        self.edges = {}

    def add_node(self, node):
        if node not in self.nodes:
            self.nodes.append(node)
            self.edges[node] = []

    def add_edge(self, node1, node2):
        if node1 in self.nodes and node2 in self.nodes:
            self.edges[node1].append(node2)
            self.edges[node2].append(node1)

    def to_dict(self):
        return {"nodes": self.nodes, "edges": self.edges}

    def from_dict(self, data):
        self.nodes = data["nodes"]
        self.edges = data["edges"]

    def clear(self):
        self.nodes = []
        self.edges = {}

graph = Graph()

@app.route('/')
def index():
    return render_template('index.html', nodes=graph.nodes, edges=graph.edges)

@app.route('/add_node', methods=['POST'])
def add_node():
    node = request.form['node']
    graph.add_node(node)
    return redirect(url_for('index'))

@app.route('/add_edge', methods=['POST'])
def add_edge():
    node1 = request.form['node1']
    node2 = request.form['node2']
    graph.add_edge(node1, node2)
    return redirect(url_for('index'))

@app.route('/export', methods=['GET'])
def export_graph():
    graph_json = json.dumps(graph.to_dict())
    return send_file(BytesIO(graph_json.encode()), mimetype='application/json', as_attachment=True, download_name='graph.json')

@app.route('/import', methods=['POST'])
def import_graph():
    file = request.files['file']
    if file:
        data = json.load(file)
        graph.from_dict(data)
    return redirect(url_for('index'))

@app.route('/clear', methods=['POST'])
def clear_graph():
    graph.clear()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
