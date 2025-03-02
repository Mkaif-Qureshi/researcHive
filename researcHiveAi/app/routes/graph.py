from flask import Blueprint, request, jsonify, send_file
import networkx as nx
import pandas as pd
import numpy as np
import arxiv
from pyvis.network import Network
from yake import KeywordExtractor
from community import best_partition
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import os
import json

graph_bp = Blueprint("graph", __name__)

# Initialize models
kw_extractor = KeywordExtractor(lan="en", top=5)
embedder = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")

# Define the static folder to store generated graphs
STATIC_FOLDER = os.path.join(os.path.dirname(__file__), "..", "static")
os.makedirs(STATIC_FOLDER, exist_ok=True)  # Ensure directory exists

class ResearchKnowledgeGraph:
    def __init__(self):
        self.graph = nx.Graph()
        self.papers = []

    def fetch_papers(self, query="Artificial Intelligence", max_results=10):
        """Fetch papers from arXiv with metadata"""
        search = arxiv.Search(
            query=query,
            max_results=max_results,
            sort_by=arxiv.SortCriterion.Relevance
        )
        self.papers = [
            {
                "title": result.title,
                "authors": [author.name for author in result.authors],
                "summary": result.summary,
                "link": result.entry_id,
                "published": result.published.strftime("%Y-%m-%d"),
                "categories": ", ".join(result.categories)
            }
            for result in search.results()
        ]

    def extract_keyphrases(self, text):
        """Extract keyphrases using YAKE"""
        keywords = kw_extractor.extract_keywords(text)
        return [kw[0] for kw in keywords]

    def build_graph(self):
        """Build the knowledge graph with communities and centrality"""
        self.graph.clear()
        for paper in self.papers:
            title = paper["title"]
            self.graph.add_node(title, type="paper", link=paper["link"], 
                              published=paper["published"],
                              categories=paper["categories"])

            # Authors
            for author in paper["authors"]:
                self.graph.add_node(author, type="author")
                self.graph.add_edge(author, title, relationship="wrote")

            # Keyphrases
            keywords = self.extract_keyphrases(paper["summary"])
            for keyword in keywords:
                self.graph.add_node(keyword, type="keyword")
                self.graph.add_edge(title, keyword, relationship="has_keyword")

        # Add communities
        partition = best_partition(self.graph)
        nx.set_node_attributes(self.graph, partition, "community")

        # Add centrality
        centrality = nx.degree_centrality(self.graph)
        nx.set_node_attributes(self.graph, centrality, "centrality")

    def visualize_graph(self):
        """Generate an interactive PyVis graph with double-click redirection"""
        if not self.graph or len(self.graph.nodes()) == 0:
            return None

        net = Network(notebook=False, height="800px", width="100%", directed=False)
        net.force_atlas_2based()

        # Add nodes with metadata
        for node, data in self.graph.nodes(data=True):
            color = "#FF6B6B" if data["type"] == "paper" else ("#4ECDC4" if data["type"] == "author" else "#45B7D1")
            title = f"Title: {node}<br>Type: {data['type']}"
            url = data.get("link", None) if data["type"] == "paper" else None  # Only papers have URLs
            net.add_node(node, label=node, color=color, title=title, group=data.get("community", 0), url=url)

        # Add edges
        for source, target, data in self.graph.edges(data=True):
            net.add_edge(source, target, title=data["relationship"])

        # Save the graph to a file
        graph_path = os.path.join(STATIC_FOLDER, "graph.html")
        net.save_graph(graph_path)

        # Inject JavaScript for double-click redirection
        with open(graph_path, "r") as f:
            content = f.read()

        # Add JavaScript to handle double-click events
        js_code = """
        <script type="text/javascript">
            network.on("doubleClick", function(params) {
                if (params.nodes.length > 0) {
                    var nodeId = params.nodes[0];
                    var node = nodes.get(nodeId);
                    if (node.url) {
                        window.open(node.url, "_blank");
                    }
                }
            });
        </script>
        """

        # Insert the JavaScript before the closing </body> tag
        content = content.replace('</body>', f'{js_code}\n</body>')

        # Write the modified content back to the file
        with open(graph_path, "w") as f:
            f.write(content)

        return graph_path

    def recommend_papers(self, paper_title, top_n=5):
        """Recommend similar papers using content similarity"""
        titles = [node for node, data in self.graph.nodes(data=True) if data["type"] == "paper"]

        if not titles:
            return jsonify({"error": "No papers in the graph"})

        embeddings = embedder.encode(titles, convert_to_numpy=True)

        try:
            query_embedding = embedder.encode([paper_title], convert_to_numpy=True)
            similarities = cosine_similarity(query_embedding, embeddings)[0]

            top_indices = np.argsort(similarities)[-top_n:][::-1]
            recommendations = []

            for i in top_indices:
                paper_node = titles[i]
                paper_data = self.graph.nodes[paper_node]

                # Get linked authors
                authors = [neighbor for neighbor in self.graph.neighbors(paper_node) if self.graph.nodes[neighbor]["type"] == "author"]

                recommendations.append({
                    "title": paper_node,
                    "score": float(similarities[i]),  # Convert np.float32 to Python float
                    "link": paper_data.get("link", None),  # Get link if available
                    "authors": authors  # List of authors
                })

            return jsonify(recommendations)

        except Exception as e:
            return jsonify({"error": str(e)})

    def export_graph(self, format="gexf"):
        """Export graph in various formats"""
        if not self.graph or len(self.graph.nodes()) == 0:
            return None
            
        export_path = os.path.join(STATIC_FOLDER, f"graph.{format}")

        if format == "gexf":
            nx.write_gexf(self.graph, export_path)
        elif format == "graphml":
            nx.write_graphml(self.graph, export_path)
        elif format == "csv":
            nodes_df = pd.DataFrame.from_dict(dict(self.graph.nodes(data=True)), orient='index')
            edges_df = pd.DataFrame([(u, v, d) for u, v, d in self.graph.edges(data=True)], 
                                  columns=['source', 'target', 'attributes'])
            
            nodes_df.to_csv(os.path.join(STATIC_FOLDER, "nodes.csv"))
            edges_df.to_csv(os.path.join(STATIC_FOLDER, "edges.csv"))
            return os.path.join(STATIC_FOLDER, "nodes.csv")

        return export_path

