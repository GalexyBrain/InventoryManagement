from flask_cors import CORS
from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error

authenticated_users = set()  # Use set for faster membership checks
current_user = None

def create_connection():
    connection = mysql.connector.connect(
        host='localhost',
        user='Thejus',
        password='root',
        database='InventoryManagement'
    )
    return connection

def loginRequired(func):
    def wrapper(*args, **kwargs):
        # Check if user is logged in
        if current_user not in authenticated_users:
            return jsonify({'message': 'Login required'}), 401
        return func(*args, **kwargs)
    return wrapper

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username').strip()
    password = data.get('password').strip()
    
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        query = "SELECT * FROM users WHERE UserId = %s AND Password = %s"
        cursor.execute(query, (username, password))
        user = cursor.fetchone()

        if user:
            authenticated_users.add(username)
            global current_user
            current_user = username
            return jsonify({'message': 'Login successful!'}), 200
        else:
            return jsonify({'message': 'Invalid username or password'}), 401

    except Error as e:
        print(e)
        return jsonify({'message': 'An error occurred during login'}), 500
    
    finally:
        cursor.close()
        connection.close()

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username').strip()
    password = data.get('password').strip()
    email = data.get('email').strip()
    
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        query = "SELECT * FROM users WHERE UserId = %s"
        cursor.execute(query, (username,))
        user = cursor.fetchone()

        if not user:
            insert_query = "INSERT INTO users (UserId, Password, Email) VALUES (%s, %s, %s)"
            cursor.execute(insert_query, (username, password, email))
            connection.commit()
            return jsonify({'message': 'Registration successful'}), 200
        else:
            return jsonify({'message': 'User already exists'}), 400

    except Error as e:
        print(e)
        return jsonify({'message': 'An error occurred during registration'}), 500
    
    finally:
        cursor.close()
        connection.close()
        
        
metrics_data = {
    'products_count': 10,
    'orders_count': 20,
    'customers_count': 30,
    'revenue': 5000
}

# Endpoint to get all metrics
@app.route('/metrics')
@loginRequired
def get_metrics():
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute('''
        SELECT 
            (SELECT COUNT(Id) FROM items) AS products_count,
            (SELECT COUNT(Id) FROM transactions) AS orders_count,
            (SELECT COUNT(Id) FROM customers) AS customers_count,
            (SELECT SUM(Price) FROM transactions) AS revenue
    ''')
    
    metrics_data = cursor.fetchone()
    
    connection.close()

    metrics_dict = {
        'products_count': metrics_data[0],
        'orders_count': metrics_data[1],
        'customers_count': metrics_data[2],
        'revenue': metrics_data[3]
    }

    return jsonify(metrics_dict)

@app.route('/customers', methods=['GET'])
def get_customers():
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM customers')
    customers = cursor.fetchall()
    print(customers)
    return jsonify({'customers': customers})

@app.route('/customers', methods=['POST'])
def add_customer():
    new_customer = request.json
    connection = create_connection()
    cursor = connection.cursor()
    
    try:
        # Check if customer already exists
        cursor.execute("SELECT * FROM customers WHERE id = %s", (new_customer['id'],))
        
        if cursor.fetchone() is not None:
            connection.close()
            return jsonify({'message': 'Customer already exists'}), 400
        
        # Insert new customer
        cursor.execute(
            "INSERT INTO customers (id, name, phone, email) VALUES (%s, %s, %s, %s)",
            (new_customer['id'], new_customer['name'], new_customer['phone'], new_customer['email'])
        )
        
        connection.commit()
        return jsonify({'message': 'Customer added successfully'}), 201
    except mysql.connector.Error as err:
        connection.rollback()
        return jsonify({'message': f'Error: {err}'}), 500
    finally:
        connection.close()

@app.route('/customers/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    updated_customer = request.json
    connection = create_connection()
    cursor = connection.cursor()
    print("UPDATE customers SET name='%s', email='%s', phone=%s WHERE id=%s" %(updated_customer['name'], updated_customer['email'], updated_customer['phone'], customer_id))
    cursor.execute("UPDATE customers SET name='%s', email='%s', phone=%s WHERE id=%s" %(updated_customer['name'], updated_customer['email'], updated_customer['phone'], customer_id))
    connection.commit()
    connection.close()
    return jsonify({'message': 'Customer updated successfully'}), 200

@app.route('/customers/<int:customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute('DELETE FROM customers WHERE id=%s', (customer_id,))
    connection.commit()
    return jsonify({'message': 'Customer deleted successfully'})


if __name__ == '__main__':
    app.run(debug=True)
