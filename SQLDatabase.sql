USE `InventoryManagement`;

-- Create Users Table
CREATE TABLE IF NOT EXISTS `Users` (
  `UserId` VARCHAR(25) NOT NULL,
  `Password` VARCHAR(25) NULL,
  `Email` VARCHAR(45) NULL,
  PRIMARY KEY (`UserId`)
);

-- Create Customers Table
CREATE TABLE IF NOT EXISTS `Customers` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(45) NULL,
  `Phone` INT NULL,
  `Email` VARCHAR(45) NULL,
  PRIMARY KEY (`Id`)
);

-- Create Items Table
CREATE TABLE IF NOT EXISTS `Items` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(45) NULL,
  `Quantity` INT NULL,
  `Price` INT NULL,
  PRIMARY KEY (`Id`)
);

-- Create Transactions Table
CREATE TABLE IF NOT EXISTS `Transactions` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `ProductId` INT NULL,
  `CustomerId` INT NULL,
  `Price` INT NULL,
  `Quantity` INT NULL,
  `Type` VARCHAR(1) NULL,
  PRIMARY KEY (`Id`),
  INDEX `CustomerId_idx` (`CustomerId` ASC),
  INDEX `ItemId_idx` (`ProductId` ASC),
  CONSTRAINT `ItemId`
    FOREIGN KEY (`ProductId`)
    REFERENCES `Items` (`Id`)
    ON DELETE SET NULL
    ON UPDATE SET NULL,
  CONSTRAINT `CustomerId`
    FOREIGN KEY (`CustomerId`)
    REFERENCES `Customers` (`Id`)
    ON DELETE SET NULL
    ON UPDATE SET NULL
);

