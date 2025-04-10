import streamlit as st
import fitz  
from groq import Groq
from elevenlabs.client import ElevenLabs
from elevenlabs import save
from pydantic import BaseModel, Field
import os
from pydub import AudioSegment

# Set API Keys directly (Replace with your actual keys)
GROQ_API_KEY = "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"
ELEVENLABS_API_KEY = "sk_5d5450bcaad4048719579cee294708ee44b8ee0a081a267f"

# Initialize API Clients
groq_client = Groq(api_key=GROQ_API_KEY)
elevenlabs_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

# Define a simple Q&A format using Pydantic
class QAFormat(BaseModel):
    question: str = Field(..., description="Generated question")
    answer: str = Field(..., description="Generated answer")

def extract_text_from_pdf(pdf_file):
    """Extracts text from a PDF file."""
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
    text = "\n".join([page.get_text("text") for page in doc])
    return text[:5000]  # Limit text length for processing

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

# Streamlit UI
st.title("🎙️ ResearchHive Podcast Generator")

uploaded_file = st.file_uploader("Upload research paper (PDF)", type=["pdf"])
podcast_duration = st.slider("Desired podcast duration (minutes)", 3, 30, 12)

if uploaded_file:
    with st.spinner("📖 Analyzing research paper..."):
        research_text = extract_text_from_pdf(uploaded_file)
        st.success("Text extracted successfully!")

    if st.button("✨ Generate Podcast"):
        with st.spinner("🧠 Crafting podcast content..."):
            intro, qa_pairs, outro = generate_podcast_content(research_text, podcast_duration)
            
            st.subheader("Podcast Script Preview")
            st.markdown(f"**Intro:**\n{intro}")
            for i, qa in enumerate(qa_pairs, 1):
                st.markdown(f"\n**Q{i}:** {qa.question}\n\n**A{i}:** {qa.answer}")
            st.markdown(f"\n**Outro:**\n{outro}")

            with st.spinner("🔊 Generating audio..."):
                audio_file = text_to_speech(intro, qa_pairs, outro)
                st.success("🎧 Podcast ready!")
                st.audio(audio_file, format="audio/mp3")
                st.download_button(
                    "💾 Download Podcast",
                    audio_file,
                    file_name="research_podcast.mp3",
                    mime="audio/mp3"
                )