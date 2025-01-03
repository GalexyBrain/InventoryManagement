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
        user='rootUser',
        password='rootUser@123',
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
        user='rootUser',
        password='rootUser@123',
        database='InventoryManagement',
        auth_plugin='mysql_native_password'
    )
    cursor = connection.cursor(dictionary=True)
    
    try:
        query = "SELECT * FROM Users WHERE UserId = %s AND Password = %s"
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
        user='rootUser',
        password='rootUser@123',
        database='InventoryManagement',
        auth_plugin='mysql_native_password'
    )
    cursor = connection.cursor(dictionary=True)
    
    try:
        query = "SELECT * FROM Users WHERE UserId = %s"
        cursor.execute(query, (username,))
        user = cursor.fetchone()

        if not user:
            insert_query = "INSERT INTO Users (UserId, Password, Email) VALUES (%s, %s, %s)"
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
        

# Endpoint to get all metrics
@app.route('/metrics')
def get_metrics():
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute('''
        SELECT 
            (SELECT COUNT(Id) FROM ITEMS) AS products_count,
            (SELECT COUNT(Id) FROM TRANSACTIONS) AS orders_count,
            (SELECT COUNT(Id) FROM CUSTOMERS) AS customers_count,
            (SELECT SUM(TotalPrice) FROM TRANSACTIONS where Type = 'S') AS revenue
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
    cursor.execute('SELECT * FROM CUSTOMERS')
    customers = cursor.fetchall()
    return jsonify({'customers': customers})

@app.route('/customers', methods=['POST'])
def add_customer():
    new_customer = request.json
    connection = create_connection()
    cursor = connection.cursor()
    
    try:
        # Check if customer already exists
        cursor.execute("SELECT * FROM CUSTOMERS WHERE id = %s", (new_customer['Id'],))
        
        if cursor.fetchone() is not None:
            connection.close()
            return jsonify({'message': 'Customer already exists'}), 400
        
        # Insert new customer
        cursor.execute(
            "INSERT INTO CUSTOMERS (id, name, phone, email) VALUES (%s, '%s', %s, '%s')" %(new_customer['Id'], new_customer['Name'], new_customer['Phone'], new_customer['Email'])
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
    cursor.execute("UPDATE CUSTOMERS SET name='%s', email='%s', phone=%s WHERE id=%s" %(updated_customer['Name'], updated_customer['Email'], updated_customer['Phone'], customer_id))
    connection.commit()
    connection.close()
    return jsonify({'message': 'Customer updated successfully'}), 200

@app.route('/customers/<int:customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute('DELETE FROM CUSTOMERS WHERE id=%s', (customer_id,))
    connection.commit()
    return jsonify({'message': 'Customer deleted successfully'})


@app.route('/inventory', methods=['GET'])
def get_inventory():
    connection = create_connection()
    if not connection:
        return jsonify({'message': 'Failed to connect to database'}), 500
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM ITEMS")
    inventory = cursor.fetchall()
    connection.close()
    return jsonify({'inventory': inventory})

@app.route('/inventory', methods=['POST'])
def add_item():
    data = request.json
    connection = create_connection()
    if not connection:
        return jsonify({'message': 'Failed to connect to database'}), 500

    try:
        cursor = connection.cursor()
        
        # Check if item already exists
        cursor.execute("SELECT * FROM ITEMS WHERE Id = %s", (data['id'],))
        existing_item = cursor.fetchone()
        
        if existing_item:
            return jsonify({'message': 'Item already exists'}), 400
        
        # Insert new item into ITEMS table
        cursor.execute(
            "INSERT INTO ITEMS (Id, Name, Quantity, Price) VALUES (%s, %s, %s, %s)",
            (data['id'], data['name'], data['qty'], data['price'])
        )
        
        # Insert new transaction into TRANSACTIONS table
        cursor.execute(
            "INSERT INTO TRANSACTIONS (CustomerId, Type, TotalPrice) VALUES (NULL, 'p', %s)",
            (int(data['price']) * int(data['qty']),)
        )
        
        # Get the last inserted transaction id
        transaction_id = cursor.lastrowid
        
        # Insert into TRANSACTION_ITEMS table
        cursor.execute(
            "INSERT INTO TRANSACTION_ITEMS (TransactionId, ItemId, Quantity) VALUES (%s, %s, %s)",
            (transaction_id, data['id'], data['qty'])
        )
        
        connection.commit()
        return jsonify({'message': 'Item added successfully'}), 201
    
    except mysql.connector.Error as err:
        connection.rollback()
        return jsonify({'message': str(err)}), 500
    
    finally:
        cursor.close()
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
        "UPDATE ITEMS SET Name=%s, price=%s WHERE Id=%s",
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

    # Check if item exists and get the current quantity
    cursor.execute("SELECT Quantity, Price FROM ITEMS WHERE Id = %s", (item_id,))
    item = cursor.fetchone()
    if not item:
        connection.close()
        return jsonify({'message': 'Item not found'}), 404

    # Calculate new quantity
    new_qty = int(item['Quantity']) + int(data['qty'])
    price = int(item['Price'])

    # Update the quantity of the item
    cursor.execute("UPDATE ITEMS SET Quantity = %s WHERE Id = %s", (new_qty, item_id))
    connection.commit()

    # Insert new transaction into TRANSACTIONS table
    cursor.execute(
        "INSERT INTO TRANSACTIONS (CustomerId, Type, TotalPrice) VALUES (NULL, 'p', %s)",
        (price * int(data['qty']),)
    )

    # Get the last inserted transaction id
    transaction_id = cursor.lastrowid

    # Insert into TRANSACTION_ITEMS table
    cursor.execute(
        "INSERT INTO TRANSACTION_ITEMS (TransactionId, ItemId, Quantity) VALUES (%s, %s, %s)",
        (transaction_id, item_id, data['qty'])
    )
    connection.commit()

    connection.close()
    return jsonify({'message': 'Item restocked successfully'}), 200

@app.route('/inventory/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM ITEMS WHERE Id=%s" %(item_id,))
    connection.commit()
    if cursor.rowcount == 0:
        return jsonify({'message': 'Item not found'}), 404
    return jsonify({'message': 'Item deleted successfully'})

@app.route('/orders', methods=['GET'])
def get_orders():
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT * FROM TRANSACTIONS")
    orders = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify({'orders': orders})

# Function to add an order to the database
def add_order_to_db(new_order):
    try:
        conn = create_connection()
        cursor = conn.cursor()

        # Insert new transaction into TRANSACTIONS table
        insert_transaction_query = """
            INSERT INTO TRANSACTIONS (CustomerId, Type, TotalPrice)
            VALUES (%s, %s, %s)
        """
        cursor.execute(insert_transaction_query, (new_order['customerId'], new_order['type'], calculate_total_price(new_order['items'])))
        transaction_id = cursor.lastrowid

        insert_item_query = """
            INSERT INTO TRANSACTION_ITEMS (TransactionId, ItemId, Quantity)
            VALUES (%s, %s, %s)
        """

        update_item_query_purchase = """
            UPDATE ITEMS
            SET Quantity = Quantity + %s
            WHERE Id = %s
        """

        update_item_query_sale = """
            UPDATE ITEMS
            SET Quantity = Quantity - %s
            WHERE Id = %s
        """

        select_item_query_quantity = """
            SELECT Quantity FROM ITEMS
            WHERE Id = %s
        """

        # Insert each item into TRANSACTION_ITEMS table and update ITEM quantities
        for item in new_order['items']:
            # Insert item into TRANSACTION_ITEMS table
            cursor.execute(insert_item_query, (transaction_id, item['productId'], item['quantity']))

            # Update ITEM quantity based on transaction type
            if new_order['type'].lower() == 'p':
                cursor.execute(update_item_query_purchase, (item['quantity'], item['productId']))
            elif new_order['type'].lower() == 's':
                cursor.execute(select_item_query_quantity, (item['productId'], ))
                current_quantity = cursor.fetchone()[0]
                if current_quantity < int(item['quantity']):
                    raise ValueError(f"Not enough stock for Item ID {item['productId']}")
                cursor.execute(update_item_query_sale, (item['quantity'], item['productId']))

        # Commit changes to the database
        conn.commit()
        return True

    except mysql.connector.Error as e:
        print(f"Error adding order to database: {e}")
        conn.rollback()
        return False

    except Exception as e:
        print(f"Other error adding order: {e}")
        conn.rollback()
        return False

    finally:
        if 'cursor' in locals() and cursor is not None:
            cursor.close()
        if 'conn' in locals() and conn is not None and conn.is_connected():
            conn.close()

def calculate_total_price(items):
    total_price = 0
    try:
        conn = create_connection()
        cursor = conn.cursor()

        for item in items:
            # Fetch price from ITEMS table based on ItemId
            query = "SELECT Price FROM ITEMS WHERE Id = %s"
            cursor.execute(query, (item['productId'],))
            result = cursor.fetchone()

            if result:
                price = int(result[0])  # Convert decimal.Decimal to float
                total_price += price * int(item['quantity'])
            else:
                # Handle case where item price is not found (optional)
                print(f"Price not found for ItemId {item['productId']}")

        return total_price

    except mysql.connector.Error as e:
        print(f"Error fetching price from database: {e}")
        return None

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

# Flask route to handle POST requests for adding orders
@app.route('/orders', methods=['POST'])
def add_order():
    try:
        new_order = request.json

        # Validate new_order format
        if 'customerId' not in new_order or 'items' not in new_order:
            return jsonify({'error': 'Invalid order format'}), 400

        # Add order to database
        if add_order_to_db(new_order):
            return jsonify({'message': 'Order added successfully'}), 201
        else:
            return jsonify({'error': 'Failed to add order'}), 500

    except Exception as e:
        print(f"Error adding order: {e}")
        return jsonify({'error': 'Failed to add order'}), 500

def get_transaction_details(transaction_id):
    try:
        # Connect to MySQL
        conn = create_connection()
        cursor = conn.cursor(dictionary=True)

        # Query to fetch transaction details including items
        query = """
            SELECT 
                t.Id AS TransactionId,
                t.CustomerId,
                t.Date,
                t.Type,
                t.TotalPrice,
                ti.Quantity,
                i.Id AS ItemId,
                i.Name AS ProductName,
                i.Price
            FROM TRANSACTIONS t
            INNER JOIN TRANSACTION_ITEMS ti ON t.Id = ti.TransactionId
            LEFT OUTER JOIN ITEMS i ON ti.ItemId = i.Id
            WHERE t.Id = %s
        """

        cursor.execute(query, (transaction_id,))
        transaction_data = cursor.fetchall()

        # Prepare JSON response
        if transaction_data:
            transaction = {
                'TransactionId': transaction_data[0]['TransactionId'],
                'CustomerId': transaction_data[0]['CustomerId'],
                'Date': transaction_data[0]['Date'].isoformat(),
                'Type': transaction_data[0]['Type'],
                'TotalPrice': str(transaction_data[0]['TotalPrice']),
                'Items': []
            }

            for row in transaction_data:
                transaction['Items'].append({
                    'ItemId': row['ItemId'],
                    'ProductName': row['ProductName'],
                    'Quantity': row['Quantity'],
                    'Price': str(row['Price']),
                    'Type': 'Sale'  # Assuming type for items in a transaction
                })

            return transaction
        else:
            return None

    except mysql.connector.Error as e:
        print(f"Error fetching transaction details: {e}")
        return None

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

# Flask route to fetch transaction details
@app.route('/api/orders/<int:transaction_id>', methods=['GET'])
def get_transaction(transaction_id):
    transaction = get_transaction_details(transaction_id)
    if transaction:
        return jsonify(transaction), 200
    else:
        return jsonify({'error': 'Transaction not found'}), 404


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
    cursor.execute("SELECT password FROM Users WHERE userId = %s", (username,))
    user = cursor.fetchone()
    if not user or user[0] != current_password:
        return jsonify({'message': 'Current password is incorrect'}), 400

    # Update user settings
    cursor.execute("UPDATE Users SET email = %s, password = %s WHERE userId = %s",
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
