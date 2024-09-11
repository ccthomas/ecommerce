resource "aws_ssm_parameter" "database_postgresql_host" {
  name  = "/Database/PostgreSQL/host"
  type  = "SecureString"
  value = "ecommerce-postgres-db"
}

resource "aws_ssm_parameter" "database_postgresql_port" {
  name  = "/Database/PostgreSQL/port"
  type  = "SecureString"
  value = "5432"
}

resource "aws_ssm_parameter" "database_postgresql_user" {
  name  = "/Database/PostgreSQL/user"
  type  = "SecureString"
  value = "myuser"
}
resource "aws_ssm_parameter" "database_postgresql_password" {
  name  = "/Database/PostgreSQL/password"
  type  = "SecureString"
  value = "mypassword"
}
resource "aws_ssm_parameter" "database_postgresql_database" {
  name  = "/Database/PostgreSQL/database"
  type  = "SecureString"
  value = "ecommerce"
}
