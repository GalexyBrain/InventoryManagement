from flask_cors import CORS
from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error

authenticated_users = list()  # Use set for faster membership checks
current_user = None


def loginRequired(func):
    def wrapper(*args, **kwargs):
        # Check if user is logged in
        if current_user not in authenticated_users:
            return jsonify({'message': 'Login required'}), 401
        return func(*args, **kwargs)
    return wrapper

@loginRequired
def create_connection():
    connection = mysql.connector.connect(
        host='localhost',
        user='Thejus',
        password='root',
        database='InventoryManagement'
    )
    return connection


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username').strip()
    password = data.get('password').strip()
    
    connection = mysql.connector.connect(
        host='localhost',
        user='Thejus',
        password='root',
        database='InventoryManagement'
    )
    cursor = connection.cursor(dictionary=True)
    
    try:
        query = "SELECT * FROM users WHERE UserId = %s AND Password = %s"
        cursor.execute(query, (username, password))
        user = cursor.fetchone()

        if user:
            authenticated_users.append(username)
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
    
    connection = mysql.connector.connect(
        host='localhost',
        user='Thejus',
        password='root',
        database='InventoryManagement'
    )
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
            (SELECT SUM(Price * Quantity) FROM transactions) AS revenue
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
        cursor.execute("SELECT * FROM customers WHERE id = %s", (new_customer['Id'],))
        
        if cursor.fetchone() is not None:
            connection.close()
            return jsonify({'message': 'Customer already exists'}), 400
        
        # Insert new customer
        cursor.execute(
            "INSERT INTO customers (id, name, phone, email) VALUES (%s, '%s', %s, '%s')" %(new_customer['Id'], new_customer['Name'], new_customer['Phone'], new_customer['Email'])
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
    print("UPDATE customers SET name='%s', email='%s', phone=%s WHERE id=%s" %(updated_customer['Name'], updated_customer['Email'], updated_customer['Phone'], customer_id))
    cursor.execute("UPDATE customers SET name='%s', email='%s', phone=%s WHERE id=%s" %(updated_customer['Name'], updated_customer['Email'], updated_customer['Phone'], customer_id))
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


@app.route('/inventory', methods=['GET'])
def get_inventory():
    connection = create_connection()
    if not connection:
        return jsonify({'message': 'Failed to connect to database'}), 500
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM items")
    inventory = cursor.fetchall()
    connection.close()
    return jsonify({'inventory': inventory})

@app.route('/inventory', methods=['POST'])
def add_item():
    data = request.json
    connection = create_connection()
    if not connection:
        return jsonify({'message': 'Failed to connect to database'}), 500

    cursor = connection.cursor()
    cursor.execute("SELECT * FROM items WHERE Id = %s", (data['id'],))
    existing_item = cursor.fetchone()
    
    if existing_item:
        connection.close()
        return jsonify({'message': 'Item already exists'}), 400
    
    cursor.execute(
        "INSERT INTO items (Id, Name, quantity, price) VALUES (%s, '%s', %s, %s)" %(data['id'], data['name'], data['qty'], data['price'])
    )
    connection.commit()
    
    cursor.execute("SELECT MAX(Id) FROM transactions")
    id_result = cursor.fetchone()
    id = id_result[0] if id_result[0] is not None else 0
    id += 1

    
    cursor.execute("INSERT INTO transactions (Id, Price, Quantity, ProductId, Type) VALUES (%s, %s, %s, %s, 'p')" %(id, data['price'], data['qty'], data['id']))
    connection.commit()
    connection.close()
    return jsonify({'message': 'Item added successfully'}), 201

@app.route('/inventory/<int:item_id>', methods=['PUT'])
def edit_item(item_id):
    data = request.json
    connection = create_connection()
    if not connection:
        return jsonify({'message': 'Failed to connect to database'}), 500
    cursor = connection.cursor()
    cursor.execute(
        "UPDATE items SET Name=%s, price=%s WHERE Id=%s",
        (data['name'], data['price'], item_id)
    )
    connection.commit()
    connection.close()
    if cursor.rowcount == 0:
        return jsonify({'message': 'Item not found'}), 404
    return jsonify({'message': 'Item updated successfully'})

@app.route('/inventory/<int:item_id>', methods=['PATCH'])
def restock_item(item_id):
    data = request.json
    connection = create_connection()
    if not connection:
        return jsonify({'message': 'Failed to connect to database'}), 500
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT quantity FROM items WHERE Id=%s" %(item_id,))
    item = cursor.fetchone()
    if not item:
        connection.close()
        return jsonify({'message': 'Item not found'}), 404
    new_qty = int(item['quantity']) + int(data['qty'])
    cursor.execute("UPDATE items SET quantity=%s WHERE Id=%s", (new_qty, item_id))
    connection.commit()
        
    if not connection:
        return jsonify({'message': 'Failed to connect to database'}), 500
    
    cursor.execute("SELECT MAX(Id) AS Id FROM transactions")
    id_result = cursor.fetchone()
    id = id_result['Id'] if id_result['Id'] is not None else 0
    id += 1

    
    cursor.execute("INSERT INTO transactions (Id, Price, Quantity, ProductId, Type) VALUES (%s, %s, %s, %s, 'p')" %(id, data['price'], data['qty'], data['id']))

    connection.commit()
    connection.close()
    return jsonify({'message': 'Item restocked successfully'})

@app.route('/inventory/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM items WHERE Id=%s" %(item_id,))
    connection.commit()
    if cursor.rowcount == 0:
        return jsonify({'message': 'Item not found'}), 404
    return jsonify({'message': 'Item deleted successfully'})

@app.route('/orders', methods=['GET'])
def get_orders():
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT * FROM transactions")
    orders = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify({'orders': orders})

@app.route('/orders', methods=['POST'])
def add_order():
    data = request.json
        
    customerId = data['customerId']
    productId = data['productId']
    quantity = data['quantity']
    orderType = data['type']  # 'p' for purchase, 's' for sale

    connection = create_connection()
    cursor = connection.cursor()
    
    cursor.execute("select max(id) as id from transactions ")
    id_result = cursor.fetchone()
    orderId = id_result[0] if id_result[0] is not None else 0
    orderId += 1
    
    cursor.execute("select Price, Quantity from items where id = %s" % productId)
    data = cursor.fetchone()
    
    if data is None:
        return jsonify({'message': 'Product Id not found'}), 404
    
    price = data[0]
    
    availableQuantity = data[1]
    
    if availableQuantity < int(quantity):
        return jsonify({'message': 'insufficient stock'}), 404
    
    
    
    if orderType in 's':
        newQuantity = availableQuantity - int(quantity)
    elif orderType in 'p':
        newQuantity = availableQuantity + int(quantity)
    
    try:
        cursor.execute(
            "INSERT INTO transactions (id, customerId, productId, quantity, price, Type) VALUES (%s, %s, %s, %s, %s, '%s')" %(orderId, customerId, productId, quantity, price, orderType)
        )
        connection.commit()
    
        cursor.execute("UPDATE items SET quantity = %s WHERE id = %s" % (newQuantity, productId))
        connection.commit()
    except Exception:
        cursor.close()
        connection.close()
        return jsonify({'message': 'SQL error'}), 404
    
    cursor.close()
    connection.close()

    return jsonify({'message': 'Order added successfully'}), 201

@app.route('/update_settings', methods=['POST'])
def update_settings():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')

    connection = create_connection()
    cursor = connection.cursor()

    # Verify current password
    cursor.execute("SELECT password FROM users WHERE userId = %s", (username,))
    user = cursor.fetchone()
    if not user or user[0] != current_password:
        return jsonify({'message': 'Current password is incorrect'}), 400

    # Update user settings
    cursor.execute("UPDATE users SET email = %s, password = %s WHERE userId = %s",
                   (email, new_password, username))
    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({'message': 'Settings updated successfully'}), 200

@app.route('/logout')
def logout():
    global current_user
    authenticated_users.remove(current_user)
    current_user = None
    return jsonify({'message': 'Logout succesful'}), 200
    
if __name__ == '__main__':
    app.run(debug=True)
