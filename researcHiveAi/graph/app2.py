import streamlit as st
import networkx as nx
import pandas as pd
import numpy as np
import arxiv
import requests
from pyvis.network import Network
from yake import KeywordExtractor
from community import best_partition
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import os
import streamlit.components.v1 as components
import leidenalg as la
import igraph as ig
import cdlib
from cdlib import algorithms, evaluation

# Initialize models
kw_extractor = KeywordExtractor(lan="en", top=5)
embedder = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")

# Create static folder for HTML files
STATIC_FOLDER = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(STATIC_FOLDER, exist_ok=True)

# Standard graph height
GRAPH_HEIGHT = 700

class ResearchKnowledgeGraph:
    def __init__(self):
        self.graph = nx.Graph()
        self.papers = []
        self.embeddings = None
        self.communities = {}
        self.metrics = {}
        
    def fetch_papers_arxiv(self, query, max_results=10):
        try:
            search = arxiv.Search(query=query, max_results=max_results, sort_by=arxiv.SortCriterion.Relevance)
            return [
                {"title": result.title, 
                 "authors": [author.name for author in result.authors],
                 "summary": result.summary, 
                 "link": result.entry_id, 
                 "published": result.published.strftime("%Y-%m-%d"),
                 "categories": ", ".join(result.categories),
                 "source": "arXiv"}
                for result in search.results()
            ]
        except Exception as e:
            st.error(f"Error fetching from arXiv: {e}")
            return []

    def fetch_papers_semantic_scholar(self, query, max_results=10):
        try:
            url = f"https://api.semanticscholar.org/graph/v1/paper/search?query={query}&limit={max_results}&fields=title,authors,url,abstract,year"
            response = requests.get(url)
            if response.status_code == 200:
                data = response.json()
                return [{
                    "title": paper.get("title", ""),
                    "authors": [author.get("name", "") for author in paper.get("authors", [])],
                    "summary": paper.get("abstract", ""),
                    "link": paper.get("url", ""),
                    "published": paper.get("year", ""),
                    "source": "Semantic Scholar"
                } for paper in data.get("data", [])]
            return []
        except Exception as e:
            st.error(f"Error fetching from Semantic Scholar: {e}")
            return []

    def fetch_papers_openalex(self, query, max_results=10):
        try:
            url = f"https://api.openalex.org/works?search={query}&per-page={max_results}"
            response = requests.get(url)
            if response.status_code == 200:
                data = response.json()
                return [{
                    "title": paper.get("title", ""),
                    "authors": [author.get("author", {}).get("display_name", "") for author in paper.get("authorships", [])],
                    "summary": self.process_abstract_inverted_index(paper.get("abstract_inverted_index", {})),
                    "link": paper.get("doi", ""),
                    "published": paper.get("publication_date", ""),
                    "source": "OpenAlex"
                } for paper in data.get("results", [])]
            return []
        except Exception as e:
            st.error(f"Error fetching from OpenAlex: {e}")
            return []

    def process_abstract_inverted_index(self, inverted_index):
        if not inverted_index:
            return ""
        try:
            # Simple processing to extract words from inverted index
            all_positions = []
            for word, positions in inverted_index.items():
                for pos in positions:
                    all_positions.append((word, pos))
            
            # Sort by position
            all_positions.sort(key=lambda x: x[1])
            
            # Join words
            return " ".join(word for word, _ in all_positions)
        except:
            return ""

    def fetch_papers_pubmed(self, query, max_results=10):
        try:
            url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={query}&retmax={max_results}&retmode=json"
            response = requests.get(url)
            if response.status_code == 200:
                ids = response.json().get("esearchresult", {}).get("idlist", [])
                papers = []
                for pubmed_id in ids:
                    fetch_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={pubmed_id}&retmode=json"
                    details = requests.get(fetch_url).json().get("result", {}).get(pubmed_id, {})
                    papers.append({
                        "title": details.get("title", ""),
                        "authors": [author.get("name", "") for author in details.get("authors", [])],
                        "summary": details.get("source", ""),
                        "link": f"https://pubmed.ncbi.nlm.nih.gov/{pubmed_id}/",
                        "published": details.get("pubdate", ""),
                        "source": "PubMed"
                    })
                return papers
            return []
        except Exception as e:
            st.error(f"Error fetching from PubMed: {e}")
            return []

    def fetch_papers(self, query="Artificial Intelligence", max_results=10, sources=None):
        if not sources:
            sources = ["arXiv", "Semantic Scholar", "OpenAlex", "PubMed"]
        
        self.papers = []
        with st.spinner('Fetching papers from selected sources...'):
            if "arXiv" in sources:
                arxiv_papers = self.fetch_papers_arxiv(query, max_results)
                self.papers.extend(arxiv_papers)
                st.info(f"Retrieved {len(arxiv_papers)} papers from arXiv")
                
            if "Semantic Scholar" in sources:
                semantic_papers = self.fetch_papers_semantic_scholar(query, max_results)
                self.papers.extend(semantic_papers)
                st.info(f"Retrieved {len(semantic_papers)} papers from Semantic Scholar")
                
            if "OpenAlex" in sources:
                openalex_papers = self.fetch_papers_openalex(query, max_results)
                self.papers.extend(openalex_papers)
                st.info(f"Retrieved {len(openalex_papers)} papers from OpenAlex")
                
            if "PubMed" in sources:
                pubmed_papers = self.fetch_papers_pubmed(query, max_results)
                self.papers.extend(pubmed_papers)
                st.info(f"Retrieved {len(pubmed_papers)} papers from PubMed")
        
        st.success(f"Retrieved {len(self.papers)} papers in total")
        
        # Create embeddings for similarity calculations
        self.create_embeddings()

    def create_embeddings(self):
        with st.spinner('Creating embeddings for similarity calculations...'):
            texts = []
            for paper in self.papers:
                # Combine title and summary for better similarity matching
                text = paper["title"]
                if paper.get("summary"):
                    text += " " + paper["summary"]
                texts.append(text)
            
            # Create embeddings
            self.embeddings = embedder.encode(texts)

    def get_similar_papers(self, paper_index, top_n=5):
        """Return top_n most similar papers to the paper at paper_index"""
        if self.embeddings is None:
            return []
        
        # Get similarities with all other papers
        similarities = cosine_similarity([self.embeddings[paper_index]], self.embeddings)[0]
        
        # Get indices of top_n+1 most similar papers
        similar_indices = np.argsort(similarities)[::-1][:top_n+1]
        
        # Filter out the paper itself
        similar_indices = [idx for idx in similar_indices if idx != paper_index][:top_n]
        
        # Return the papers
        return [(idx, similarities[idx]) for idx in similar_indices]

    def extract_keyphrases(self, text):
        if not text:
            return []
        try:
            keywords = kw_extractor.extract_keywords(text)
            return [kw[0] for kw in keywords]
        except:
            return []

    def build_graph(self):
        with st.spinner('Building knowledge graph...'):
            self.graph.clear()
            
            for paper in self.papers:
                title = paper["title"]
                source = paper.get("source", "Unknown")
                
                # Add paper node with attributes - store source as attribute but don't include it in graph
                self.graph.add_node(title, 
                                   type="paper", 
                                   link=paper["link"], 
                                   source=source,
                                   published=paper.get("published", ""))
                
                # Add author nodes and connect to paper
                for author in paper.get("authors", []):
                    if not author:  # Skip empty author names
                        continue
                    self.graph.add_node(author, type="author")
                    self.graph.add_edge(author, title, relationship="wrote")
                
                # Extract and add keyword nodes
                keywords = self.extract_keyphrases(paper.get("summary", ""))
                for keyword in keywords:
                    self.graph.add_node(keyword, type="keyword")
                    self.graph.add_edge(title, keyword, relationship="has_keyword")

    def detect_communities(self, algorithm='louvain'):
        """
        Detect communities using the specified algorithm
        """
        if not self.graph.nodes:
            return {}
            
        with st.spinner(f'Detecting communities using {algorithm} algorithm...'):
            result = {}
            metrics = {}
            
            if algorithm == 'louvain':
                # Louvain algorithm
                partition = best_partition(self.graph)
                result = partition
                
            elif algorithm == 'leiden':
                # Convert NetworkX graph to igraph for Leiden algorithm
                g_ig = ig.Graph.from_networkx(self.graph)
                partition = la.find_partition(g_ig, la.ModularityVertexPartition)
                
                # Convert partition back to node-based dictionary format like louvain
                result = {}
                for idx, node in enumerate(self.graph.nodes()):
                    result[node] = partition.membership[idx]
                
            elif algorithm == 'slpa':
                # Use SLPA from cdlib
                g_ig = ig.Graph.from_networkx(self.graph)
                
                # Ensure all nodes have a "name" attribute
                for idx, node in enumerate(self.graph.nodes()):
                    g_ig.vs[idx]["name"] = node  # Set the "name" attribute to the node identifier
                
                # Apply SLPA algorithm
                partition = algorithms.slpa(g_ig)
                
                # Convert to the same format as other algorithms
                result = {}
                for i, community in enumerate(partition.communities):
                    for node in community:
                        result[node] = i
            
            # Store the communities
            self.communities[algorithm] = result
            
            # Calculate quality metrics
            if result:
                metrics = self.calculate_community_metrics(result)
                self.metrics[algorithm] = metrics
                
            return result, metrics
            
    def calculate_community_metrics(self, partition):
        """
        Calculate quality metrics for the given community partition
        """
        with st.spinner('Calculating community quality metrics...'):
            metrics = {}
            
            # Convert partition to cdlib format for easier metrics calculation
            communities = {}
            for node, comm_id in partition.items():
                if comm_id not in communities:
                    communities[comm_id] = []
                communities[comm_id].append(node)
            
            communities_list = list(communities.values())
            node_community = cdlib.NodeClustering(communities_list, graph=self.graph)
            
            # 1. Modularity
            try:
                modularity = evaluation.newman_girvan_modularity(self.graph, node_community).score
                metrics['modularity'] = modularity
            except Exception as e:
                st.warning(f"Could not calculate modularity: {e}")
                metrics['modularity'] = None
            
            # 2. Internal Edge Density (for each community)
            edge_densities = []
            for comm in communities_list:
                if len(comm) > 1:
                    subgraph = self.graph.subgraph(comm)
                    edges = subgraph.number_of_edges()
                    max_edges = (len(comm) * (len(comm) - 1)) / 2
                    if max_edges > 0:
                        density = edges / max_edges
                        edge_densities.append(density)
            
            if edge_densities:
                metrics['internal_edge_density'] = sum(edge_densities) / len(edge_densities)
            else:
                metrics['internal_edge_density'] = 0
            
            # 3. Conductance (for each community)
            conductances = []
            for comm in communities_list:
                subgraph = self.graph.subgraph(comm)
                internal_edges = subgraph.number_of_edges()
                
                # Count edges that cross the community boundary
                boundary_edges = 0
                for node in comm:
                    for neighbor in self.graph.neighbors(node):
                        if neighbor not in comm:
                            boundary_edges += 1
                
                if internal_edges + boundary_edges > 0:
                    conductance = boundary_edges / (2 * internal_edges + boundary_edges)
                    conductances.append(conductance)
            
            if conductances:
                metrics['conductance'] = sum(conductances) / len(conductances)
            else:
                metrics['conductance'] = 0
            
            return metrics

    def visualize_graph(self, algorithm='louvain', physics_enabled=True):
        if not self.graph.nodes:
            return None
            
        # Make sure we have communities detected
        if algorithm not in self.communities:
            _, _ = self.detect_communities(algorithm)
            
        with st.spinner('Generating visualization...'):
            # Get community partition
            partition = self.communities.get(algorithm, {})
            
            # Create the network
            net = Network(notebook=False, height=f"{GRAPH_HEIGHT}px", width="100%", directed=False)
            
            # Improved physics settings for better initial view
            if physics_enabled:
                # This configuration helps with initial zoom and distribution
                net.barnes_hut(
                    gravity=-5000,  # Reduced gravity for less compression
                    central_gravity=0.1,  # Lower central gravity to spread nodes more
                    spring_length=250,  # Increased spring length for more spacing
                    spring_strength=0.01,  # Lower spring strength for more even spacing
                    damping=0.09
                )
                
                # Set initial zoom options
                net.set_options("""
                {
                  "interaction": {
                    "navigationButtons": true,
                    "zoomView": true
                  },
                  "physics": {
                    "stabilization": {
                      "iterations": 100,  
                      "fit": true           
                    }
                  }
                }
                """)
            else:
                net.toggle_physics(False)
            
            # Generate colors based on communities
            # Use a different palette for each type of node to distinguish them
            import matplotlib.pyplot as plt
            import matplotlib.colors as mcolors
            
            # Get unique community IDs
            if partition:
                community_ids = set(partition.values())
                paper_colors = plt.cm.Set1(np.linspace(0, 1, len(community_ids)))
                author_colors = plt.cm.Set2(np.linspace(0, 1, len(community_ids)))
                keyword_colors = plt.cm.Set3(np.linspace(0, 1, len(community_ids)))
                
                # Convert to hex color strings
                paper_colors = [mcolors.rgb2hex(paper_colors[i % len(paper_colors)]) for i in range(len(community_ids))]
                author_colors = [mcolors.rgb2hex(author_colors[i % len(author_colors)]) for i in range(len(community_ids))]
                keyword_colors = [mcolors.rgb2hex(keyword_colors[i % len(keyword_colors)]) for i in range(len(community_ids))]
                
                # Create lookup dictionaries
                community_to_color = {
                    'paper': {comm_id: paper_colors[i] for i, comm_id in enumerate(community_ids)},
                    'author': {comm_id: author_colors[i] for i, comm_id in enumerate(community_ids)},
                    'keyword': {comm_id: keyword_colors[i] for i, comm_id in enumerate(community_ids)}
                }
            
            # Add nodes with different colors and shapes based on type and community
            for node, data in self.graph.nodes(data=True):
                node_type = data["type"]
                
                if node in partition:
                    comm_id = partition[node]
                    # Use community-based color
                    if partition and community_to_color:
                        color = community_to_color[node_type][comm_id]
                    else:
                        # Fallback colors if no community is detected
                        color = "#FF6B6B" if node_type == "paper" else "#4ECDC4" if node_type == "author" else "#45B7D1"
                else:
                    # Fallback colors if node is not in partition
                    color = "#FF6B6B" if node_type == "paper" else "#4ECDC4" if node_type == "author" else "#45B7D1"
                
                if node_type == "paper":
                    shape = "dot"
                    size = 40
                    title = f"Paper: {node}"
                    if data.get('source'):
                        title += f"<br>Source: {data.get('source')}"
                    if data.get('published'):
                        title += f"<br>Published: {data.get('published')}"
                    if node in partition:
                        title += f"<br>Community: {partition[node]}"
                elif node_type == "author":
                    shape = "diamond" 
                    size = 20
                    title = f"Author: {node}"
                    if node in partition:
                        title += f"<br>Community: {partition[node]}"
                else:  # keyword
                    shape = "triangle"
                    size = 20
                    title = f"Keyword: {node}"
                    if node in partition:
                        title += f"<br>Community: {partition[node]}"
                
                url = data.get("link", None) if node_type == "paper" else None
                
                # Truncate long node labels for better display
                label = node
                if len(label) > 30:
                    label = label[:27] + "..."
                
                net.add_node(node, label=label, color=color, title=title, shape=shape, size=size, url=url)
            
            # Add edges with titles showing relationship
            for source, target, data in self.graph.edges(data=True):
                # Check if nodes are in the same community for different edge color
                if partition and source in partition and target in partition:
                    same_community = partition[source] == partition[target]
                    edge_color = "#777777" if same_community else "#cccccc"
                    edge_width = 2 if same_community else 1
                else:
                    edge_color = "#777777"
                    edge_width = 1
                    
                net.add_edge(source, target, title=data["relationship"], color=edge_color, width=edge_width)
            
            # Save to HTML file
            graph_path = os.path.join(STATIC_FOLDER, f"graph_{algorithm}.html")
            net.save_graph(graph_path)
            
            return graph_path

