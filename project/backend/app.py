from flask import Flask, request, jsonify, redirect, url_for
from flask_cors import CORS
from flask_migrate import Migrate
from models import db, User, Translation
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
import jwt
from functools import wraps

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Clerk configuration
CLERK_SECRET_KEY = os.getenv('CLERK_SECRET_KEY')
CLERK_JWT_ISSUER = os.getenv('CLERK_JWT_ISSUER', 'https://clerk.your-domain.com')

def verify_clerk_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        print(f"Auth header: {auth_header}")  # Debug log
        
        if not auth_header or not auth_header.startswith('Bearer '):
            print("No valid auth header")  # Debug log
            return jsonify({"error": "No token provided"}), 401
            
        token = auth_header.split(' ')[1]
        print(f"Token received: {token[:20]}...")  # Debug log (only print first 20 chars)
        
        try:
            # Decode the JWT token without verification for now
            # In production, you should verify the token with Clerk's public key
            decoded = jwt.decode(token, options={"verify_signature": False})
            print(f"Decoded token: {decoded}")  # Debug log
            
            # Get the user ID from the sub claim
            user_id = decoded.get('sub')
            if not user_id:
                print("No user ID in token")  # Debug log
                return jsonify({"error": "Invalid token format"}), 401
            
            # Get or create user
            user = User.query.filter_by(google_id=user_id).first()
            if not user:
                print(f"Creating new user with ID: {user_id}")  # Debug log
                user = User(
                    email=None,  # Set to None instead of empty string
                    name=None,   # Set to None instead of empty string
                    picture=None, # Set to None instead of empty string
                    google_id=user_id
                )
                db.session.add(user)
                db.session.commit()
            else:
                print(f"Found existing user: {user.id}")  # Debug log
            
            # Add user to request context
            request.user = user
            
            return f(*args, **kwargs)
            
        except Exception as e:
            print(f"Token verification error: {str(e)}")  # Debug log
            return jsonify({"error": "Token verification failed"}), 401
            
    return decorated_function

# Register blueprints
app.register_blueprint(chatbot_bp)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///translator.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)

# Create tables with the correct schema
with app.app_context():
    db.drop_all()  # Drop all tables
    db.create_all()  # Create tables with the correct schema

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

# Initialize translator with service URLs
translator = Translator(service_urls=['translate.google.com'])

