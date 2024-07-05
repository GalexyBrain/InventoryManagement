-- Create the InventoryManagement database
CREATE DATABASE IF NOT EXISTS InventoryManagement;

-- Use the InventoryManagement database
USE InventoryManagement;

-- Drop the TRANSACTION_ITEMS table if it exists
DROP TABLE IF EXISTS TRANSACTION_ITEMS;

-- Drop the TRANSACTIONS table if it exists
DROP TABLE IF EXISTS TRANSACTIONS;

-- Drop the CUSTOMERS table if it exists
DROP TABLE IF EXISTS CUSTOMERS;

-- Drop the ITEMS table if it exists
DROP TABLE IF EXISTS ITEMS;

-- Create the ITEMS table
CREATE TABLE ITEMS (
    Id INT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Quantity INT NOT NULL,
    Price DECIMAL(10, 2) NOT NULL
);

-- Create the CUSTOMERS table
CREATE TABLE CUSTOMERS (
    Id INT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Phone VARCHAR(15),
    Email VARCHAR(255)
);

-- Create the TRANSACTIONS table
CREATE TABLE TRANSACTIONS (
    Id INT PRIMARY KEY,
    CustomerId INT,
    Date DATE NOT NULL DEFAULT (CURRENT_DATE),
    Type VARCHAR(50),
    TotalPrice DECIMAL(10, 2),
    FOREIGN KEY (CustomerId) REFERENCES CUSTOMERS(Id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- Create the TRANSACTION_ITEMS table
CREATE TABLE TRANSACTION_ITEMS (
    Id INT PRIMARY KEY,
    TransactionId INT,
    ItemId INT,
    Quantity INT NOT NULL,
    FOREIGN KEY (TransactionId) REFERENCES TRANSACTIONS(Id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (ItemId) REFERENCES ITEMS(Id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);
