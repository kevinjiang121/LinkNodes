from flask import Flask, request, render_template, redirect, url_for

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

if __name__ == '__main__':
    app.run(debug=True)
