output "public_ip" {
  description = "IP Public của Ubuntu instance"
  value       = aws_instance.ubuntu_vm.public_ip
}