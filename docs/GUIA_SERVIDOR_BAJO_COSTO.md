# 💻 Guía: ¿Usar mi PC como servidor? — Análisis eficiencia-costo para empezar barato

**Proyecto:** Descargo & Cargo 2.0
**Fecha:** 2026-07-25 · Versión 1.0
**Pregunta original del fundador:** *"¿Puedo utilizar mi PC como servidor para no pagar por ahora un C-Panel? Si es posible, dame las mejores recomendaciones eficiencia-costo para empezar con costos bajos."*

---

## Respuesta corta

**Sí se puede, y es una buena estrategia para la fase beta** — pero NO exponiendo tu PC directamente a internet ni con C-Panel. El camino eficiente-barato es:

```
FASE 0 (hoy):        Tu PC = desarrollo → GRATIS
FASE 1 (beta):       Tu PC + Cloudflare Tunnel → GRATIS (~$0/mes)
FASE 2 (lanzamiento): VPS económico → ~$25.000–50.000 COP/mes
FASE 3 (crecimiento): VPS más grande o servicios administrados → ~$200.000+/mes
```

---

## 1. Tu PC como servidor: lo bueno y lo malo

### ✅ A favor
- Costo marginal $0 (ya la tienes)
- Ideal para desarrollar, probar y hacer la **beta cerrada** (20–50 usuarios de prueba)
- Control total del hardware

### ⚠️ En contra (y cómo mitigarlo)

| Problema | Impacto | Mitigación |
|----------|---------|-----------|
| **CGNAT** (Claro/Movistar/Tigo residencial): sin IP pública propia | Nadie puede llegar a tu PC desde internet | **Cloudflare Tunnel** (gratis) — no necesitas IP pública ni abrir puertos |
| IP dinámica | El DNS se desactualiza | Cloudflare Tunnel también lo resuelve |
| Apagones / suspensión del PC | La plataforma se cae | Solo para beta; en producción se migra a VPS |
| Consumo eléctrico 24/7 | Un PC de escritorio encendido 24/7 ≈ **$60.000–120.000 COP/mes** de energía | Irónico: puede costar MÁS que un VPS básico |
| Seguridad | Exponer tu red casera a ataques | Nunca expongas puertos del router; solo túnel |
| Rendimiento | Tu PC también es tu computador de trabajo | Docker con límites de CPU/RAM |

> **Conclusión honesta:** tu PC es perfecta para las fases 0 y 1. Para la fase 2 (usuarios reales pagando), un VPS de $6–12 USD/mes es más barato que la factura de energía de tu PC encendida todo el día — y no se cae con un apagón.

---

## 2. Comparativa eficiencia-costo (precios 2026, aproximados)

| Opción | Costo mensual | Uptime real | Dificultad | ¿Cuándo usarla? |
|--------|---------------|-------------|-----------|------------------|
| **Tu PC + Cloudflare Tunnel** | $0 (+ energía $60–120k si 24/7) | 90–95% | Baja | Beta cerrada, demos |
| **Oracle Cloud Free Tier** | $0 (si hay disponibilidad) | 99% | Media | Producción austera si logras instancia gratis |
| **Contabo VPS S** | ~$6 USD (~$25.000 COP) | 99% | Media | **Recomendada para lanzamiento** |
| **Hetzner CX22** | ~€4,5 (~$21.000 COP) | 99,9% | Media | Recomendada (mejor red, Alemania/Finlandia) |
| **DigitalOcean Basic** | $6 USD (~$25.000 COP) | 99,9% | Baja (mucha documentación) | Recomendada |
| **Vercel/Netlify (solo frontend) + Railway (backend)** | $0–20 USD | 99,9% | **Muy baja** | Si no quieres administrar servidor |
| C-Panel / hosting compartido | $30.000–80.000 COP | 99% | Baja | ❌ **No aplica**: está pensado para PHP/WordPress, no para nuestra stack (Node + PostgreSQL + WebSockets) |

> 💡 Sobre C-Panel: no lo necesitas. Nuestra arquitectura usa Docker; C-Panel es de otra época y otro tipo de aplicaciones. Te ahorras ese gasto desde ya.

---

## 3. Recomendación concreta paso a paso

### FASE 0 — Ahora (desarrollo): $0/mes
- Desarrolla en tu PC con `npm run dev`.
- Base de datos PostgreSQL en Docker local.
- Costo: **$0**.

### FASE 1 — Beta cerrada (20–50 usuarios): $0/mes
1. Monta la app completa en tu PC con `docker-compose up` (frontend compilado + API + PostgreSQL + Redis).
2. Expón con **Cloudflare Tunnel** → `https://descargoycargo.com` funcionando con candado, gratis (ver Guía de dominio, Paso 3B).
3. Backups diarios automáticos a un disco externo o a Backblaze B2 (~$2 USD/mes opcional).
4. Regla de oro: **no guardes en tu PC los únicos backups**.
- Costo total: **$0–8.000 COP/mes**.

### FASE 2 — Lanzamiento público: ~$25.000–50.000 COP/mes
1. Alquila un VPS (Contabo/Hetzner/DigitalOcean: 2 vCPU, 4 GB RAM, 80 GB SSD).
2. Mismo `docker-compose.yml` — la migración es copiar la carpeta, correr `docker compose up -d` y restaurar el backup de la BD.
3. Cambia el DNS del dominio de Cloudflare Tunnel al registro A del VPS (10 minutos).
4. HTTPS con Caddy + Let's Encrypt (gratis, automático).
- Costo total: **~$25.000–50.000 COP/mes** (+ renovación anual del dominio).

### FASE 3 — Crecimiento (500+ usuarios activos): desde ~$200.000 COP/mes
- VPS más grande (8 GB RAM) o separar BD en instancia propia.
- Cloudflare gratis como CDN/escudo delante.
- Monitoreo con UptimeRobot (gratis) y Sentry (plan gratis).
- El estimado completo está en PLAN_INTEGRAL_V3.md §16.

---

## 4. Checklist de seguridad mínima (cualquier fase)

- [ ] Nunca abras puertos del router de tu casa hacia el PC (usa túnel)
- [ ] Contraseñas de la BD fuertes y en archivo `.env` fuera del código
- [ ] Firewall del servidor: solo puertos 80/443 abiertos (el túnel ni eso)
- [ ] Backups automáticos diarios de PostgreSQL (script `pg_dump` programado)
- [ ] Actualizaciones de seguridad del sistema operativo activadas
- [ ] Fail2ban en el VPS (bloquea intentos de fuerza bruta SSH)

---

## 5. Resumen en una frase

> **Desarrolla y haz la beta en tu PC con Cloudflare Tunnel ($0), y el día que lances al público pásate a un VPS de ~$25.000 COP/mes: cuesta menos que la energía de tu PC 24/7 y no se cae con un apagón. Olvídate de C-Panel: no aplica para nuestra tecnología.**
