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
- levanta Habit Bloom y verifica `/api/health`;
- crea una URL HTTPS temporal mediante Cloudflare Quick Tunnel.

`inventory.ini` contiene la IP real y está excluido de Git. Usa `inventory.ini.example` como plantilla para otras máquinas.

El playbook se ejecuta desde un contenedor de Ansible montando la clave SSH local como solo lectura. Nunca subas la clave privada ni el archivo `.env` de producción.

El inventario local actual apunta a la IP pública creada por Terraform. Para comprobar el despliegue:

```bash
curl http://IP_PUBLICA/api/health
```

La IP pública continúa disponible por HTTP. Cloudflare proporciona HTTPS en la URL temporal sin instalar un certificado en la VM; el puerto 443 también permanece preparado en las capas de red y firewall.

La URL `trycloudflare.com` aparece al final del playbook y también puede consultarse con:

```bash
docker compose -f /opt/habit-bloom/docker-compose.yml logs cloudflared
```

Quick Tunnel es gratuito y no requiere cuenta ni dominio, pero su dirección cambia si se vuelve a crear el contenedor. Para una URL permanente se necesita un dominio administrado en Cloudflare.
