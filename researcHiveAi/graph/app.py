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

    def visualize_graph(self, physics_enabled=True):
        if not self.graph.nodes:
            return None
            
        with st.spinner('Generating visualization...'):
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
            
            # Add nodes with different colors and shapes based on type - with LARGER sizes
            for node, data in self.graph.nodes(data=True):
                node_type = data["type"]
                
                if node_type == "paper":
                    color = "#FF6B6B"  # Red
                    shape = "dot"
                    size = 40  # Increased from 30
                    title = f"Paper: {node}"
                    if data.get('source'):
                        title += f"<br>Source: {data.get('source')}"
                    if data.get('published'):
                        title += f"<br>Published: {data.get('published')}"
                elif node_type == "author":
                    color = "#4ECDC4"  # Green
                    shape = "diamond" 
                    size = 20  # Increased from 25
                    title = f"Author: {node}"
                else:  # keyword
                    color = "#45B7D1"  # Blue
                    shape = "triangle"
                    size = 20  # Increased from 20
                    title = f"Keyword: {node}"
                
                url = data.get("link", None) if node_type == "paper" else None
                
                # Truncate long node labels for better display
                label = node
                if len(label) > 30:
                    label = label[:27] + "..."
                
                net.add_node(node, label=label, color=color, title=title, shape=shape, size=size, url=url)
            
            # Add edges with titles showing relationship
            for source, target, data in self.graph.edges(data=True):
                net.add_edge(source, target, title=data["relationship"])
            
            # Save to HTML file
            graph_path = os.path.join(STATIC_FOLDER, "graph.html")
            net.save_graph(graph_path)
            
            return graph_path

# Streamlit UI
st.set_page_config(layout="wide", page_title="Research Knowledge Graph", page_icon="🔍")

# Initialize session state variables
if 'papers' not in st.session_state:
    st.session_state.papers = []
if 'graph_generated' not in st.session_state:
    st.session_state.graph_generated = False
if 'graph_file' not in st.session_state:
    st.session_state.graph_file = None
if 'selected_paper_index' not in st.session_state:
    st.session_state.selected_paper_index = 0
if 'kg' not in st.session_state:
    st.session_state.kg = ResearchKnowledgeGraph()

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
    
    # Color legend
    st.markdown("### 🎨 Graph Legend")
    st.markdown("🔴 **Red** - Papers")
    st.markdown("🟢 **Green** - Authors")
    st.markdown("🔵 **Blue** - Keywords")
    
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
The graph visualizes relationships between papers, authors, and key concepts.
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

# Callback for when the paper selection changes
def on_paper_select():
    # This function intentionally left blank as we're using session state
    pass

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
            
            # Build and visualize graph if papers were found
            if kg.papers:
                kg.build_graph()
                graph_file = kg.visualize_graph(physics_enabled)
                
                # Store in session state
                st.session_state.graph_file = graph_file
                st.session_state.graph_generated = True
                st.session_state.papers = kg.papers
                
                # Rerun to update UI
                st.rerun()
            else:
                st.error("No papers found for the given query. Try a different search term or selecting different sources.")
        
        # If graph is already generated, display it
        if st.session_state.graph_generated:
            kg = st.session_state.kg
            graph_file = st.session_state.graph_file
            
            if graph_file:
                # Create tabs for different views
                tab1, tab2, tab3 = st.tabs(["Graph Visualization", "Statistics", "Paper Details"])
                
                with tab1:
                    # Use streamlit components to embed the HTML
                    with open(graph_file, 'r', encoding='utf-8') as f:
                        html_content = f.read()
                    components.html(html_content, height=GRAPH_HEIGHT)
                    
                    # Show download link for the graph
                    st.download_button(
                        label="Download Graph as HTML",
                        data=html_content,
                        file_name="research_knowledge_graph.html",
                        mime="text/html"
                    )
                
                with tab2:
                    # Display some stats
                    st.header("Graph Statistics")
                    
                    col1, col2, col3 = st.columns(3)
                    
                    with col1:
                        paper_count = sum(1 for _, data in kg.graph.nodes(data=True) if data["type"] == "paper")
                        st.metric("Papers", paper_count)
                        
                    with col2:
                        author_count = sum(1 for _, data in kg.graph.nodes(data=True) if data["type"] == "author")
                        st.metric("Authors", author_count)
                        
                    with col3:
                        keyword_count = sum(1 for _, data in kg.graph.nodes(data=True) if data["type"] == "keyword")
                        st.metric("Keywords", keyword_count)
                    
                    # Source breakdown
                    st.subheader("Papers by Source")
                    source_counts = {}
                    for _, data in kg.graph.nodes(data=True):
                        if data["type"] == "paper" and "source" in data:
                            source = data["source"]
                            source_counts[source] = source_counts.get(source, 0) + 1
                    
                    source_df = pd.DataFrame({
                        "Source": list(source_counts.keys()),
                        "Paper Count": list(source_counts.values())
                    }).sort_values(by="Paper Count", ascending=False)
                    
                    st.bar_chart(source_df.set_index("Source"))
                
                with tab3:
                    # Dropdown for paper selection (using session state)
                    st.header("Paper Details")
                    
                    # Create a dropdown for selecting papers
                    paper_titles = [p["title"] for p in kg.papers]
                    
                    if paper_titles:
                        # Use a key to prevent re-rendering on selection
                        selected_index = st.selectbox(
                            "Select a paper to view details and similar papers:",
                            options=range(len(paper_titles)),
                            format_func=lambda x: paper_titles[x],
                            index=st.session_state.selected_paper_index,
                            key="paper_selector",
                            on_change=on_paper_select
                        )
                        
                        # Update the session state
                        st.session_state.selected_paper_index = selected_index
                        
                        # Display details of selected paper
                        display_paper_details(selected_index)
                        
                        # Allow download as CSV
                        papers_df = pd.DataFrame([
                            {"Title": p["title"], 
                            "Authors": ", ".join(p["authors"][:3]) + ("..." if len(p["authors"]) > 3 else ""),
                            "Published": p.get("published", "Unknown"),
                            "Source": p.get("source", "Unknown"),
                            "Link": p["link"]}
                            for p in kg.papers
                        ])
                        
                        csv = papers_df.to_csv(index=False)
                        st.download_button(
                            label="Download Papers as CSV",
                            data=csv,
                            file_name="research_papers.csv",
                            mime="text/csv"
                        )
else:
    # Initial state - show example
    st.info("Click 'Generate Knowledge Graph' to start. Select your data sources in the sidebar.")