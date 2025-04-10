import os
import fitz  # PyMuPDF
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_mistralai import ChatMistralAI
from langchain.schema import HumanMessage

from flask import Blueprint, request, jsonify
from flask import send_file
from groq import Groq
from elevenlabs.client import ElevenLabs
from elevenlabs import save
from pydub import AudioSegment
from app.config import Config 
from pydantic import BaseModel, Field

# Load the embedding model
embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# Load the Mistral model
llm = ChatMistralAI(model="mistral-large-latest", temperature=0)
chat_routes = Blueprint("chat_routes", __name__)

# Global variables for FAISS index and document chunks
faiss_index = None
chunked_texts = None
pdf_path = "uploaded_paper.pdf"  # Default PDF file location

# ------------------------- Extract & Chunk PDF ------------------------- #
def extract_text_from_pdf(pdf_path):
    """Extracts text from a given PDF file."""
    try:
        doc = fitz.open(pdf_path)
        text = "".join(page.get_text("text") + "\n\n" for page in doc).strip()
        return text
    except Exception as e:
        print(f"Error extracting text: {e}")
        return None

def chunk_text(text, chunk_size=2000, chunk_overlap=200):
    """Splits text into smaller chunks for embedding retrieval."""
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    return text_splitter.split_text(text)

def create_faiss_index(chunks):
    """Creates a FAISS index from the research paper chunks."""
    try:
        embeddings = embedding_model.encode(chunks, show_progress_bar=True)
        index = faiss.IndexFlatL2(embeddings.shape[1])
        index.add(np.array(embeddings, dtype=np.float32))
        return index, embeddings
    except Exception as e:
        print(f"Error creating FAISS index: {e}")
        return None, None

def ensure_pdf_processed():
    """Ensures a PDF is processed before querying FAISS."""
    global faiss_index, chunked_texts, pdf_path
    if not os.path.exists(pdf_path):
        return False

    if not faiss_index or not chunked_texts:
        text = extract_text_from_pdf(pdf_path)
        if not text:
            return False
        chunked_texts = chunk_text(text)
        faiss_index, _ = create_faiss_index(chunked_texts)
    return True

def search_faiss(query, k=3):
    """Finds the most relevant chunks using FAISS."""
    if not faiss_index:
        return []
    query_embedding = embedding_model.encode([query], convert_to_numpy=True)
    distances, indices = faiss_index.search(query_embedding, k)
    return [chunked_texts[i] for i in indices[0] if i < len(chunked_texts)]

# ------------------------- AI Processing ------------------------- #
def summarize_retrieved_chunks(retrieved_chunks):
    """Summarizes retrieved chunks using Mistral."""
    if not retrieved_chunks:
        return "No relevant sections found in the document."

    prompt = """
    ### System Role:
    You are a highly skilled AI research assistant with expertise in summarizing complex research papers. Your goal is to extract and condense the most critical information from the provided text into a concise and coherent summary.

    ### Instructions:
    1. **Focus on Key Sections**: Summarize the following sections of the research paper:
       - **Introduction**: Clearly state the purpose of the research and the problem it addresses.
       - **Methodology**: Describe the techniques, tools, and approaches used in the study.
       - **Results**: Highlight the key findings and outcomes of the research.
       - **Conclusion**: Summarize the main takeaways, implications, and any suggested future directions.

    2. **Be Concise**: Avoid unnecessary details. Focus on the most important points.
    3. **Maintain Clarity**: Use clear and professional language. Ensure the summary is easy to understand.
    4. **Structure the Output**: Organize the summary into distinct paragraphs for Introduction, Methodology, Results, and Conclusion.

    ### Text to Summarize:
    """ + "\n\n".join(retrieved_chunks)

    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content

def generate_research_suggestions(retrieved_chunks):
    """Generates research suggestions from retrieved sections using Mistral."""
    if not retrieved_chunks:
        return "No relevant content found for generating research ideas."

    prompt = """
    ### System Role:
    You are an expert research assistant with a deep understanding of academic research and innovation. Your task is to analyze the provided research content and propose actionable, insightful, and innovative future research ideas.

    ### Instructions:
    1. **Focus on Key Areas**:
       - **Extend the Current Study**: Identify gaps or limitations in the current research and propose how the study could be expanded or improved.
       - **Address Unresolved Challenges**: Highlight any unresolved issues or challenges mentioned in the text and suggest ways to tackle them.
       - **Explore Novel Applications**: Propose new applications or domains where the research findings could be applied.

    2. **Be Specific and Practical**:
       - Provide clear, actionable ideas that are grounded in the provided content.
       - Avoid vague or overly broad suggestions.

    3. **Structure the Output**:
       - Present at least 3 research ideas, each with a brief explanation (1-2 sentences) of its rationale and potential impact.
       - Format the output as a numbered list for clarity.

    ### Text to Analyze:
    """ + "\n\n".join(retrieved_chunks)

    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content

