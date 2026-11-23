# Terraform para Oracle Cloud

Esta configuración crea los recursos exigidos para Habit Bloom:

- una VCN privada `10.20.0.0/16`;
- una subred pública `10.20.1.0/24`;
- un Internet Gateway y su ruta de salida;
- reglas de red para SSH, HTTP y HTTPS;
- una VM ARM Always Free con 1 OCPU, 6 GB de RAM y la imagen más reciente de Ubuntu 24.04;
- una IP pública reservada;
- una clave pública SSH para acceder como usuario `ubuntu`.

## Archivos locales que nunca se suben

- `terraform.tfvars`, porque contiene OCID y datos de tu cuenta.
- `.terraform/`, porque contiene proveedores descargados.
- `terraform.tfstate*`, porque contiene el estado real de la infraestructura.
- La clave SSH privada.

## Flujo que seguiremos

1. Preparar la cuenta, región y compartment en OCI.
2. Instalar y configurar OCI CLI y Terraform.
3. Crear una clave SSH exclusiva para Habit Bloom.
4. Copiar `terraform.tfvars.example` como `terraform.tfvars` y completar los valores reales.
5. Ejecutar `terraform init` y `terraform validate`.
6. Revisar juntos `terraform plan`.
7. Solo después de revisar el plan, ejecutar `terraform apply`.

No ejecutes `terraform apply` hasta revisar el plan, porque esa acción crea recursos reales en Oracle Cloud.

Si OCI responde `Out of host capacity`, la configuración es válida pero la región no tiene un host ARM libre en ese momento. No cambies a una región de pago: vuelve a generar el plan y reintenta más tarde para conservar Always Free.
