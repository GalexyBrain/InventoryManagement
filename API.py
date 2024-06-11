from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

authenticatedUsers = []
currentUser = None

def createConnection():
    connection = mysql.connector.connect(
        host='localhost',
        user='Thejus',
        password='root',
        database='InventoryManagement'
    )


    return connection


def loginRequired(func):
    def loginFunc(*args, **kwargs):
        # Check if user is logged in
        if currentUser not in authenticatedUsers:
            return jsonify({'message': 'Login required'}), 401
        return func(*args, **kwargs)
    return loginFunc


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    connection = createConnection()
    cursor = connection.cursor(dictionary=True)
    
    query = "SELECT * FROM users WHERE UserId = '{}'".format(username)
    cursor.execute(query)
    user = cursor.fetchone()
    connection.close()

    if user["UserId"] == username and user["Password"] == password:
        authenticatedUsers.append(username)
        global currentUser
        currentUser = username
        return jsonify({'message': 'Login successful!'}), 200
    else:
        return jsonify({'message': 'Invalid username or password'}), 401
    
inventory_items = [
    {'name': 'Item 1', 'quantity': 10},
    {'name': 'Item 2', 'quantity': 5},
    {'name': 'Item 3', 'quantity': 20}
]

@app.route('/inventory', methods=['GET', 'POST'])
@loginRequired
def get_inventory():
    if request.method == 'GET':
        return jsonify(inventory_items), 200
    if request.method == 'POST':
        data = request.json
        item_name = data.get('name')
        item_quantity = data.get('quantity')
        if item_name and isinstance(item_quantity, int):
            inventory_items.append({'name': item_name, 'quantity': item_quantity})
            return jsonify({'message': 'Item added successfully!'}), 201
        else:
            return jsonify({'message': 'Invalid data'}), 400



if __name__ == '__main__':
    app.run(debug=True)