# ------------------------- API Endpoints ------------------------- #
@chat_routes.route("/refresh", methods=["POST"])
def refresh_pdf():
    """Handles new PDF uploads, processes the text, and refreshes embeddings."""
    global faiss_index, chunked_texts, pdf_path

    if "pdf" not in request.files:
        return jsonify({"error": "No PDF file provided"}), 400

    pdf_file = request.files["pdf"]
    if pdf_file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        pdf_file.save(pdf_path)
        
        faiss_index = None
        chunked_texts = None

        if not ensure_pdf_processed():
            return jsonify({"error": "Failed to process the uploaded PDF"}), 500

        return jsonify({"message": "PDF uploaded and processed successfully"}), 200
    except Exception as e:
        print(f"Error processing PDF: {e}")
        return jsonify({"error": str(e)}), 500

@chat_routes.route("/summarize", methods=["POST"])
def summarize():
    """Fetches relevant sections using FAISS and summarizes them."""
    if not ensure_pdf_processed():
        return jsonify({"error": "No PDF uploaded. Upload a file first."}), 400

    query = request.json.get("query", "Summarize the research paper")
    retrieved_chunks = search_faiss(query)
    summary = summarize_retrieved_chunks(retrieved_chunks)
    return jsonify({"summary": summary})

@chat_routes.route("/research_suggestions", methods=["POST"])
def research_suggestions():
    """Fetches relevant sections using FAISS and generates research ideas."""
    if not ensure_pdf_processed():
        return jsonify({"error": "No PDF uploaded. Upload a file first."}), 400

    query = request.json.get("query", "Suggest future research directions")
    retrieved_chunks = search_faiss(query)
    suggestions = generate_research_suggestions(retrieved_chunks)
    return jsonify({"research_suggestions": suggestions})

# ------------------------- Chat Route ------------------------- #
@chat_routes.route("/chat", methods=["POST"])
def chat():
    """Handles user queries and answers based on PDF content."""
    if not ensure_pdf_processed():
        return jsonify({"error": "No PDF uploaded. Upload a file first."}), 400

    query = request.json.get("query", "")
    if not query:
        return jsonify({"error": "Query cannot be empty."}), 400

    retrieved_chunks = search_faiss(query)
    
    if not retrieved_chunks:
        response_text = "No relevant information found in the document."
    else:
        prompt = """
        ### System Role:
        You are a highly skilled research assistant. Your task is to answer the user's query based on the provided document sections. Ensure your response is accurate, concise, and directly addresses the query.

        ### Instructions:
        1. **Understand the Query**: Carefully analyze the user's question to identify the key points and intent.
        2. **Use Document Context**: Base your response strictly on the provided document sections. Do not add external information or assumptions.
        3. **Be Concise and Clear**: Provide a clear and concise answer. Avoid unnecessary details or repetition.
        4. **Cite Relevant Sections**: If applicable, reference specific parts of the document to support your answer.

        ### Query:
        {query}

        ### Relevant Document Sections:
        """ + "\n\n".join(retrieved_chunks) + """

        ### Response:
        """

        response = llm.invoke([HumanMessage(content=prompt.format(query=query))])
        response_text = response.content
    
    return jsonify({"response": response_text})

# Initialize new API clients (add after existing client initializations)
groq_client = Groq(api_key=Config.GROQ_API_KEY)  # Use API key from Config
elevenlabs_client = ElevenLabs(api_key=Config.ELEVENLABS_API_KEY) # Replace with your key
# print(Config.ELEVENLABS_API_KEY)

# Define a simple Q&A format using Pydantic
class QAFormat(BaseModel):
    question: str = Field(..., description="Generated question")
    answer: str = Field(..., description="Generated answer")

