provider "aws" {
  region     = var.aws_region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}

resource "aws_instance" "ubuntu_vm" {
  ami           = var.ami_id
  instance_type = var.instance_type
  key_name      = var.key_name

  vpc_security_group_ids = [var.security_group_id]

 
  root_block_device {
    volume_size = 20      # Dung lượng ổ đĩa 20GB
    volume_type = "gp3"   # Loại ổ SSD (gp3 = tiết kiệm, nhanh)
  }

  tags = {
    Name  = "devopsubuntu"
    Owner = "Tung"
  }
}
