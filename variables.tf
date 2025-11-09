###########################################
# Các biến cấu hình AWS
###########################################
variable "aws_region" {
  default = "ap-southeast-2" # 
}

variable "aws_access_key" {
  description = "Access Key AWS của bạn"
}

variable "aws_secret_key" {
  description = "Secret Key AWS của bạn"
}

variable "ami_id" {
  description = "AMI Ubuntu 22.04 LTS (Singapore)"
  default     = "ami-0279a86684f669718" # ubuntu-noble-24.04-amd64-server-20250821
}

variable "instance_type" {
  default = "t3.micro"
}

variable "key_name" {
  description = "Tên SSH key pair bạn tạo trên AWS"
  default     = "my-aws-key"
}

variable "security_group_id" {
  description = "ID của Security Group (ví dụ sg-xxxx)"
  default     = "sg-06f06115f3bb04b30"
}