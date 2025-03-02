import os

class Config:
    MISTRAL_API_KEY = os.getenv('MISTRAL_API_KEY', '3UR9RkUF4od4OG4fwu10c94djsxGf3S8')
    HUGGINGFACEHUB_API_TOKEN = os.getenv('HUGGINGFACEHUB_API_TOKEN', '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')