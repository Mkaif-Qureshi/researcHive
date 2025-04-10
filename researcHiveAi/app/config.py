import os

class Config:
    MISTRAL_API_KEY = os.getenv('MISTRAL_API_KEY', '3UR9RkUF4od4OG4fwu10c94djsxGf3S8')
    HUGGINGFACEHUB_API_TOKEN = os.getenv('HUGGINGFACEHUB_API_TOKEN', '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')
    GROQ_API_KEY = os.getenv('GROQ_API_KEY', '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')
    ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY', 'sk_811434e76bd30f74c4e57309eac668189b1f386d6f35e729')