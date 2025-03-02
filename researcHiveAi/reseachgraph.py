import arxiv
import spacy
import networkx as nx
from pyvis.network import Network
from sentence_transformers import SentenceTransformer
from yake import KeywordExtractor
import community as community_louvain
import streamlit as st
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime
import requests

# Load models
nlp = spacy.load("en_core_web_sm")
embedder = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")
kw_extractor = KeywordExtractor(lan="en", top=5)

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
        self.papers = []
        for result in search.results():
            self.papers.append({
                "title": result.title,
                "authors": [author.name for author in result.authors],
                "summary": result.summary,
                "link": result.entry_id,
                "published": result.published,
                "categories": result.categories
            })
        return self.papers
    
    def extract_keyphrases(self, text):
        """Extract keyphrases using YAKE"""
        keywords = kw_extractor.extract_keywords(text)
        return [kw[0] for kw in keywords]
    
    def add_to_graph(self):
        """Build the knowledge graph with communities and centrality"""
        for paper in self.papers:
            title = paper["title"]
            self.graph.add_node(title, type="paper", link=paper["link"], 
                              published=paper["published"].strftime("%Y-%m-%d"),
                              categories=", ".join(paper["categories"]))
            
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
        partition = community_louvain.best_partition(self.graph)
        nx.set_node_attributes(self.graph, partition, "community")
        
        # Add centrality
        centrality = nx.degree_centrality(self.graph)
        nx.set_node_attributes(self.graph, centrality, "centrality")
    
    def visualize_graph(self):
        """Interactive visualization with Pyvis"""
        net = Network(notebook=False, height="800px", width="100%", directed=False)
        net.force_atlas_2based()
        
        # Add nodes with metadata
        for node, data in self.graph.nodes(data=True):
            if data["type"] == "paper":
                color = "#FF6B6B"
                title = f"Title: {node}<br>Published: {data['published']}<br>Categories: {data['categories']}"
                url = data["link"]
            elif data["type"] == "author":
                color = "#4ECDC4"
                title = f"Author: {node}"
                url = None
            else:
                color = "#45B7D1"
                title = f"Keyword: {node}"
                url = None
            
            net.add_node(
                node, 
                label=node, 
                color=color, 
                title=title,
                url=url,
                size=np.sqrt(self.graph.degree(node)) * 5,  # Scale node size by degree
                group=data["community"]  # Color by community
            )
        
        # Add edges
        for source, target, data in self.graph.edges(data=True):
            net.add_edge(source, target, title=data["relationship"])
        
        # Save and inject JavaScript for double-click
        net.save_graph("graph.html")
        with open("graph.html", "r") as f:
            content = f.read()
        content = content.replace('</body>', """
        <script>
            network.on("doubleClick", function(params) {
                if (params.nodes.length > 0) {
                    const node = nodes.get(params.nodes[0]);
                    if (node.url) window.open(node.url, "_blank");
                }
            });
        </script>
        </body>
        """)
        with open("graph.html", "w") as f:
            f.write(content)
        
        return "graph.html"
    
    def recommend_papers(self, paper_title, top_n=5):
        """Recommend papers using content + co-authorship"""
        # Content similarity
        titles = [node for node, data in self.graph.nodes(data=True) if data["type"] == "paper"]
        embeddings = embedder.encode(titles, convert_to_tensor=True).cpu().numpy()
        target_idx = titles.index(paper_title)
        sim_scores = cosine_similarity(embeddings[target_idx].reshape(1, -1), embeddings)[0]
        content_recs = sorted(zip(titles, sim_scores), key=lambda x: x[1], reverse=True)[1:top_n+1]
        
        # Co-authorship
        authors = list(self.graph.neighbors(paper_title))
        coauthored_papers = set()
        for author in authors:
            coauthored_papers.update(self.graph.neighbors(author))
        coauthored_papers.discard(paper_title)
        coauth_recs = list(coauthored_papers)[:top_n]
        
        return {"content": content_recs, "coauthorship": coauth_recs}
    
    def export_data(self, format="gexf"):
        """Export graph to GEXF, GraphML, or CSV"""
        if format == "gexf":
            nx.write_gexf(self.graph, "graph.gexf")
        elif format == "graphml":
            nx.write_graphml(self.graph, "graph.graphml")
        elif format == "csv":
            pd.DataFrame(self.graph.nodes(data=True)).to_csv("nodes.csv")
            pd.DataFrame(self.graph.edges(data=True)).to_csv("edges.csv")

# Streamlit UI
def main():
    st.title("📚 Research Knowledge Graph Explorer")
    query = st.sidebar.text_input("Search arXiv:", value="Machine Learning")
    max_results = st.sidebar.slider("Max papers:", 5, 50, 10)
        
    kg = ResearchKnowledgeGraph()
    if st.sidebar.button("Build Graph"):
        with st.spinner("Fetching papers and building graph..."):
            kg.fetch_papers(query, max_results)
            kg.add_to_graph()
            st.session_state.graph = kg
        
    if "graph" in st.session_state:
        st.header("Interactive Graph")
        html_file = st.session_state.graph.visualize_graph()
        with open(html_file, "r") as f:
            st.components.v1.html(f.read(), height=800)
        
        st.header("Paper Recommendations")
        paper_options = [paper["title"] for paper in st.session_state.graph.papers]
        selected_paper = st.selectbox("Select a paper:", paper_options)
        if selected_paper:
            recs = st.session_state.graph.recommend_papers(selected_paper)
            st.subheader("Content-based Recommendations")
            for title, score in recs["content"]:
                st.write(f"- {title} (Score: {score:.2f})")
            
            st.subheader("Co-authorship Recommendations")
            for title in recs["coauthorship"]:
                st.write(f"- {title}")
        
        st.sidebar.header("Export Data")
        export_format = st.sidebar.selectbox("Format:", ["gexf", "graphml", "csv"])
        if st.sidebar.button("Export"):
            st.session_state.graph.export_data(export_format)
            st.sidebar.success(f"Exported to {export_format}!")

if __name__ == "__main__":
    main()