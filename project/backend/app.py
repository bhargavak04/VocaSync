from flask import Flask, request, jsonify, redirect, url_for, session
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from models import db, User
import speech_recognition as sr
from deep_translator import GoogleTranslator
from gtts import gTTS
import os
import tempfile
import base64
import requests
from datetime import datetime
import urllib3
import time
import json
from googletrans import Translator
from dotenv import load_dotenv
from chatbot import chatbot_bp

load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Required for session management

# Register blueprints
app.register_blueprint(chatbot_bp)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///translator.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Disable SSL verification warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Initialize recognizer
recognizer = sr.Recognizer()
# Set shorter timeout for speech recognition
recognizer.operation_timeout = 5  # 5 seconds timeout

# Language code mapping for special cases
LANGUAGE_CODE_MAP = {
    'zh': 'chinese',    # Updated language codes
    'ja': 'japanese',
    'ko': 'korean',
    'ar': 'arabic',
    'hi': 'hindi',
    'en': 'english',
    'es': 'spanish',
    'fr': 'french',
    'de': 'german',
    'it': 'italian',
    'pt': 'portuguese',
    'ru': 'russian'
}

# CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Initialize translator with service URLs
translator = Translator(service_urls=['translate.google.com'])

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"})

@app.route('/api/auth/user', methods=['GET'])
@login_required
def get_user():
    return jsonify({
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "picture": current_user.picture,
        "preferred_language": current_user.preferred_language
    })

@app.route('/api/auth/update-preferences', methods=['POST'])
@login_required
def update_preferences():
    data = request.get_json()
    if 'preferred_language' in data:
        current_user.preferred_language = data['preferred_language']
        db.session.commit()
        return jsonify({"message": "Preferences updated successfully"})
    return jsonify({"error": "Invalid data"}), 400

@app.route('/api/recognize', methods=['POST'])
@login_required
def recognize_speech():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    
    audio_file = request.files['audio']
    language = request.form.get('language', 'en-US')
    
    try:
        # Save the uploaded audio file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
            audio_file.save(temp_audio.name)
            temp_audio_path = temp_audio.name
        
        # Use speech recognition to convert audio to text
        with sr.AudioFile(temp_audio_path) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data, language=language)
        
        # Clean up the temporary file
        os.unlink(temp_audio_path)
        
        return jsonify({'text': text})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/translate', methods=['POST', 'OPTIONS'])
def translate():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.get_json()
        text = data.get('text')
        source_lang = data.get('source_lang', 'auto')
        target_lang = data.get('target_lang', 'en')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
            
        translation = translator.translate(text, src=source_lang, dest=target_lang)
        return jsonify({
            'translated_text': translation.text,
            'source_lang': translation.src,
            'target_lang': translation.dest
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/text-to-speech', methods=['POST', 'OPTIONS'])
def text_to_speech():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.get_json()
        text = data.get('text')
        language = data.get('language', 'en')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
            
        # For now, return a placeholder audio data
        # In production, you would use a text-to-speech service
        return jsonify({
            'audio_data': 'base64_encoded_audio_data_here'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/detect-location', methods=['GET', 'OPTIONS'])
def detect_location():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        # For now, return a default language based on IP
        # In production, you would use a geolocation service
        return jsonify({
            'suggested_language': {
                'code': 'en',
                'name': 'English'
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add languages list to match frontend
languages = [
    {'code': 'en', 'name': 'English'},
    {'code': 'es', 'name': 'Spanish'},
    {'code': 'fr', 'name': 'French'},
    {'code': 'de', 'name': 'German'},
    {'code': 'it', 'name': 'Italian'},
    {'code': 'pt', 'name': 'Portuguese'},
    {'code': 'ru', 'name': 'Russian'},
    {'code': 'ja', 'name': 'Japanese'},
    {'code': 'ko', 'name': 'Korean'},
    {'code': 'zh', 'name': 'Chinese'},
    {'code': 'ar', 'name': 'Arabic'},
    {'code': 'hi', 'name': 'Hindi'},
]

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