@app.route('/api/dashboard/stats', methods=['GET'])
@verify_clerk_token
def get_dashboard_stats():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        user = request.user  # Get user from request context
        # Get today's translations count
        today = datetime.utcnow().date()
        translations_today = Translation.query.filter(
            db.func.date(Translation.created_at) == today,
            Translation.user_id == user.id
        ).count()

        # Get unique languages used
        languages_used = db.session.query(
            db.func.count(db.func.distinct(Translation.target_lang))
        ).filter(
            Translation.user_id == user.id
        ).scalar()

        # Get favorite translations count
        saved_phrases = Translation.query.filter(
            Translation.user_id == user.id,
            Translation.is_favorite == True
        ).count()

        # Calculate learning streak (simplified for now)
        streak = 7  # This would need a more complex calculation

        return jsonify({
            'translations_today': translations_today,
            'languages_used': languages_used,
            'saved_phrases': saved_phrases,
            'learning_streak': streak
        })
    except Exception as e:
        print(f"Error getting dashboard stats: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/recent-translations', methods=['GET'])
@verify_clerk_token
def get_recent_translations():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        user = request.user  # Get user from request context
        translations = Translation.query.filter_by(
            user_id=user.id
        ).order_by(
            Translation.created_at.desc()
        ).limit(5).all()

        return jsonify({
            'translations': [{
                'id': t.id,
                'from': t.source_text,
                'to': t.translated_text,
                'date': t.created_at.strftime('%Y-%m-%d %H:%M:%S')
            } for t in translations]
        })
    except Exception as e:
        print(f"Error getting recent translations: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/update-preferences', methods=['POST', 'OPTIONS'])
@verify_clerk_token
def update_dashboard_preferences():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        user = request.user  # Get user from request context
        data = request.get_json()
        if 'primary_language' in data:
            user.preferred_language = data['primary_language']
            db.session.commit()
            return jsonify({'message': 'Preferences updated successfully'})
        return jsonify({'error': 'Invalid data'}), 400
    except Exception as e:
        print(f"Error updating preferences: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/recognize', methods=['POST'])
@verify_clerk_token
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
        
    # Only verify token for POST requests
    @verify_clerk_token
    def handle_translate():
        try:
            data = request.get_json()
            text = data.get('text')
            source_lang = data.get('source_lang', 'auto')
            target_lang = data.get('target_lang', 'en')
            
            if not text:
                return jsonify({'error': 'No text provided'}), 400
                
            print(f"Received translation request: {text[:50]}...")  # Debug log
            print(f"Source language: {source_lang}, Target language: {target_lang}")  # Debug log
            
            # Use deep_translator for translation
            try:
                translated = GoogleTranslator(source=source_lang, target=target_lang).translate(text)
                print(f"Translation successful: {translated[:50]}...")  # Debug log
                
                # Save translation to database
                translation = Translation(
                    user_id=request.user.id,
                    source_text=text,
                    translated_text=translated,
                    source_lang=source_lang,
                    target_lang=target_lang
                )
                db.session.add(translation)
                db.session.commit()
                
                return jsonify({
                    'translated_text': translated,
                    'source_lang': source_lang,
                    'target_lang': target_lang
                })
            except Exception as e:
                print(f"Translation error: {str(e)}")  # Debug log
                return jsonify({'error': str(e)}), 500
                
        except Exception as e:
            print(f"Translation endpoint error: {str(e)}")  # Debug log
            return jsonify({'error': str(e)}), 500
            
    return handle_translate()

@app.route('/api/text-to-speech', methods=['POST', 'OPTIONS'])
def text_to_speech():
    if request.method == 'OPTIONS':
        return '', 204
        
    # Only verify token for POST requests
    @verify_clerk_token
    def handle_text_to_speech():
        try:
            data = request.get_json()
            text = data.get('text')
            language = data.get('language', 'en')
            
            if not text:
                return jsonify({'error': 'No text provided'}), 400
                
            print(f"Received text-to-speech request for language: {language}")  # Debug log
                
            # Map language codes for gTTS
            language_map = {
                'zh-CN': 'zh-cn',
                'zh-TW': 'zh-tw',
                'en': 'en',
                'es': 'es',
                'fr': 'fr',
                'de': 'de',
                'it': 'it',
                'pt': 'pt',
                'ru': 'ru',
                'ja': 'ja',
                'ko': 'ko'
            }
            
            # Get the correct language code for gTTS
            tts_lang = language_map.get(language, 'en')
            print(f"Using gTTS language code: {tts_lang}")  # Debug log
                
            # Create a temporary file to store the audio
            temp_file = None
            try:
                temp_file = tempfile.NamedTemporaryFile(suffix='.mp3', delete=False)
                temp_file_path = temp_file.name
                temp_file.close()
                
                print(f"Created temporary file: {temp_file_path}")  # Debug log
                
                # Generate speech using gTTS
                tts = gTTS(text=text, lang=tts_lang)
                tts.save(temp_file_path)
                print("Successfully generated audio file")  # Debug log
                
                # Read the audio file and convert to base64
                with open(temp_file_path, 'rb') as audio_file:
                    audio_data = base64.b64encode(audio_file.read()).decode('utf-8')
                    print("Successfully encoded audio data")  # Debug log
                
                return jsonify({
                    'audio_data': audio_data
                })
                
            except Exception as e:
                print(f"Error in text-to-speech processing: {str(e)}")  # Debug log
                raise e
                
            finally:
                # Clean up the temporary file
                if temp_file and os.path.exists(temp_file_path):
                    try:
                        os.unlink(temp_file_path)
                        print("Cleaned up temporary file")  # Debug log
                    except Exception as e:
                        print(f"Error cleaning up temporary file: {str(e)}")  # Debug log
                
        except Exception as e:
            print(f"Text-to-speech error: {str(e)}")  # Add logging
            return jsonify({'error': str(e)}), 500
            
    return handle_text_to_speech()

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

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or 'token' not in data:
            return jsonify({"error": "No token provided"}), 400
            
        # Verify the token with Clerk
        # For now, we'll just create a user if they don't exist
        user = User.query.filter_by(google_id=data['token']).first()
        if not user:
            user = User(
                email=data.get('email', ''),
                name=data.get('name', ''),
                picture=data.get('picture', ''),
                google_id=data['token']
            )
            db.session.add(user)
            db.session.commit()
        
        request.user = user
        return jsonify({"message": "Logged in successfully"})
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    # Get port from environment variable or use default
    port = int(os.getenv('PORT', 5000))
    # Run on all interfaces (0.0.0.0) instead of just localhost
    app.run(host='0.0.0.0', port=port, debug=True)
