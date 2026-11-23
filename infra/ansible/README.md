# Ansible para Habit Bloom

El playbook configura la VM Ubuntu creada por Terraform:

- instala y habilita Docker;
- instala Git;
- configura UFW con entrada denegada por defecto;
- restringe SSH a la IP indicada en el inventario;
- habilita los puertos 80 y 443;
- guarda una copia de las reglas en `/etc/iptables/rules.v4`;
- descarga las imágenes públicas de Docker Hub;
- crea un secreto JWT local en la VM;
- levanta Habit Bloom y verifica `/api/health`.

`inventory.ini` contiene la IP real y está excluido de Git. Usa `inventory.ini.example` como plantilla para otras máquinas.

El playbook se ejecuta desde un contenedor de Ansible montando la clave SSH local como solo lectura. Nunca subas la clave privada ni el archivo `.env` de producción.

El inventario local actual apunta a la IP pública creada por Terraform. Para comprobar el despliegue:

```bash
curl http://IP_PUBLICA/api/health
```

La aplicación utiliza HTTP hasta que se configure un dominio y un certificado TLS. El puerto 443 ya está permitido en las capas de red y firewall.
