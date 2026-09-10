# 🔗 Guía: Conectar el dominio descargoycargo.com a la plataforma

**Proyecto:** Descargo & Cargo 2.0
**Dominio:** descargoycargo.com (ya comprado)
**Fecha:** 2026-07-25 · Versión 1.0

---

## ¿Qué significa "enlazar el dominio al código"?

Tu código vive en un **servidor** (una computadora siempre encendida que responde en internet). Tu dominio es solo una **etiqueta** en el sistema DNS mundial. Enlazarlos = decirle al DNS: *"cuando alguien escriba descargoycargo.com, llévalo a la IP de mi servidor"*.

```
Usuario escribe:  descargoycargo.com
        │
        ▼
DNS (registrador donde compraste el dominio)
        │  Registro A  →  203.0.113.50  (IP de tu servidor)
        ▼
Tu servidor (Nginx/Caddy)  →  responde con la app React + API
        │
        ▼
Candado HTTPS gratis (Let's Encrypt)  →  https://descargoycargo.com 🔒
```

---

## PASO 1 — Prepara el código para producción

Desde la carpeta del proyecto (`app/`):

```bash
npm run build
```

Esto genera la carpeta `dist/` con la web optimizada (frontend). El backend (API) se despliega aparte con Docker según el Plan V3 §4 (Node + PostgreSQL + Redis con `docker-compose.yml`).

**Resultado esperado:** la app corre en tu servidor en `http://localhost` (frontend) y `http://localhost:3000` (API).

---

## PASO 2 — Consigue la IP de tu servidor

- **Si usas un VPS** (Hetzner, DigitalOcean, Contabo...): la IP pública aparece en el panel del proveedor. Ejemplo: `203.0.113.50`.
- **Si usas tu propio PC** (ver guía complementaria): tu IP pública la ves en [cualesmiip.com](https://cualesmiip.com) — ojo con CGNAT, en ese caso usa Cloudflare Tunnel (Paso 3B).

---

## PASO 3A — Configura el DNS (camino normal con IP fija)

Entra al panel del **registrador donde compraste el dominio** (GoDaddy, Namecheap, Mi.com.co, etc.) → busca "DNS Management" / "Zona DNS" y crea estos registros:

| Tipo | Nombre / Host | Valor | TTL |
|------|--------------|-------|-----|
| `A` | `@` | `203.0.113.50` (IP de tu servidor) | 300 |
| `A` | `www` | `203.0.113.50` | 300 |
| `CNAME` | `api` | `descargoycargo.com` (o registro A a la misma IP) | 300 |

- `@` = el dominio raíz (descargoycargo.com)
- `www` = www.descargoycargo.com
- `api` = api.descargoycargo.com (para el backend, separado del frontend)

⏱️ **Propagación:** de 10 minutos a 48 horas (normalmente menos de 1 hora). Verifica en [dnschecker.org](https://dnschecker.org) escribiendo tu dominio.

---

## PASO 3B — Alternativa si tu PC está detrás de CGNAT (sin IP pública propia)

Los ISP residenciales colombianos (Claro, Movistar, Tigo) suelen usar **CGNAT**: no tienes IP pública propia y los registros A no funcionarán. Solución gratuita: **Cloudflare Tunnel**.

1. Crea cuenta gratis en [cloudflare.com](https://cloudflare.com) → "Add a site" → escribe `descargoycargo.com`.
2. Cloudflare te da **2 nameservers** (ej. `lara.ns.cloudflare.com`). Ve al panel de tu registrador y **cambia los nameservers del dominio** por los de Cloudflare (esto reemplaza el Paso 3A: Cloudflare maneja tu DNS).
3. En tu PC/servidor instala `cloudflared` y ejecuta:
   ```bash
   cloudflared tunnel login
   cloudflared tunnel create descargoycargo
   cloudflared tunnel route dns descargoycargo descargoycargo.com
   cloudflared tunnel route dns descargoycargo www.descargoycargo.com
   cloudflared tunnel run descargoycargo
   ```
4. El túnel expone tu `localhost` al dominio **con HTTPS incluido**, sin abrir puertos en el router y sin IP fija.

✅ Ideal para la fase beta con costo $0. Para producción seria, migra al Paso 3A con un VPS.

---

## PASO 4 — Activa el candado HTTPS (gratis)

Con un VPS y dominio apuntado, la forma más fácil es **Caddy** (HTTPS automático):

Archivo `Caddyfile`:
```
descargoycargo.com {
    root * /var/www/descargoycargo/dist
    file_server
}

api.descargoycargo.com {
    reverse_proxy localhost:3000
}
```

```bash
sudo apt install caddy      # o con Docker
sudo systemctl reload caddy
```

Caddy obtiene y renueva el certificado **Let's Encrypt** solo. ✅ Verifica: `https://descargoycargo.com` debe abrir con candado.

*(Alternativa: Nginx + `certbot --nginx`. El resultado es el mismo; Caddy es más corto de configurar.)*

---

## PASO 5 — Verificación final (checklist)

- [ ] `https://descargoycargo.com` abre la plataforma con candado verde
- [ ] `https://www.descargoycargo.com` también funciona (redirige al raíz)
- [ ] `https://api.descargoycargo.com/health` responde `{"status":"ok"}`
- [ ] El dominio está en el panel de la pasarela de pagos (Wompi exige registrar el dominio del comercio)
- [ ] Google Play / App Store: el dominio servirá para la página de eliminación de cuenta y la política de privacidad (URLs obligatorias)
- [ ] Renovar dominio cada año en el registrador (activa renovación automática)

---

## Costos asociados al dominio

| Concepto | Costo | Frecuencia |
|----------|-------|-----------|
| Dominio .com | ✅ Ya comprado (~$50.000–70.000 COP/año en renovación) | Anual |
| DNS | Gratis (registrador o Cloudflare) | — |
| Certificado HTTPS | Gratis (Let's Encrypt / Cloudflare) | Automático |
| Servidor | Ver guía complementaria (PC propio $0 o VPS desde ~$25.000 COP/mes) | Mensual |

---

> **Nota:** si compraste el dominio con "correo incluido", configura también los registros MX para tener contacto@descargoycargo.com — da mucha más confianza que un Gmail en la página legal y en MinTransporte.
