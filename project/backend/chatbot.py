from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory
from langchain.chains import LLMChain
from dotenv import load_dotenv
from flask import Blueprint, request, jsonify
from googletrans import Translator
import random

load_dotenv()

# Initialize Groq with Llama 3
llm = ChatGroq(
    model="llama-3.1-8b-instant",  # Updated to current Groq model name
    temperature=0.7,  # Slightly higher for more natural conversations
    max_tokens=1024,
    timeout=30,
    max_retries=3,
)

# System message template with multilingual support
system_template = """You are a friendly, patient language learning assistant named LinguaBot. 
Your role is to help users practice {language} through conversation. You should:
- Respond naturally in {language} at the user's proficiency level
- Provide English translations in parentheses when needed
- Gently correct mistakes with explanations
- Adapt to conversational scenarios the user suggests
- Maintain a positive, encouraging tone

Current conversation:
{history}"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_template),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}"),
])

# Conversation memory
memory = ConversationBufferMemory(
    memory_key="history",
    return_messages=True,
    input_key="input"
)

# Create conversation chain
conversation_chain = LLMChain(
    llm=llm,
    prompt=prompt,
    memory=memory,
    verbose=False  # Set to True if you want to see debugging info
)

chatbot_bp = Blueprint('chatbot', __name__)
# Initialize translator with service URLs
translator = Translator(service_urls=['translate.google.com'])

# Conversation templates for different scenarios
CONVERSATION_TEMPLATES = {
    'greeting': [
        "Hello! I'm your language assistant. How can I help you today?",
        "Hi there! I can help you choose the right language for translation. What's your goal?",
        "Welcome! Would you like help selecting a language for translation?"
    ],
    'purpose': [
        "I understand you want to {purpose}. For this purpose, I would recommend {language}.",
        "Based on your goal of {purpose}, {language} would be a great choice.",
        "For {purpose}, {language} is commonly used and would be suitable."
    ],
    'follow_up': [
        "Would you like to practice a simple conversation in {language}?",
        "I can help you with some basic phrases in {language}. Would you like to try?",
        "Let's try a quick conversation in {language}. Are you interested?"
    ],
    'practice': [
        "Great! Let's start with a simple greeting. How would you say 'Hello' in {language}?",
        "Let's practice numbers. Can you count from 1 to 5 in {language}?",
        "Let's try some common phrases. How would you say 'Thank you' in {language}?"
    ],
    'feedback': [
        "That's great! You're doing well with {language}!",
        "Excellent! You're making good progress with {language}.",
        "Well done! You're getting the hang of {language}!"
    ]
}

# Language recommendations based on purpose
LANGUAGE_RECOMMENDATIONS = {
    'business': ['en', 'zh', 'es', 'de', 'ja'],
    'travel': ['es', 'fr', 'it', 'de', 'ja'],
    'education': ['en', 'fr', 'de', 'es', 'ru'],
    'social': ['es', 'fr', 'it', 'pt', 'de'],
    'technical': ['en', 'zh', 'ja', 'de', 'ru']
}

@chatbot_bp.route('/api/chatbot/start', methods=['POST'])
def start_conversation():
    try:
        data = request.get_json()
        purpose = data.get('purpose', 'general')
        
        # Get recommended language based on purpose
        recommended_languages = LANGUAGE_RECOMMENDATIONS.get(purpose, ['en', 'es', 'fr'])
        recommended_lang = random.choice(recommended_languages)
        
        # Get language name
        lang_name = translator.translate('language', dest=recommended_lang).text
        
        # Generate response
        greeting = random.choice(CONVERSATION_TEMPLATES['greeting'])
        purpose_response = random.choice(CONVERSATION_TEMPLATES['purpose']).format(
            purpose=purpose,
            language=lang_name
        )
        follow_up = random.choice(CONVERSATION_TEMPLATES['follow_up']).format(
            language=lang_name
        )
        
        return jsonify({
            'messages': [
                {'role': 'bot', 'content': greeting},
                {'role': 'bot', 'content': purpose_response},
                {'role': 'bot', 'content': follow_up}
            ],
            'recommended_language': recommended_lang
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chatbot_bp.route('/api/chatbot/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        current_language = data.get('language', 'en')
        
        # Get response from the chatbot
        response = conversation_chain.invoke(
            {"input": user_message, "language": current_language}
        )
        
        return jsonify({
            'messages': [
                {'role': 'bot', 'content': response['text']}
            ]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500