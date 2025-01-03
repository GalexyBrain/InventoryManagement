CREATE SCHEMA IF NOT EXISTS `InventoryManagement` DEFAULT CHARACTER SET utf8 ;
USE `InventoryManagement` ;

-- -----------------------------------------------------
-- Table `InventoryManagement`.`Users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `UserId` VARCHAR(25) NOT NULL,
  `Password` VARCHAR(25) NULL,
  `Email` VARCHAR(45) NULL,
  PRIMARY KEY (`UserId`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `InventoryManagement`.`Customers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `customers` (
  `Id` INT NOT NULL,
  `Name` VARCHAR(45) NULL,
  `Phone` INT NULL,
  `Email` VARCHAR(45) NULL,
  PRIMARY KEY (`Id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `InventoryManagement`.`items`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `items` (
  `Id` INT NOT NULL,
  `Name` VARCHAR(45) NULL,
  `Quantity` INT NULL,
  `Price` INT NULL,
  PRIMARY KEY (`Id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `InventoryManagement`.`Transactions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `transactions` (
  `Id` INT NOT NULL,
  `ProductId` INT NULL,
  `CustomerId` INT NULL,
  `Price` INT NULL,
  `Quantity` INT NULL,
  `Type` VARCHAR(1) NULL,
  PRIMARY KEY (`Id`),
  INDEX `CustomerId_idx` (`CustomerId` ASC) VISIBLE,
  INDEX `ItemId_idx` (`ProductId` ASC) VISIBLE,
  CONSTRAINT `ItemId`
    FOREIGN KEY (`ProductId`)
    REFERENCES `items` (`Id`)
    ON DELETE SET NULL
    ON UPDATE SET NULL,
  CONSTRAINT `CustomerId`
    FOREIGN KEY (`CustomerId`)
    REFERENCES `customers` (`Id`)
    ON DELETE SET NULL
    ON UPDATE SET NULL)
ENGINE = InnoDB;
