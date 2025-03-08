from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)  # Enable CORS
bcrypt = Bcrypt(app)

DATABASE = 'combined.db'

# Function to connect to the database
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row 
    return conn

# Route: User Signup
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    fullname = data.get('full_name')
    email = data.get('email')
    password = data.get('password')

    if not fullname or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)",
            (fullname, email, hashed_password)
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "User registered successfully!"}), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Email already exists"}), 400

# Route: User Login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if user and bcrypt.check_password_hash(user['password'], password):
        return jsonify({"message": "Login successful!"}), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401

# Route: Get User Profile
@app.route('/profile', methods=['GET'])
def profile():
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT full_name, email FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify({"full_name": user['full_name'], "email": user['email']}), 200
    else:
        return jsonify({"error": "User not found"}), 404

# Route: Get Events
@app.route('/events', methods=['GET'])
def events():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, name, date, location FROM events")
    events = cursor.fetchall()
    conn.close()

    events_list = [dict(event) for event in events]
    return jsonify(events_list), 200

# Route: Get Upcoming Events for User
@app.route('/upcoming-events', methods=['GET'])
def upcoming_events():
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT events.id, events.name, events.date, events.location, tickets.seat_number, tickets.id as ticket_id
        FROM events
        INNER JOIN tickets ON events.id = tickets.event_id
        WHERE tickets.user_email = ?
        AND events.date >= DATE('now')
        ORDER BY events.date ASC;
    """, (email,))
    events = cursor.fetchall()
    conn.close()

    events_list = [dict(event) for event in events]
    return jsonify(events_list), 200

# Route: Get Purchase History for User
@app.route('/purchase-history', methods=['GET'])
def purchase_history():
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT events.id, events.name, events.date, events.location, tickets.seat_number, tickets.id as ticket_id
        FROM events
        JOIN tickets ON events.id = tickets.event_id
        WHERE tickets.user_email = ?
        AND events.date < DATE('now')
        ORDER BY events.date ASC;
    """, (email,))
    events = cursor.fetchall()
    conn.close()

    events_list = [dict(event) for event in events]
    return jsonify(events_list), 200

# Route: Transfer Ticket
@app.route('/transfer-ticket', methods=['POST'])
def transfer_ticket():
    data = request.get_json()

    ticket_id = data.get('ticket_id')
    recipient_email = data.get('recipient_email')

    if not ticket_id or not recipient_email:
        return jsonify({"error": "Ticket ID and recipient email are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if the recipient exists
    cursor.execute("SELECT * FROM users WHERE email = ?", (recipient_email,))
    recipient = cursor.fetchone()

    if not recipient:
        conn.close()
        return jsonify({"error": "Recipient not found"}), 404

    # Transfer the ticket
    cursor.execute("UPDATE tickets SET user_email = ? WHERE id = ?", (recipient_email, ticket_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Ticket transferred successfully!"}), 200

# Run the Flask app
if __name__ == '__main__':
    app.debug = False  
    app.env = 'development'  
    app.run()