# Streamlit UI
st.set_page_config(layout="wide", page_title="Research Knowledge Graph", page_icon="🔍")

# Initialize session state variables
if 'papers' not in st.session_state:
    st.session_state.papers = []
if 'graph_generated' not in st.session_state:
    st.session_state.graph_generated = False
if 'graph_files' not in st.session_state:
    st.session_state.graph_files = {}
if 'selected_paper_index' not in st.session_state:
    st.session_state.selected_paper_index = 0
if 'kg' not in st.session_state:
    st.session_state.kg = ResearchKnowledgeGraph()
if 'current_algorithm' not in st.session_state:
    st.session_state.current_algorithm = 'louvain'
if 'community_metrics' not in st.session_state:
    st.session_state.community_metrics = {}

# Sidebar for controls
with st.sidebar:
    st.title("🔎 Search Settings")
    query = st.text_input("Search Query:", "Artificial Intelligence")
    max_results = st.slider("Max Results per Source", min_value=5, max_value=50, value=10)
    
    st.subheader("Select Data Sources")
    sources = st.multiselect(
        "Choose which sources to query:",
        options=["arXiv", "Semantic Scholar", "OpenAlex", "PubMed"],
        default=["arXiv", "Semantic Scholar"]
    )
    
    physics_enabled = st.checkbox("Enable Physics (Interactive Movement)", value=True)
    
    # Community detection algorithm selection
    st.subheader("Community Detection")
    algorithm = st.selectbox(
        "Select community detection algorithm:",
        options=["louvain", "leiden", "slpa"],
        index=0,
        help="Choose the algorithm to detect communities in the graph"
    )
    
    # Color legend
    st.markdown("### 🎨 Graph Legend")
    st.markdown("🔴 **Red tones** - Papers by community")
    st.markdown("🟢 **Green tones** - Authors by community")
    st.markdown("🔵 **Blue tones** - Keywords by community")
    
    # Interaction tips
    st.markdown("### 🖱️ Interaction Tips")
    st.markdown("- **Zoom**: Scroll wheel")
    st.markdown("- **Pan**: Click and drag background")
    st.markdown("- **Move node**: Click and drag node")
    st.markdown("- **Node details**: Hover over node")
    st.markdown("- **Paper link**: Click on paper node")
    st.markdown("- **Paper details**: Use dropdown menu")