kg = ResearchKnowledgeGraph()

@graph_bp.route("/generate", methods=["POST"])
def generate_graph():
    """Fetch papers and build graph"""
    data = request.json
    query = data.get("query", "Artificial Intelligence")
    max_results = data.get("max_results", 10)

    kg.fetch_papers(query, max_results)
    kg.build_graph()
    
    # Generate the visualization file immediately after building the graph
    graph_file = kg.visualize_graph()
    
    if not graph_file:
        return jsonify({"error": "Failed to create graph visualization"}), 500
        
    # Export in default format
    kg.export_graph()
    
    return jsonify({
        "message": "Graph successfully generated",
        "visualization_path": graph_file
    })

@graph_bp.route("/visualize", methods=["GET"])
def visualize_graph():
    """Return the PyVis graph visualization with double-click redirection"""
    graph_file = os.path.join(STATIC_FOLDER, "graph.html")

    if not os.path.exists(graph_file):
        # Try to generate if it doesn't exist
        graph_file = kg.visualize_graph()
        if not graph_file:
            return jsonify({"error": "Graph not found. Please generate the graph first."}), 404

    return send_file(graph_file)

@graph_bp.route("/recommend", methods=["POST"])
def recommend_papers():
    """Get paper recommendations based on a JSON request"""
    data = request.json
    paper_title = data.get("title")
    top_n = data.get("top_n", 5)

    if not paper_title:
        return jsonify({"error": "Paper title is required"}), 400

    return kg.recommend_papers(paper_title, top_n)


@graph_bp.route("/export", methods=["GET"])
def export_graph():
    """Export graph in specified format"""
    format = request.args.get("format", "gexf")
    
    # Generate the export file
    export_file = kg.export_graph(format)
    
    if not export_file:
        return jsonify({"error": "No graph data to export. Generate a graph first."}), 404
    
    file_path = export_file
    
    if not os.path.exists(file_path):
        return jsonify({"error": f"Export file not found. Try exporting in {format} format first."}), 404

    return send_file(file_path, as_attachment=True)

@graph_bp.route("/papers", methods=["GET"])
def get_papers():
    """Return a list of papers in the graph"""
    if not kg.graph or len(kg.graph.nodes()) == 0:
        return jsonify({"error": "No graph data available. Generate a graph first."}), 404

    # Extract paper nodes and their metadata
    papers = []
    for node, data in kg.graph.nodes(data=True):
        if data["type"] == "paper":
            papers.append({
                "title": node,
                "link": data.get("link", None),
                "published": data.get("published", None),
                "categories": data.get("categories", None),
                "authors": list(kg.graph.neighbors(node))  # Get authors connected to the paper
            })

    return jsonify({"papers": papers})