variable "tenancy_ocid" {
  description = "OCID de la tenancy de Oracle Cloud."
  type        = string
}

variable "compartment_ocid" {
  description = "OCID del compartment donde se creará Habit Bloom."
  type        = string
}

variable "region" {
  description = "Región de OCI, por ejemplo sa-saopaulo-1."
  type        = string
}

variable "oci_profile" {
  description = "Perfil del archivo de configuración de OCI."
  type        = string
  default     = "DEFAULT"
}

variable "ssh_public_key_path" {
  description = "Ruta de la clave pública SSH que se instalará en la VM."
  type        = string
  default     = "~/.ssh/habit_bloom_oci.pub"
}

variable "ssh_allowed_cidr" {
  description = "IP pública autorizada para SSH en formato CIDR, normalmente x.x.x.x/32."
  type        = string
}

variable "instance_shape" {
  description = "Shape flexible de la VM."
  type        = string
  default     = "VM.Standard.E3.Flex"
}

variable "instance_ocpus" {
  description = "OCPU asignadas a la VM flexible ARM."
  type        = number
  default     = 1
}

variable "instance_memory_gbs" {
  description = "Memoria RAM en GB asignada a la VM flexible."
  type        = number
  default     = 4
}

variable "project_name" {
  description = "Prefijo usado en los nombres de los recursos."
  type        = string
  default     = "habit-bloom"
}

variable "vcn_cidr" {
  description = "CIDR privado de la VCN."
  type        = string
  default     = "10.20.0.0/16"
}

variable "subnet_cidr" {
  description = "CIDR de la subred pública."
  type        = string
  default     = "10.20.1.0/24"
}
