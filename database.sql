SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;

-- Table: quotations
CREATE TABLE IF NOT EXISTS `quotations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `quotation_no` VARCHAR(50) NOT NULL UNIQUE,
    `quotation_date` DATE NOT NULL,
    `due_date` DATE,
    `currency` VARCHAR(10) DEFAULT 'INR',
    `upi_id` VARCHAR(100),
    `signature_url` LONGTEXT,
    `logo_url` LONGTEXT,
    `notes` TEXT,
    `contact_details` TEXT,
    `round_off` VARCHAR(20) DEFAULT 'none',
    `status` VARCHAR(20) DEFAULT 'draft',
    `bank_details` TEXT, -- Storing JSON as TEXT for compatibility
    `advance_payment` DECIMAL(15, 2) DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Table: business_info
CREATE TABLE IF NOT EXISTS `business_info` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `quotation_id` INT NOT NULL,
    `info_type` VARCHAR(20) NOT NULL, -- 'from' or 'to'
    `business_name` VARCHAR(255),
    `gstin` VARCHAR(50),
    `pan` VARCHAR(50),
    `email` VARCHAR(255),
    `phone` VARCHAR(50),
    `country` VARCHAR(100),
    `state` VARCHAR(100),
    `city` VARCHAR(100),
    `address` TEXT,
    `zip_code` VARCHAR(20),
    FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Table: quotation_items
CREATE TABLE IF NOT EXISTS `quotation_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `quotation_id` INT NOT NULL,
    `item_name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `image_url` LONGTEXT,
    `hsn_sac` VARCHAR(50),
    `gst_rate` DECIMAL(5, 2) DEFAULT 0.00,
    `quantity` DECIMAL(15, 2) DEFAULT 1.00,
    `rate` DECIMAL(15, 2) DEFAULT 0.00,
    `discount` DECIMAL(15, 2) DEFAULT 0.00,
    `additional_charges` DECIMAL(15, 2) DEFAULT 0.00,
    `sort_order` INT DEFAULT 0,
    FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Table: terms_conditions
CREATE TABLE IF NOT EXISTS `terms_conditions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `quotation_id` INT NOT NULL,
    `content` TEXT,
    `attachment_url` LONGTEXT,
    `is_default` BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Table: company_settings (for default settings)
CREATE TABLE IF NOT EXISTS `company_settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `company_name` VARCHAR(255),
    `logo_url` LONGTEXT,
    `phone` VARCHAR(50),
    `from_address` TEXT,
    `website_url` VARCHAR(255),
    `is_active` BOOLEAN DEFAULT TRUE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;