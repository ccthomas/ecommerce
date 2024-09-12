resource "aws_s3_bucket" "product_image_bucket" {
  bucket = "ecommerce-product-images-${var.stage}-${var.aws_region}"
}

# Define CORS configuration
resource "aws_s3_bucket_cors_configuration" "product_image_bucket_cors" {
  bucket = aws_s3_bucket.product_image_bucket.bucket

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "POST", "PUT"]
    allowed_origins = ["*"]
    expose_headers  = []
  }
}

