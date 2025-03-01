import arxiv
import spacy
import networkx as nx
from pyvis.network import Network
from sentence_transformers import SentenceTransformer

# Load NLP model for entity extraction
nlp = spacy.load("en_core_web_sm")

# Load sentence transformer for embeddings
embedder = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")

class ResearchKnowledgeGraph:
    def __init__(self):
        self.graph = nx.Graph()
    
    def fetch_papers(self, query="Artificial Intelligence", max_results=5):
        """Fetches research papers from arXiv"""
        search = arxiv.Search(
            query=query,
            max_results=max_results,
            sort_by=arxiv.SortCriterion.Relevance
        )
        papers = []
        for result in search.results():
            papers.append({
                "title": result.title,
                "authors": [author.name for author in result.authors],
                "summary": result.summary,
                "link": result.entry_id  # Paper URL
            })
        
        print(papers)
        return papers
    
    def extract_entities(self, text):
        """Extracts named entities (keywords)"""
        doc = nlp(text)
        keywords = [token.text for token in doc if token.pos_ in ["NOUN", "PROPN"]]
        return list(set(keywords[:5]))  # Top 5 keywords

    def add_to_graph(self, papers):
        """Builds the knowledge graph from paper metadata"""
        for paper in papers:
            title = paper["title"]
            self.graph.add_node(title, type="paper", link=paper["link"])  # Add paper with link
            
            for author in paper["authors"]:
                self.graph.add_node(author, type="author")
                self.graph.add_edge(author, title, relationship="wrote")

            keywords = self.extract_entities(paper["summary"])
            for keyword in keywords:
                self.graph.add_node(keyword, type="keyword")
                self.graph.add_edge(title, keyword, relationship="has_keyword")

    def generate_embeddings(self):
        """Generates embeddings for papers to find related research"""
        titles = [node for node, data in self.graph.nodes(data=True) if data["type"] == "paper"]
        title_embeddings = embedder.encode(titles, convert_to_tensor=True).cpu().numpy()
        return dict(zip(titles, title_embeddings))

    def find_similar_papers(self, paper_title, top_n=3):
        """Finds similar papers using cosine similarity"""
        from sklearn.metrics.pairwise import cosine_similarity
        embeddings = self.generate_embeddings()
        target_embedding = embeddings[paper_title].reshape(1, -1)
        similarities = {
            title: cosine_similarity(target_embedding, embedding.reshape(1, -1))[0][0]
            for title, embedding in embeddings.items() if title != paper_title
        }
        return sorted(similarities.items(), key=lambda x: x[1], reverse=True)[:top_n]
    
    def visualize_graph(self):
        """Creates an interactive visualization of the knowledge graph with clickable nodes."""
        net = Network(notebook=False, height="1200px", width="100%", directed=False)  # Ensure notebook=False

        # Improved layout configuration
        net.force_atlas_2based(gravity=-50, central_gravity=0.01, spring_length=200, damping=0.9)

        # Add nodes and edges to the network
        for node, data in self.graph.nodes(data=True):
            color = "blue" if data["type"] == "paper" else "green" if data["type"] == "author" else "red"
            url = data.get("link", None) if data["type"] == "paper" else None
            net.add_node(node, label=node, color=color, title=node, url=url)

        for source, target, data in self.graph.edges(data=True):
            net.add_edge(source, target, title=data["relationship"])

        # Save the initial graph
        net.save_graph("knowledge_graph.html")

        # JavaScript to handle double-click events
        double_click_js = """
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

        # Insert the JavaScript right before the closing </body> tag
        with open("knowledge_graph.html", "r") as f:
            content = f.read()
        
        new_content = content.replace('</body>', f'{double_click_js}\n</body>')

        with open("knowledge_graph.html", "w") as f:
            f.write(new_content)

        # Open the modified HTML file
        return net.show("knowledge_graph.html", notebook=False)


# Usage
kg = ResearchKnowledgeGraph()
papers = kg.fetch_papers(query="Machine Learning", max_results=10)  # Fetch more papers for a bigger graph
kg.add_to_graph(papers)

# Find similar papers
example_paper = papers[0]["title"]
similar_papers = kg.find_similar_papers(example_paper)
print(f"\nSimilar papers to '{example_paper}':")
for title, score in similar_papers:
    print(f"- {title} (Similarity: {score:.2f})")

# Visualize Graph
kg.visualize_graph()
