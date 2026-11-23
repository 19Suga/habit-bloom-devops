resource "oci_core_instance" "habit_bloom" {
  availability_domain = data.oci_identity_availability_domains.available.availability_domains[0].name
  compartment_id      = var.compartment_ocid
  display_name        = "${var.project_name}-vm"
  shape               = var.instance_shape

  create_vnic_details {
    subnet_id        = oci_core_subnet.public.id
    assign_public_ip = false
    display_name     = "${var.project_name}-primary-vnic"
    hostname_label   = "app"
  }

  source_details {
    source_type             = "image"
    source_id               = data.oci_core_images.ubuntu_2404.images[0].id
    boot_volume_size_in_gbs = 50
  }

  metadata = {
    ssh_authorized_keys = file(pathexpand(var.ssh_public_key_path))
  }

  freeform_tags = {
    Project   = "Habit Bloom"
    ManagedBy = "Terraform"
  }
}

data "oci_core_vnic_attachments" "habit_bloom" {
  compartment_id = var.compartment_ocid
  instance_id     = oci_core_instance.habit_bloom.id
}

data "oci_core_vnic" "habit_bloom" {
  vnic_id = data.oci_core_vnic_attachments.habit_bloom.vnic_attachments[0].vnic_id
}

data "oci_core_private_ips" "habit_bloom" {
  vnic_id = data.oci_core_vnic.habit_bloom.id
}

resource "oci_core_public_ip" "habit_bloom" {
  compartment_id = var.compartment_ocid
  display_name   = "${var.project_name}-public-ip"
  lifetime       = "RESERVED"
  private_ip_id  = data.oci_core_private_ips.habit_bloom.private_ips[0].id
}
