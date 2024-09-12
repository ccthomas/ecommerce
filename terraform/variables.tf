variable "aws_region" {
  description = "The AWS region to deploy resources into"
  default     = "us-east-1"
}

variable "stage" {
  description = "Stage being deployed to"
  default     = "offline"
}