def generate_podcast_content(text, podcast_duration):
    """Generates intro, Q&A pairs, and outro using Groq API."""
    # Calculate number of questions based on duration (2 minutes per Q&A pair)
    num_questions = max(1, int(podcast_duration // 2))
    
    # Generate Introduction
    intro_prompt = f"""Create a engaging podcast introduction for a research paper. Include:
    1. Warm greeting
    2. Brief context about the research topic
    3. What listeners can expect
    Keep it conversational and under 4 sentences. Paper content: {text[:1000]}"""
    
    intro = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": intro_prompt}],
        temperature=0.7,
    ).choices[0].message.content

    # Generate Q&A Pairs
    qa_prompt = f"""Generate {num_questions} podcast-style Q&A pairs from this research paper. Follow these rules:
    1. Questions should be curious and engaging
    2. Answers should be concise (1-2 short paragraphs)
    3. Use everyday language and examples
    4. Maintain natural flow between questions
    5. Format EXACTLY as: Question: [text]\nAnswer: [text]
    
    Paper content: {text}"""
    
    qa_content = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": qa_prompt}],
        temperature=0.8,
    ).choices[0].message.content

    qa_pairs = []
    for qa in qa_content.split("\n\n"):
        lines = qa.split("\n")
        if len(lines) >= 2:
            question = lines[0].replace("Question: ", "").strip()
            answer = lines[1].replace("Answer: ", "").strip()
            qa_pairs.append(QAFormat(question=question, answer=answer))

    # Generate Outro
    outro_prompt = f"""Create a podcast closing segment that includes:
    1. Thank you message
    2. Key takeaway
    3. Call to engage (e.g., follow for more content)
    Keep it under 3 sentences and conversational."""
    
    outro = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": outro_prompt}],
        temperature=0.7,
    ).choices[0].message.content
    print(intro, qa_pairs, outro)
    return intro, qa_pairs, outro

def text_to_speech(intro, qa_pairs, outro, output_filename="podcast.mp3"):
    """Converts text segments into podcast audio."""
    audio_segments = []
    
    # Generate Introduction
    intro_audio = elevenlabs_client.generate(
        text=intro,
        voice="Rachel",
        model="eleven_multilingual_v2"
    )
    save(intro_audio, "temp_intro.mp3")
    audio_segments.append(AudioSegment.from_mp3("temp_intro.mp3"))
    
    # Generate Q&A
    for idx, qa in enumerate(qa_pairs):
        q_audio = elevenlabs_client.generate(
            text=qa.question,
            voice="Rachel",
            model="eleven_multilingual_v2"
        )
        a_audio = elevenlabs_client.generate(
            text=qa.answer,
            voice="Adam",
            model="eleven_multilingual_v2"
        )        
        save(q_audio, f"temp_q{idx}.mp3")
        save(a_audio, f"temp_a{idx}.mp3")
        
        q_segment = AudioSegment.from_mp3(f"temp_q{idx}.mp3")
        a_segment = AudioSegment.from_mp3(f"temp_a{idx}.mp3")
        silence = AudioSegment.silent(duration=800)
        audio_segments.append(q_segment + silence + a_segment + silence)
        
        os.remove(f"temp_q{idx}.mp3")
        os.remove(f"temp_a{idx}.mp3")

    # Generate Outro
    outro_audio = elevenlabs_client.generate(
        text=outro,
        voice="Rachel",
        model="eleven_multilingual_v2"
    )
    save(outro_audio, "temp_outro.mp3")
    audio_segments.append(AudioSegment.from_mp3("temp_outro.mp3"))
    
    # Combine all segments
    podcast_audio = sum(audio_segments)
    podcast_audio.export(output_filename, format="mp3")
    
    # Cleanup temp files
    os.remove("temp_intro.mp3")
    os.remove("temp_outro.mp3")
    
    return output_filename


@chat_routes.route("/generate_podcast", methods=["POST"])
def generate_podcast():
    """Generates a podcast from the uploaded research paper."""
    if not ensure_pdf_processed():
        return jsonify({"error": "No PDF uploaded. Upload a file first."}), 400

    try:
        # Extract and limit text
        text = extract_text_from_pdf(pdf_path)[:7000]
        if not text:
            return jsonify({"error": "Failed to extract text from PDF"}), 500

        # Get duration from request
        data = request.get_json()
        podcast_duration = data.get("duration", 12)

        # Generate content
        intro, qa_pairs, outro = generate_podcast_content(text, podcast_duration)

        # Generate audio
        audio_io = text_to_speech(intro, qa_pairs, outro)

        return send_file(
            audio_io,
            mimetype="audio/mp3",
            as_attachment=True,
            download_name="research_podcast.mp3"
        )
    except Exception as e:
        # Log the full error for server-side debugging
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Podcast generation failed: {str(e)}"}), 500