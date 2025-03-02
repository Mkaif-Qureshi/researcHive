# ResearchHive: AI-Powered Research Collaboration Platform

## Overview

ResearchHive is an AI-driven platform designed to revolutionize research collaboration and discovery. It enables researchers to efficiently discover relevant work, access datasets, collaborate in real time, and gain AI-generated insights, fostering interdisciplinary research and innovation.

## Features

- **Collaborative Research Paper Editing**: Allows multiple users to update and refine research papers collaboratively.
- **Research Paper Management**: Save, comment, review, and rate research papers with a star-based system.
- **Graph-Based Semantic Search**: Utilize semantic and community-based graphs for intelligent research discovery.
- **LLM Integration**: AI-powered summarization, research suggestions, and a chat module for interactive discussions on papers.
- **User Profiles & Analytics**: Profile building with interests, expertise, and research activity analytics.

## Tech Stack

- **Frontend**: React (Next.js)
- **Backend**: Flask (Python)
- **Database**: PostgreSQL / MongoDB
- **AI & NLP**: LLMs (Mistral, RoBERTa), FAISS for vector search

## Installation & Setup

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/researchHivebackend.git
   cd researchHivebackend
   ```
2. Set up a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```
3. Run the Flask server:
   ```bash
   flask run
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd researchive
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/chat` – AI-driven query response based on research documents.
- `POST /api/chat/refresh` – Refresh document embeddings for updated content.
- `GET /api/papers` – Retrieve research papers with metadata.
- `POST /api/papers/upload` – Upload new research papers.
- `POST /api/profile/update` – Update user profiles with interests and expertise.

## Future Scope

- Advanced AI-driven research recommendations and hypothesis generation.
- Blockchain-based authorship verification and research integrity tracking.
- Real-time collaborative annotations and discussions.
- Integration with global research repositories and funding agencies.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
