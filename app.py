import sqlite3
import os
import re
import logging
from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired
import bleach

app = Flask(__name__)
app.config['SECRET_KEY'] = 'educational-secret-key-do-not-use-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

logging.basicConfig(filename='attack_log.txt', level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')

ATTACK_LOG = []

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120))

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Login')

class SearchForm(FlaskForm):
    query = StringField('Search', validators=[DataRequired()])
    submit = SubmitField('Search')

class CommentForm(FlaskForm):
    comment = StringField('Comment', validators=[DataRequired()])
    submit = SubmitField('Post')

class PingForm(FlaskForm):
    host = StringField('Host', validators=[DataRequired()])
    submit = SubmitField('Ping')

def detect_sql_injection(user_input):
    sql_patterns = [
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)",
        r"(--|;|'|\"|%27|%22|%3B)",
        r"(\bOR\b.*=.*\bOR\b)",
        r"(\bAND\b.*=.*\bAND\b)",
    ]
    for pattern in sql_patterns:
        if re.search(pattern, user_input, re.IGNORECASE):
            return True
    return False

def detect_xss(user_input):
    xss_patterns = [
        r"<script",
        r"javascript:",
        r"onerror=",
        r"onload=",
        r"<iframe",
        r"<img",
        r"alert\(",
    ]
    for pattern in xss_patterns:
        if re.search(pattern, user_input, re.IGNORECASE):
            return True
    return False

def detect_command_injection(user_input):
    cmd_patterns = [
        r"[;&|`$]",
        r"\b(cat|ls|dir|whoami|ifconfig|ipconfig|nc|bash|sh)\b",
        r"\|",
        r">",
        r"<",
    ]
    for pattern in cmd_patterns:
        if re.search(pattern, user_input, re.IGNORECASE):
            return True
    return False

def log_attack(attack_type, details, ip):
    attack_info = {
        'type': attack_type,
        'details': details,
        'ip': ip,
        'user_agent': request.headers.get('User-Agent')
    }
    ATTACK_LOG.append(attack_info)
    logging.warning(f"{attack_type} detected from {ip}: {details}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if detect_sql_injection(username) or detect_sql_injection(password):
            ip = request.remote_addr
            log_attack('SQL_INJECTION', f'Username: {username}, Password: {password}', ip)
            flash('SQL Injection attempt detected!', 'danger')
            return redirect(url_for('login'))
        
        conn = sqlite3.connect('app.db')
        cursor = conn.cursor()
        query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
        
        try:
            cursor.execute(query)
            user = cursor.fetchone()
            conn.close()
            
            if user:
                session['user'] = user[1]
                flash(f'Welcome {user[1]}!', 'success')
                return redirect(url_for('dashboard'))
            else:
                flash('Invalid credentials', 'danger')
        except Exception as e:
            conn.close()
            flash(f'Error: {str(e)}', 'danger')
    
    return render_template('login.html', form=form)

@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template('dashboard.html', user=session['user'])

@app.route('/search', methods=['GET', 'POST'])
def search():
    form = SearchForm()
    results = []
    if request.method == 'POST':
        query = request.form.get('query')
        
        if detect_xss(query):
            ip = request.remote_addr
            log_attack('XSS', f'Search query: {query}', ip)
            flash('XSS attack attempt detected!', 'danger')
            return redirect(url_for('search'))
        
        conn = sqlite3.connect('app.db')
        cursor = conn.cursor()
        cursor.execute(f"SELECT * FROM users WHERE username LIKE '%{query}%' OR email LIKE '%{query}%'")
        results = cursor.fetchall()
        conn.close()
    
    return render_template('search.html', form=form, results=results)

@app.route('/comments', methods=['GET', 'POST'])
def comments():
    form = CommentForm()
    comments_list = []
    
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY, comment TEXT)")
    cursor.execute("SELECT * FROM comments")
    comments_list = cursor.fetchall()
    
    if request.method == 'POST':
        comment = request.form.get('comment')
        
        if detect_xss(comment):
            ip = request.remote_addr
            log_attack('XSS', f'Comment: {comment}', ip)
            flash('XSS attack attempt detected in comment!', 'danger')
            conn.close()
            return redirect(url_for('comments'))
        
        cursor.execute("INSERT INTO comments (comment) VALUES (?)", (comment,))
        conn.commit()
        cursor.execute("SELECT * FROM comments")
        comments_list = cursor.fetchall()
        conn.close()
        flash('Comment posted!', 'success')
        return redirect(url_for('comments'))
    
    conn.close()
    return render_template('comments.html', form=form, comments=comments_list)

@app.route('/ping', methods=['GET', 'POST'])
def ping():
    form = PingForm()
    result = None
    if request.method == 'POST':
        host = request.form.get('host')
        
        if detect_command_injection(host):
            ip = request.remote_addr
            log_attack('COMMAND_INJECTION', f'Host: {host}', ip)
            flash('Command Injection attempt detected!', 'danger')
            return redirect(url_for('ping'))
        
        import subprocess
        import platform
        try:
            count_flag = '-n' if platform.system().lower() == 'windows' else '-c'
            result = subprocess.check_output(['ping', count_flag, '1', host],
                                           stderr=subprocess.STDOUT, 
                                           text=True, timeout=5)
        except Exception as e:
            result = str(e)
    
    return render_template('ping.html', form=form, result=result)

@app.route('/transfer', methods=['GET', 'POST'])
def transfer():
    if 'user' not in session:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        to_user = request.form.get('to_user')
        amount = request.form.get('amount')
        
        flash(f'Transfer of ${amount} to {to_user} initiated (CSRF vulnerable)', 'warning')
        return redirect(url_for('transfer'))
    
    return render_template('transfer.html')

@app.route('/admin/attacks')
def view_attacks():
    return render_template('attacks.html', attacks=ATTACK_LOG)

@app.route('/logout')
def logout():
    session.pop('user', None)
    flash('Logged out successfully', 'info')
    return redirect(url_for('index'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        conn = sqlite3.connect('app.db')
        cursor = conn.cursor()
        cursor.execute("CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY, comment TEXT)")
        
        cursor.execute("SELECT * FROM users WHERE username = 'admin'")
        if not cursor.fetchone():
            cursor.execute("INSERT INTO users (username, password, email) VALUES ('admin', 'admin123', 'admin@example.com')")
            cursor.execute("INSERT INTO users (username, password, email) VALUES ('john', 'john123', 'john@example.com')")
            cursor.execute("INSERT INTO users (username, password, email) VALUES ('jane', 'jane123', 'jane@example.com')")
        
        conn.commit()
        conn.close()
    
    app.run(debug=True, port=5000)