# Main content
st.title("📊 Interactive Research Knowledge Graph")
st.markdown("""
This application creates an interactive knowledge graph from research papers across multiple sources.
The graph visualizes relationships between papers, authors, and key concepts using community detection
to identify related groups.
""")

# Function to display paper details with similar papers
def display_paper_details(paper_index):
    kg = st.session_state.kg
    paper = kg.papers[paper_index]
    
    st.subheader(paper["title"])
    
    # Basic information in columns
    col1, col2 = st.columns(2)
    with col1:
        st.markdown(f"**Source:** {paper.get('source', 'Unknown')}")
        st.markdown(f"**Published:** {paper.get('published', 'Unknown')}")
    with col2:
        if paper.get("categories"):
            st.markdown(f"**Categories:** {paper.get('categories', '')}")
    
    # Authors section
    st.markdown("### Authors")
    authors = paper.get("authors", [])
    if authors:
        st.markdown(", ".join(authors))
    else:
        st.markdown("No author information available")
    
    # Abstract/Summary section
    st.markdown("### Abstract")
    if paper.get("summary"):
        st.markdown(paper["summary"])
    else:
        st.markdown("No abstract available")
    
    # Link button
    if paper.get("link"):
        st.markdown(f"### Link to Paper")
        st.markdown(f"URL: {paper['link']}")
        st.markdown(f"[Open Paper in New Tab]({paper['link']})")
    
    # Similar papers section
    st.markdown("### Top 5 Related Papers")
    similar_papers = kg.get_similar_papers(paper_index, top_n=5)
    
    if similar_papers:
        for i, (similar_idx, similarity) in enumerate(similar_papers, 1):
            similar_paper = kg.papers[similar_idx]
            similarity_percentage = round(similarity * 100, 1)
            
            st.markdown(f"**{i}. {similar_paper['title']}** ({similarity_percentage}% similarity)")
            
            # Show a bit more information about each similar paper
            expander = st.expander(f"More details")
            with expander:
                st.markdown(f"**Authors:** {', '.join(similar_paper.get('authors', ['Unknown']))}")
                st.markdown(f"**Source:** {similar_paper.get('source', 'Unknown')}")
                st.markdown(f"**Published:** {similar_paper.get('published', 'Unknown')}")
                if similar_paper.get("link"):
                    st.markdown(f"[Open Paper]({similar_paper['link']})")
    else:
        st.markdown("No similar papers found or similarity calculation not available.")

