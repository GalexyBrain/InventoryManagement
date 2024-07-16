import mysql.connector
from mysql.connector import errorcode

# Connect to MySQL as the root user or an admin user
try:
    connection = mysql.connector.connect(
        host="localhost",
        user="root",  # or an admin user with privileges to create users
        password="root"  # replace with the admin user's password
    )

    cursor = connection.cursor()

    # Create the user Thejus with the specified password
    create_user_query = "CREATE USER 'Thejus'@'localhost' IDENTIFIED BY 'password';"
    cursor.execute(create_user_query)

    # Grant all privileges to the user Thejus
    grant_privileges_query = "GRANT ALL PRIVILEGES ON *.* TO 'Thejus'@'localhost' WITH GRANT OPTION;"
    cursor.execute(grant_privileges_query)

    # Flush privileges to ensure that all changes take effect
    flush_privileges_query = "FLUSH PRIVILEGES;"
    cursor.execute(flush_privileges_query)

    print("User 'Thejus' created successfully with all privileges.")

except mysql.connector.Error as err:
    if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
        print("Something is wrong with your user name or password")
    elif err.errno == errorcode.ER_BAD_DB_ERROR:
        print("Database does not exist")
    else:
        print(err)
finally:
    if connection.is_connected():
        cursor.close()
        connection.close()
        print("MySQL connection is closed.")
