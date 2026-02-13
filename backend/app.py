from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import jwt
import datetime
import os
from models import db, User, Document, Chat, Message
from document_extractor import extract_text_from_file
from groq_service import get_groq_response

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///answerxtractor.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

CORS(app)
db.init_app(app)

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# ==================== AUTH ENDPOINTS ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required!'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User already exists!'}), 400
    
    hashed_password = generate_password_hash(data['password'])
    new_user = User(email=data['email'], password_hash=hashed_password)
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully!'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required!'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'message': 'Invalid credentials!'}), 401
    
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, app.config['SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'email': user.email
        }
    }), 200

# ==================== DOCUMENT ENDPOINTS ====================

@app.route('/api/documents', methods=['GET'])
@token_required
def get_documents(current_user):
    documents = Document.query.filter_by(user_id=current_user.id).order_by(Document.uploaded_at.desc()).all()
    return jsonify([{
        'id': doc.id,
        'filename': doc.filename,
        'uploaded_at': doc.uploaded_at.isoformat()
    } for doc in documents]), 200

@app.route('/api/documents/upload', methods=['POST'])
@token_required
def upload_document(current_user):
    if 'file' not in request.files:
        return jsonify({'message': 'No file provided!'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'message': 'No file selected!'}), 400
    
    allowed_extensions = {'pdf', 'docx', 'pptx', 'txt'}
    file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
    
    if file_ext not in allowed_extensions:
        return jsonify({'message': 'File type not supported!'}), 400
    
    try:
        # Extract text from file
        extracted_text = extract_text_from_file(file, file_ext)
        
        if not extracted_text.strip():
            return jsonify({'message': 'No text could be extracted from the document!'}), 400
        
        # Save document to database
        new_document = Document(
            user_id=current_user.id,
            filename=file.filename,
            extracted_text=extracted_text
        )
        
        db.session.add(new_document)
        db.session.commit()
        
        return jsonify({
            'message': 'Document uploaded successfully!',
            'document': {
                'id': new_document.id,
                'filename': new_document.filename,
                'uploaded_at': new_document.uploaded_at.isoformat()
            }
        }), 201
    
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error processing document {file.filename}: {str(e)}")
        print(f"Details: {error_details}")
        return jsonify({'message': 'Error processing document!', 'error': str(e)}), 500

@app.route('/api/documents/<int:document_id>', methods=['DELETE'])
@token_required
def delete_document(current_user, document_id):
    document = Document.query.filter_by(id=document_id, user_id=current_user.id).first()
    
    if not document:
        return jsonify({'message': 'Document not found!'}), 404
    
    # Delete associated chats and messages
    chats = Chat.query.filter_by(document_id=document_id).all()
    for chat in chats:
        Message.query.filter_by(chat_id=chat.id).delete()
    Chat.query.filter_by(document_id=document_id).delete()
    
    db.session.delete(document)
    db.session.commit()
    
    return jsonify({'message': 'Document deleted successfully!'}), 200

# ==================== CHAT ENDPOINTS ====================

@app.route('/api/chats', methods=['GET'])
@token_required
def get_chats(current_user):
    chats = Chat.query.filter_by(user_id=current_user.id).order_by(Chat.created_at.desc()).all()
    
    result = []
    for chat in chats:
        document = Document.query.get(chat.document_id)
        messages = Message.query.filter_by(chat_id=chat.id).order_by(Message.timestamp.asc()).all()
        
        # Get first user message as preview
        preview = "New chat"
        for msg in messages:
            if msg.sender == 'user':
                preview = msg.message[:50] + ('...' if len(msg.message) > 50 else '')
                break
        
        result.append({
            'id': chat.id,
            'document_id': chat.document_id,
            'document_name': document.filename if document else 'Unknown',
            'created_at': chat.created_at.isoformat(),
            'preview': preview
        })
    
    return jsonify(result), 200