def display_community_metrics():
    kg = st.session_state.kg
    metrics = st.session_state.community_metrics
    
    st.subheader("Community Detection Quality Metrics")
    
    # Create a DataFrame for easier comparison
    metrics_data = []  # Use a list to collect rows
    for algorithm, alg_metrics in metrics.items():
        metrics_data.append({
            "Algorithm": algorithm,
            "Modularity": alg_metrics.get("modularity", "N/A"),
            "Internal Edge Density": alg_metrics.get("internal_edge_density", "N/A"),
            "Conductance": alg_metrics.get("conductance", "N/A")
        })
    
    # Convert the list of dictionaries to a DataFrame
    metrics_df = pd.DataFrame(metrics_data)
    
    st.table(metrics_df)
    
    # Explanation of metrics
    with st.expander("📊 What do these metrics mean?"):
        st.markdown("""
        **Modularity**: Measures how well a network is divided into communities. Higher values (closer to 1) indicate better community structure.
        
        **Internal Edge Density**: The ratio of actual edges between nodes in a community to the total possible edges. Higher values indicate more cohesive communities.
        
        **Conductance**: Measures the fraction of total edge volume that points outside the community. Lower values indicate better-defined communities with fewer connections to the rest of the network.
        """)

# Callback for when the algorithm changes
def on_algorithm_change():
    # Update current algorithm
    st.session_state.current_algorithm = algorithm
    
    # Rerun to apply changes
    st.rerun()

