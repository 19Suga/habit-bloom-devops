output "instance_id" {
  description = "OCID de la instancia."
  value       = oci_core_instance.habit_bloom.id
}

output "public_ip" {
  description = "IP pública reservada de Habit Bloom."
  value       = oci_core_public_ip.habit_bloom.ip_address
}

output "ssh_command" {
  description = "Comando para conectarse a Ubuntu por SSH."
  value       = "ssh ubuntu@${oci_core_public_ip.habit_bloom.ip_address}"
}

output "application_url" {
  description = "URL HTTP inicial de la aplicación."
  value       = "http://${oci_core_public_ip.habit_bloom.ip_address}"
}

output "ubuntu_image_name" {
  description = "Imagen Ubuntu 24.04 seleccionada automáticamente."
  value       = data.oci_core_images.ubuntu_2404.images[0].display_name
}
