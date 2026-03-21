from flask import Flask, redirect, request, jsonify, session
from flask_cors import CORS
import sqlite3
import re
import logging
import os
from datetime import datetime
import requests as http_requests

app = Flask(__name__)
app.secret_key = 'educational-secret-key'
CORS(app, supports_credentials=True)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

logging.basicConfig(filename=os.path.join(BASE_DIR, 'attack_log.txt'), level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

ATTACK_LOG = []

def get_db_connection():
    conn = sqlite3.connect(os.path.join(BASE_DIR, 'app.db'))
    conn.row_factory = sqlite3.Row
    return conn

def detect_sql_injection(user_input):
    if not user_input:
        return False
    sql_patterns = [
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)",
        r"(--|;|'|\"|%27|%22|%3B)",
        r"(\bOR\b.*=.*\bOR\b)",
        r"(\bAND\b.*=.*\bAND\b)",
    ]
    for pattern in sql_patterns:
        if re.search(pattern, str(user_input), re.IGNORECASE):
            return True
    return False

def detect_xss(user_input):
    if not user_input:
        return False
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
        if re.search(pattern, str(user_input), re.IGNORECASE):
            return True
    return False

def detect_command_injection(user_input):
    if not user_input:
        return False
    cmd_patterns = [
        r"[;&|`$]",
        r"\b(cat|ls|dir|whoami|ifconfig|ipconfig|nc|bash|sh)\b",
        r"\|",
        r">",
        r"<",
    ]
    for pattern in cmd_patterns:
        if re.search(pattern, str(user_input), re.IGNORECASE):
            return True
    return False

def log_attack(attack_type, details, ip):
    attack_info = {
        'type': attack_type,
        'details': details,
        'ip': ip,
        'timestamp': datetime.now().isoformat(),
        'user_agent': request.headers.get('User-Agent', 'Unknown'),
    }
    ATTACK_LOG.append(attack_info)
    logging.warning(f"{attack_type} detected from {ip}: {details}")

def setup_database():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, email TEXT)")
    cursor.execute("CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY, comment TEXT)")
    cursor.execute("CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY, user TEXT, type TEXT, amount REAL, description TEXT, date TEXT)")
    cursor.execute("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, price REAL, category TEXT)")
    
    cursor.execute("SELECT * FROM users WHERE username = 'admin'")
    if not cursor.fetchone():
        cursor.execute("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", ('admin', 'admin123', 'admin@example.com'))
        cursor.execute("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", ('john', 'john123', 'john@example.com'))
        cursor.execute("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", ('jane', 'jane123', 'jane@example.com'))
        cursor.execute("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", ('alice', 'alice123', 'alice@example.com'))
        cursor.execute("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", ('bob', 'bob123', 'bob@example.com'))
        
        cursor.execute("INSERT INTO transactions (user, type, amount, description, date) VALUES (?, ?, ?, ?, ?)", ('admin', 'credit', 5000, 'Salary Deposit', '2026-03-01'))
        cursor.execute("INSERT INTO transactions (user, type, amount, description, date) VALUES (?, ?, ?, ?, ?)", ('admin', 'debit', -500, 'Online Shopping', '2026-03-02'))
        cursor.execute("INSERT INTO transactions (user, type, amount, description, date) VALUES (?, ?, ?, ?, ?)", ('admin', 'debit', -200, 'Utility Bill', '2026-03-05'))
        cursor.execute("INSERT INTO transactions (user, type, amount, description, date) VALUES (?, ?, ?, ?, ?)", ('admin', 'credit', 1000, 'Freelance Work', '2026-03-07'))
        cursor.execute("INSERT INTO transactions (user, type, amount, description, date) VALUES (?, ?, ?, ?, ?)", ('admin', 'debit', -150, 'Groceries', '2026-03-08'))
        
        cursor.execute("INSERT INTO products (name, price, category) VALUES (?, ?, ?)", ('Laptop', 999.99, 'Electronics'))
        cursor.execute("INSERT INTO products (name, price, category) VALUES (?, ?, ?)", ('Smartphone', 699.99, 'Electronics'))
        cursor.execute("INSERT INTO products (name, price, category) VALUES (?, ?, ?)", ('Headphones', 149.99, 'Electronics'))
        cursor.execute("INSERT INTO products (name, price, category) VALUES (?, ?, ?)", ('T-Shirt', 29.99, 'Clothing'))
        cursor.execute("INSERT INTO products (name, price, category) VALUES (?, ?, ?)", ('Jeans', 59.99, 'Clothing'))
        cursor.execute("INSERT INTO products (name, price, category) VALUES (?, ?, ?)", ('Coffee Maker', 89.99, 'Home'))
        cursor.execute("INSERT INTO products (name, price, category) VALUES (?, ?, ?)", ('Blender', 49.99, 'Home'))
        cursor.execute("INSERT INTO products (name, price, category) VALUES (?, ?, ?)", ('Textbook', 79.99, 'Books'))
        cursor.execute("INSERT INTO products (name, price, category) VALUES (?, ?, ?)", ('Notebook', 9.99, 'Books'))
        cursor.execute("INSERT INTO products (name, price, category) VALUES (?, ?, ?)", ('Pen Set', 14.99, 'Books'))
    
    conn.commit()
    conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    # If frontend sends JSON:
    data = request.get_json()
    if not data:
        # Fallback to form data if needed
        username = request.form.get('username')
        password = request.form.get('password')
    else:
        username = data.get('username')
        password = data.get('password')

    ip = request.remote_addr

    # Detect SQL injection (log it but still allow the query to execute for demo)
    if detect_sql_injection(username) or detect_sql_injection(password):
        log_attack('SQL_INJECTION', f'Login attempt: username={username}, password={password}', ip)

    conn = get_db_connection()
    cursor = conn.cursor()

    # Vulnerable query – concatenates user input
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    
    try:
        cursor.execute(query)
        user = cursor.fetchone()
        conn.close()

        if user:
            session['user'] = user['username']
            return jsonify({'success': True, 'user': user['username']})
        else:
            return jsonify({'success': False, 'message': 'Authentication failed'}), 401

    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/search', methods=['POST'])
