-- Create the product schema and table
CREATE SCHEMA IF NOT EXISTS product;

CREATE TABLE product.product (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_object_key VARCHAR(36),
    price_lowest NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (name)
);

CREATE TABLE product.inventory (
    id VARCHAR(36) PRIMARY KEY,                   
    product_id VARCHAR(36) NOT NULL,               
    price NUMERIC(10, 2),                           
    quantity INTEGER,                           
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (product_id) REFERENCES product.product(id) ON DELETE CASCADE
);