# Button to generate knowledge graph
if st.button("Generate Knowledge Graph") or st.session_state.graph_generated:
    if not sources and not st.session_state.graph_generated:
        st.warning("Please select at least one data source.")
    else:
        # Only fetch papers and build graph if not already done
        if not st.session_state.graph_generated:
            # Store the knowledge graph instance in session state
            kg = st.session_state.kg
            
            # Fetch papers
            kg.fetch_papers(query, max_results, sources)
            
            # Build graph if papers were found
            if kg.papers:
                kg.build_graph()
                
                # Detect communities for all algorithms
                algorithms = ['louvain', 'leiden', 'slpa']
                graph_files = {}
                metrics = {}
                
                for alg in algorithms:
                    _, alg_metrics = kg.detect_communities(alg)
                    graph_file = kg.visualize_graph(alg, physics_enabled)
                    graph_files[alg] = graph_file
                    metrics[alg] = alg_metrics
                
                # Store in session state
                st.session_state.graph_files = graph_files
                st.session_state.graph_generated = True
                st.session_state.papers = kg.papers
                st.session_state.community_metrics = metrics
                st.session_state.current_algorithm = algorithm
                
                # Rerun to update UI
                st.rerun()
            else:
                st.error("No papers found for the given query. Try a different search term or selecting different sources.")
        
        # If graph is already generated, display it
        if st.session_state.graph_generated:
            kg = st.session_state.kg
            graph_files = st.session_state.graph_files
            current_alg = st.session_state.current_algorithm
            
            # Select current algorithm
            if current_alg != algorithm:
                st.session_state.current_algorithm = algorithm
                st.rerun()
                
            graph_file = graph_files.get(current_alg)
            
            if graph_file:
                # Create tabs for different views
                tab1, tab2, tab3, tab4 = st.tabs(["Graph Visualization", "Community Metrics", "Statistics", "Paper Details"])
                
                with tab1:
                    # Use streamlit components to embed the HTML
                    st.subheader(f"Knowledge Graph with {current_alg.capitalize()} Community Detection")
                    with open(graph_file, 'r', encoding='utf-8') as f:
                        html_content = f.read()
                    components.html(html_content, height=GRAPH_HEIGHT)
                    
                    # Show download link for the graph
                    st.download_button(
                        label="Download Graph as HTML",
                        data=html_content,
                        file_name=f"research_knowledge_graph_{current_alg}.html",
                        mime="text/html"
                    )
                
                with tab2:
                    # Display community metrics comparison
                    display_community_metrics()
                    
                    # Community statistics
                    if kg.communities:
                        st.subheader("Community Statistics")
                        
                        # Count papers, authors, and keywords in each community
                        community_stats = {}
                        
                        # Get the community partition for current algorithm
                        partition = kg.communities.get(current_alg, {})
                        
                        if partition:
                            # Count number of communities
                            community_ids = set(partition.values())
                            st.markdown(f"**Number of communities detected:** {len(community_ids)}")
                            
                            # Create community statistics
                            for node, comm_id in partition.items():
                                if comm_id not in community_stats:
                                    community_stats[comm_id] = {"papers": 0, "authors": 0, "keywords": 0}
                                
                                node_type = kg.graph.nodes[node].get("type")
                                if node_type in community_stats[comm_id]:
                                    community_stats[comm_id][node_type] += 1
                            
                            # Create a DataFrame for pretty display
                            stats_df = pd.DataFrame([
                                {
                                    "Community": comm_id,
                                    "Papers": stats["papers"],
                                    "Authors": stats["authors"],
                                    "Keywords": stats["keywords"],
                                    "Total Nodes": stats["papers"] + stats["authors"] + stats["keywords"]
                                }
                                for comm_id, stats in community_stats.items()
                            ])
                            
                            # Sort by total nodes
                            stats_df = stats_df.sort_values("Total Nodes", ascending=False)
                            
                            # Display the stats
                            st.dataframe(stats_df)
                            
                            # Visualize community composition
                            st.subheader("Community Composition")
                            
                            # Prepare data for visualization
                            chart_data = pd.DataFrame({
                                "Community": stats_df["Community"],
                                "Papers": stats_df["Papers"],
                                "Authors": stats_df["Authors"],
                                "Keywords": stats_df["Keywords"]
                            })
                            
                            # Melt the DataFrame for easier plotting with Streamlit
                            chart_data_melted = pd.melt(
                                chart_data, 
                                id_vars=["Community"],
                                value_vars=["Papers", "Authors", "Keywords"],
                                var_name="Node Type",
                                value_name="Count"
                            )
                            
                            # Show bar chart
                            st.bar_chart(chart_data.set_index("Community"))
                            
                            # Show detailed breakdown
                            if st.checkbox("Show detailed community breakdown"):
                                # Create a dict mapping communities to nodes
                                communities_to_nodes = {}
                                for node, comm_id in partition.items():
                                    if comm_id not in communities_to_nodes:
                                        communities_to_nodes[comm_id] = {"papers": [], "authors": [], "keywords": []}
                                    
                                    node_type = kg.graph.nodes[node].get("type")
                                    if node_type in communities_to_nodes[comm_id]:
                                        communities_to_nodes[comm_id][node_type].append(node)
                                
                                # Display nodes in each community
                                for comm_id in sorted(communities_to_nodes.keys()):
                                    with st.expander(f"Community {comm_id}"):
                                        # Papers
                                        st.markdown(f"**Papers ({len(communities_to_nodes[comm_id]['papers'])}):**")
                                        for paper in communities_to_nodes[comm_id]["papers"]:
                                            st.markdown(f"- {paper}")
                                        
                                        # Authors
                                        st.markdown(f"**Authors ({len(communities_to_nodes[comm_id]['authors'])}):**")
                                        authors_list = communities_to_nodes[comm_id]["authors"]
                                        # Show first 10 and hide the rest in expander if > 10
                                        if len(authors_list) > 10:
                                            for author in authors_list[:10]:
                                                st.markdown(f"- {author}")
                                            with st.expander(f"Show all {len(authors_list)} authors"):
                                                for author in authors_list:
                                                    st.markdown(f"- {author}")
                                        else:
                                            for author in authors_list:
                                                st.markdown(f"- {author}")
                                        
                                        # Keywords
                                        st.markdown(f"**Keywords ({len(communities_to_nodes[comm_id]['keywords'])}):**")
                                        keywords_list = communities_to_nodes[comm_id]["keywords"]
                                        # Show first 10 and hide the rest in expander if > 10
                                        if len(keywords_list) > 10:
                                            for keyword in keywords_list[:10]:
                                                st.markdown(f"- {keyword}")
                                            with st.expander(f"Show all {len(keywords_list)} keywords"):
                                                for keyword in keywords_list:
                                                    st.markdown(f"- {keyword}")
                                        else:
                                            for keyword in keywords_list:
                                                st.markdown(f"- {keyword}")
                
                with tab3:
                    # Graph statistics
                    st.subheader("Graph Statistics")
                    
                    # Basic statistics
                    num_nodes = kg.graph.number_of_nodes()
                    num_edges = kg.graph.number_of_edges()
                    
                    # Node type counts
                    paper_count = len([n for n, d in kg.graph.nodes(data=True) if d.get("type") == "paper"])
                    author_count = len([n for n, d in kg.graph.nodes(data=True) if d.get("type") == "author"])
                    keyword_count = len([n for n, d in kg.graph.nodes(data=True) if d.get("type") == "keyword"])
                    
                    # Display in columns
                    col1, col2, col3, col4 = st.columns(4)
                    with col1:
                        st.metric("Total Nodes", num_nodes)
                    with col2:
                        st.metric("Total Edges", num_edges)
                    with col3:
                        st.metric("Papers", paper_count)
                    with col4:
                        st.metric("Authors", author_count)
                    
                    # More metrics
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.metric("Keywords", keyword_count)
                    with col2:
                        density = nx.density(kg.graph)
                        st.metric("Graph Density", f"{density:.5f}")
                    with col3:
                        try:
                            avg_path_length = nx.average_shortest_path_length(kg.graph)
                            st.metric("Avg. Path Length", f"{avg_path_length:.2f}")
                        except:
                            st.metric("Avg. Path Length", "N/A (Disconnected)")
                    
                    # Advanced metrics
                    col1, col2 = st.columns(2)
                    with col1:
                        try:
                            connected_components = nx.number_connected_components(kg.graph)
                            st.metric("Connected Components", connected_components)
                        except:
                            st.metric("Connected Components", "N/A")
                    with col2:
                        try:
                            diameter = nx.diameter(kg.graph)
                            st.metric("Graph Diameter", diameter)
                        except:
                            st.metric("Graph Diameter", "N/A (Disconnected)")
                    
                    # Degree distributions
                    st.subheader("Degree Distribution")
                    
                    # Calculate degrees
                    degrees = [d for n, d in kg.graph.degree()]
                    
                    # Calculate degree distribution
                    unique_degrees = sorted(set(degrees))
                    degree_counts = [degrees.count(d) for d in unique_degrees]
                    
                    # Create dataframe for charting
                    degree_df = pd.DataFrame({
                        "Degree": unique_degrees,
                        "Count": degree_counts
                    })
                    
                    # Display degree distribution chart
                    st.bar_chart(degree_df.set_index("Degree"))
                    
                    # Show most connected nodes
                    st.subheader("Most Connected Nodes")
                    
                    # Get top 10 nodes by degree
                    node_degrees = sorted(kg.graph.degree(), key=lambda x: x[1], reverse=True)[:10]
                    
                    # Create dataframe
                    top_nodes_df = pd.DataFrame([
                        {
                            "Node": node,
                            "Degree": degree,
                            "Type": kg.graph.nodes[node].get("type", "Unknown")
                        }
                        for node, degree in node_degrees
                    ])
                    
                    st.table(top_nodes_df)
                
                with tab4:
                    # Paper selection and details
                    if st.session_state.papers:
                        # Create dropdown with paper titles
                        paper_titles = [p["title"] for p in st.session_state.papers]
                        selected_paper = st.selectbox(
                            "Select a paper to view details:",
                            options=paper_titles,
                            index=st.session_state.selected_paper_index
                        )
                        
                        # Get index of selected paper
                        selected_index = paper_titles.index(selected_paper)
                        st.session_state.selected_paper_index = selected_index
                        
                        # Display paper details
                        display_paper_details(selected_index)
                    else:
                        st.warning("No papers to display. Please generate the knowledge graph first.")
            else:
                st.error("Graph visualization file not found. Please try regenerating the graph.")

# Show instructions if no graph is generated yet
if not st.session_state.graph_generated:
    st.info("Enter a search query, select data sources, and click 'Generate Knowledge Graph' to begin.")
    
    # Example queries suggestions
    st.markdown("### 💡 Example Search Queries")
    example_queries = [
        "Large Language Models",
        "Quantum Computing Applications",
        "Climate Change Adaptation",
        "CRISPR Gene Editing",
        "Blockchain Sustainability",
        "Computer Vision Transformer",
        "Renewable Energy Storage",
        "COVID-19 Long Term Effects",
        "Neuromorphic Computing"
    ]
    
    # Display example queries as clickable buttons
    cols = st.columns(3)
    for i, query in enumerate(example_queries):
        with cols[i % 3]:
            if st.button(query):
                # This will be handled on the next rerun
                st.session_state.last_selected_query = query