def search():
    data = request.json
    query = data.get('query', '')
    
    ip = request.remote_addr
    
    if detect_xss(query):
        log_attack('XSS', f'Search query: {query}', ip)
        return jsonify({'error': 'XSS attack attempt detected!', 'attack': True}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM users WHERE username LIKE '%{query}%' OR email LIKE '%{query}%'")
    results = cursor.fetchall()
    conn.close()
    
    return jsonify({'results': [dict(row) for row in results]})

@app.route('/api/comments', methods=['GET', 'POST'])
def comments():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if request.method == 'POST':
        data = request.json
        comment = data.get('comment', '')
        
        ip = request.remote_addr
        
        if detect_xss(comment):
            log_attack('XSS', f'Comment: {comment}', ip)
            conn.close()
            return jsonify({'error': 'XSS attack attempt detected in comment!', 'attack': True}), 400
        
        cursor.execute("INSERT INTO comments (comment) VALUES (?)", (comment,))
        conn.commit()
    
    cursor.execute("SELECT * FROM comments")
    comments_list = cursor.fetchall()
    conn.close()
    
    return jsonify({'comments': [dict(row) for row in comments_list]})

@app.route('/api/ping', methods=['POST'])
def ping():
    data = request.json
    host = data.get('host', '')
    
    ip = request.remote_addr
    
    if detect_command_injection(host):
        log_attack('COMMAND_INJECTION', f'Host: {host}', ip)
        return jsonify({'error': 'Command Injection attempt detected!', 'attack': True}), 400
    
    import subprocess
    import platform
    try:
        count_flag = '-n' if platform.system().lower() == 'windows' else '-c'
        output = subprocess.check_output(['ping', count_flag, '1', host],
                                         stderr=subprocess.STDOUT,
                                         text=True, timeout=5)
        return jsonify({'result': output})
    except Exception as e:
        return jsonify({'result': str(e)})

@app.route('/api/transfer', methods=['POST'])
def transfer():
    data = request.json or {}
    to_user = data.get('to_user', '')
    amount = data.get('amount', '')
    simulate = data.get('simulate_csrf', False)

    ip = request.remote_addr
    csrf_token = request.headers.get('X-CSRF-Token', '')

    if simulate:
        log_attack('CSRF', f'Simulated external site forged transfer of ${amount} to {to_user} (no CSRF token)', ip)
        return jsonify({
            'message': f'Transfer of ${amount} to {to_user} went through!',
            'attack': True,
            'attack_detail': 'CSRF attack succeeded — no token validation stopped the forged request.',
            'success': True
        })

    if not csrf_token:
        log_attack('CSRF', f'Transfer of ${amount} to {to_user} completed without CSRF token', ip)
        return jsonify({
            'message': f'Transfer of ${amount} to {to_user} initiated',
            'warning': 'No CSRF token was sent — this request could be forged by an external site.',
            'success': True
        })

    return jsonify({'message': f'Transfer of ${amount} to {to_user} initiated', 'success': True})

@app.route('/api/attacks', methods=['GET'])
def get_attacks():
    return jsonify({'attacks': ATTACK_LOG})

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({'message': 'Logged out successfully'})

@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    username = request.args.get('user', 'admin')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM transactions WHERE user = ? ORDER BY id DESC LIMIT 10", (username,))
    transactions = cursor.fetchall()
    
    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()
    
    cursor.execute("SELECT SUM(amount) FROM transactions WHERE user = ?", (username,))
    balance = cursor.fetchone()[0] or 10000
    
    conn.close()
    
    return jsonify({
        'balance': balance,
        'transactions': [dict(row) for row in transactions],
        'products': [dict(row) for row in products]
    })

if __name__ == '__main__':
    setup_database()
    app.run(debug=False, port=5001)
