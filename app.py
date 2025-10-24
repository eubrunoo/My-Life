from flask import Flask, render_template, request, redirect, url_for, jsonify
import uuid
from flask_login import UserMixin, LoginManager, login_user, login_required, logout_user, current_user
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash

import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
db = SQLAlchemy(app)

app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")

login_manager = LoginManager()
login_manager.init_app(app)

migrate = Migrate(app, db)

class Item(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer(), primary_key=True)
    description = db.Column(db.String(length=80), nullable=False)
    completed = db.Column(db.Boolean(), nullable=False, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'completed': self.completed
        }

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(length=80), nullable=False)
    email = db.Column(db.String(length= 80), nullable=False)
    password_hash = db.Column(db.String(length= 128), nullable=False)

    tasks = db.relationship('Item', backref='owner', lazy=True)

    @property
    def is_active(self):
        return True 

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return str(self.id)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        user_email = request.form.get('email')
        user_name = request.form.get('name')
        user_password = request.form.get('password')

        existing_user = User.query.filter_by(email=user_email).first()
        if existing_user:
            return redirect(url_for('register'))

        new_user = User(email=user_email, name=user_name)
        new_user.set_password(user_password)

        db.session.add(new_user)
        db.session.commit()

        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user_email = request.form.get('email')
        user_password = request.form.get('password')
        user = User.query.filter_by(email=user_email).first()
        
        if user and user.check_password(user_password):
            login_user(user)

            return redirect(url_for('home_page'))
        
        return redirect(url_for('login'))

    return render_template('login.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/')
@app.route('/home')
def home_page():
    return render_template('index.html', user=current_user)


@app.route('/api/tasks', methods=['GET', 'POST'])
@login_required
def handle_tasks():
    if request.method == 'GET':
        user_tasks = Item.query.filter_by(user_id=current_user.id).all()
        return jsonify([task.to_dict() for task in user_tasks])
    
    elif request.method == 'POST':
        data = request.get_json()
        description = data.get('description')
        
        if not description:
            return jsonify({"error": "A descrição da tarefa é obrigatória."}), 400
        
        new_task = Item(
            description=description,
            user_id=current_user.id,
        )
        
        db.session.add(new_task)
        db.session.commit()
        
        return jsonify(new_task.to_dict()), 201
    return jsonify({"error": "Método não permitido."}), 405

@app.route('/api/tasks/<int:task_id>', methods=['PUT', 'DELETE'])
@login_required
def handle_single_task(task_id):
    task = Item.query.filter_by(id=task_id, user_id=current_user.id).first()
    
    if not task:
        return jsonify({"error": "Tarefa não encontrada ou acesso negado."}), 404

    if request.method == 'PUT':
        data = request.get_json()
        
        if 'completed' in data and isinstance(data['completed'], bool):
            task.completed = data['completed']
            
            db.session.commit()
            
            return jsonify(task.to_dict()), 200
        else:
            return jsonify({"error": "Campo 'completed' (booleano) é obrigatório para atualização."}), 400

    elif request.method == 'DELETE':
        db.session.delete(task)
        db.session.commit()
        
        return '', 204
    
    return jsonify({"error": "Método não permitido."}), 405

@app.route('/api/tasks/<int:item_id>', methods=['DELETE'])
@login_required
def delete_task(item_id):
    item = db.session.get(Item, item_id)
    
    if not item:
        return jsonify({'message': 'Tarefa não encontrada'}), 404
    
    if item.user_id != current_user.id:
        return jsonify({'message': 'Não autorizado'}), 403 
        
    db.session.delete(item)
    db.session.commit()
    
    return jsonify({'message': 'Tarefa deletada com sucesso'}), 200