@app.route('/api/chats', methods=['POST'])
@token_required
def create_chat(current_user):
    data = request.get_json()
    
    if not data or not data.get('document_id'):
        return jsonify({'message': 'Document ID is required!'}), 400
    
    # Verify document belongs to user
    document = Document.query.filter_by(id=data['document_id'], user_id=current_user.id).first()
    
    if not document:
        return jsonify({'message': 'Document not found!'}), 404
    
    new_chat = Chat(
        user_id=current_user.id,
        document_id=data['document_id']
    )
    
    db.session.add(new_chat)
    db.session.commit()
    
    return jsonify({
        'id': new_chat.id,
        'document_id': new_chat.document_id,
        'created_at': new_chat.created_at.isoformat()
    }), 201

@app.route('/api/chats/<int:chat_id>', methods=['GET'])
@token_required
def get_chat_messages(current_user, chat_id):
    chat = Chat.query.filter_by(id=chat_id, user_id=current_user.id).first()
    
    if not chat:
        return jsonify({'message': 'Chat not found!'}), 404
    
    messages = Message.query.filter_by(chat_id=chat_id).order_by(Message.timestamp.asc()).all()
    
    return jsonify([{
        'id': msg.id,
        'sender': msg.sender,
        'message': msg.message,
        'timestamp': msg.timestamp.isoformat()
    } for msg in messages]), 200

@app.route('/api/chats/<int:chat_id>/messages', methods=['POST'])
@token_required
def send_message(current_user, chat_id):
    chat = Chat.query.filter_by(id=chat_id, user_id=current_user.id).first()
    
    if not chat:
        return jsonify({'message': 'Chat not found!'}), 404
    
    data = request.get_json()
    
    if not data or not data.get('message'):
        return jsonify({'message': 'Message is required!'}), 400
    
    # Get document context
    document = Document.query.get(chat.document_id)
    
    if not document:
        return jsonify({'message': 'Document not found!'}), 404
    
    # Save user message
    user_message = Message(
        chat_id=chat_id,
        sender='user',
        message=data['message']
    )
    db.session.add(user_message)
    db.session.commit()
    
    try:
        # Get AI response from Groq
        no_context = data.get('no_context', False)
        ai_response = get_groq_response(document.extracted_text, data['message'], no_context=no_context)
        
        # Save AI message
        ai_message = Message(
            chat_id=chat_id,
            sender='ai',
            message=ai_response
        )
        db.session.add(ai_message)
        db.session.commit()
        
        return jsonify({
            'user_message': {
                'id': user_message.id,
                'sender': 'user',
                'message': user_message.message,
                'timestamp': user_message.timestamp.isoformat()
            },
            'ai_message': {
                'id': ai_message.id,
                'sender': 'ai',
                'message': ai_message.message,
                'timestamp': ai_message.timestamp.isoformat()
            }
        }), 201
    
    except Exception as e:
        return jsonify({'message': 'Error getting AI response!', 'error': str(e)}), 500

@app.route('/api/chats/<int:chat_id>', methods=['DELETE'])
@token_required
def delete_chat(current_user, chat_id):
    chat = Chat.query.filter_by(id=chat_id, user_id=current_user.id).first()
    
    if not chat:
        return jsonify({'message': 'Chat not found!'}), 404
    
    # Delete messages first
    Message.query.filter_by(chat_id=chat_id).delete()
    db.session.delete(chat)
    db.session.commit()
    
    return jsonify({'message': 'Chat deleted successfully!'}), 200

# ==================== HEALTH CHECK ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

@app.route('/api/documents/<int:doc_id>/study-tools', methods=['POST'])
@token_required
def get_study_tools(current_user, doc_id):
    document = Document.query.filter_by(id=doc_id, user_id=current_user.id).first()
    if not document:
        return jsonify({'message': 'Document not found!'}), 404
        
    data = request.json
    tool_type = data.get('type') # flashcards, quiz, mindmap
    
    if tool_type not in ['flashcards', 'quiz', 'mindmap']:
        return jsonify({'message': 'Invalid tool type!'}), 400
        
    try:
        from groq_service import generate_study_material
        result = generate_study_material(document.extracted_text, tool_type)
        return jsonify(result)
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ==================== DATABASE INITIALIZATION ====================

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
