# POLÍTICA DE TRATAMIENTO DE DATOS PERSONALES — DESCARGO & CARGO
## BORRADOR PARA REVISIÓN LEGAL · Versión 0.1 · 2026-07-24
### Conforme a la Ley 1581 de 2012, el Decreto 1377 de 2013, la Ley 1266 de 2008 y las Circulares de la SIC

> ⚠️ **ADVERTENCIA:** Borrador técnico como insumo para el abogado del proyecto. **No publicar sin revisión legal.** Los campos `[...]` deben completarse. Debe publicarse en URL permanente y accesible antes de lanzar el registro de usuarios, y registrarse la base de datos en el RNBD de la SIC.

---

## 1. RESPONSABLE DEL TRATAMIENTO

**[RAZÓN SOCIAL S.A.S.]** — NIT `[NIT]`
Domicilio: `[CIUDAD, DIRECCIÓN]`
Correo para temas de datos personales: `[EMAIL DATOS]`
Teléfono: `[TELÉFONO]`
En adelante, "**la Plataforma**" o "**el Responsable**".

---

## 2. ALCANCE Y MARCO LEGAL

Esta política aplica a todos los datos personales recolectados a través del sitio web `[DOMINIO]`, las aplicaciones móviles y los canales de atención de la Plataforma, y se rige por:

- Ley 1581 de 2012 (régimen general de protección de datos personales)
- Decreto 1377 de 2013 (reglamentario de autorización y políticas)
- Decreto 1074 de 2015 (sector comercio, industria y turismo; RNBD)
- Ley 1266 de 2008 (habeas data en información financiera y crediticia), cuando aplique
- Sentencia C-748 de 2011 y demás jurisprudencia constitucional aplicable
- Circulares de la Superintendencia de Industria y Comercio (SIC)

---

## 3. DATOS PERSONALES QUE RECOLECTAMOS

### 3.1. Datos de identificación y contacto (todos los usuarios)
- Nombre completo o razón social
- Tipo y número de documento de identidad / NIT
- Correo electrónico, número de teléfono
- Dirección, ciudad y departamento

### 3.2. Datos de la actividad en la Plataforma
- Publicaciones de carga (origen, destino, tipo de mercancía, valores)
- Ofertas, viajes, calificaciones, mensajes dentro del chat interno
- Registros de pagos de servicios de la Plataforma (método, referencia, monto — **no** almacenamos datos completos de tarjetas)
- Registros de aceptación de términos y documentos (fecha, hora, IP, versión)
- Registros de auditoría (inicios de sesión, acciones relevantes, dirección IP)

### 3.3. Datos de Transportadores (adicionales)
- Licencia de conducción (número y vigencia)
- Datos del vehículo: placa, tipo, documentos (tarjeta de propiedad, SOAT, revisión técnico-mecánica)
- **Datos de geolocalización del vehículo**, únicamente: (a) cuando el Transportador activa su disponibilidad, y (b) durante un Viaje en curso, con fines de trazabilidad de la operación y apoyo al cumplimiento del reporte de tiempos logísticos conforme a la normativa del RNDC

### 3.4. Datos sensibles (solo con consentimiento expreso y separado — ver §7)
- Datos biométricos (selfie con documento / reconocimiento facial) para verificación nivel 3
- Certificados de antecedentes judiciales, cuando el Usuario opte por la verificación premium

### 3.5. Datos recolectados automáticamente
- Cookies y tecnologías similares (funcionales, de preferencias y estadísticas) conforme al aviso de cookies de la Plataforma; las no esenciales requieren consentimiento
- Datos del dispositivo y del navegador, con fines de seguridad y mejora del servicio

---

## 4. FINALIDADES DEL TRATAMIENTO

### 4.1. Finalidades principales (necesarias para el servicio)
1. Crear y administrar la cuenta del Usuario.
2. Operar la intermediación: publicar Cargas, mostrar ofertas, habilitar el contacto entre Publicador y Transportador tras el pago correspondiente.
3. Procesar pagos de los servicios propios de la Plataforma y expedir facturación electrónica.
4. Verificar identidad y documentos (KYC) en los niveles descritos en los Términos y Condiciones.
5. Generar y conservar documentos electrónicos de las operaciones (contratos, confirmaciones) con sus registros de integridad.
6. Mostrar la ubicación del vehículo durante un Viaje activo al Publicador correspondiente.
7. Prestar los canales de atención y PQRS conforme a la Ley 1480 de 2011.
8. Cumplir obligaciones legales, contables, fiscales y de trazabilidad, y atender requerimientos de autoridades competentes.

### 4.2. Finalidades secundarias (con posibilidad de oposición)
9. Enviar notificaciones sobre Cargas disponibles en zonas de interés del Usuario.
10. Enviar alertas de noticias de carretera geolocalizadas.
11. Informar sobre beneficios de aliados (descuentos en combustible, seguros, entre otros).
12. Elaborar estadísticas agregadas y anonimizadas de mercado (índices de fletes, tiempos logísticos), que no permiten identificar al Usuario.
13. Mejorar el servicio mediante análisis de uso.

El Usuario puede oponerse al tratamiento para las finalidades 9 a 13 en cualquier momento (ver §8), sin que ello afecte la prestación del servicio principal, salvo las alertas operativas estrictamente necesarias.

---

## 5. GEOLOCALIZACIÓN — REGLAS ESPECÍFICAS

5.1. La ubicación precisa del Transportador **solo se recolecta** cuando: (a) activa su estado "disponible", o (b) hay un Viaje en curso asignado a él. Fuera de estos casos, la app no recolecta ubicación en segundo plano.

5.2. La ubicación durante un Viaje se muestra únicamente al Publicador de ese Viaje.

5.3. El historial de ubicaciones de un Viaje se conserva `[24]` meses con fines de trazabilidad de la operación, soporte de tiempos logísticos ante el RNDC y resolución de disputas; después se elimina o anonimiza.

---

## 6. TRANSFERENCIAS Y TRANSMISIONES (ENCARGADOS)

Los datos podrán ser transmitidos a encargados del tratamiento que prestan servicios a la Plataforma, bajo contratos de encargo conforme al artículo 25 del Decreto 1377 de 2013:

| Encargado | Servicio | Ubicación del procesamiento |
|-----------|----------|-----------------------------|
| `[WOMPI / pasarela]` | Procesamiento de pagos | Colombia |
| `[SENDGRID / proveedor email]` | Envío de correos transaccionales | `[PAÍS]` |
| `[TWILIO / proveedor SMS]` | Mensajes de verificación OTP | `[PAÍS]` |
| `[MAPBOX]` | Mapas y cálculo de rutas | `[PAÍS]` |
| `[PROVEEDOR DE NUBE, ej. AWS/Hetzner]` | Alojamiento de la Plataforma y datos | `[PAÍS/REGIÓN]` |
| `[PROVEEDOR IA, ej. OpenAI]` | Análisis de noticias públicas de carretera | `[PAÍS]` |
| `[FACTURADOR ELECTRÓNICO]` | Facturación electrónica DIAN | Colombia |

6.1. **Garantía importante:** al proveedor de IA se envían únicamente noticias públicas y datos de geolocalización de eventos (no datos personales de Usuarios).

6.2. Si algún encargado procesa datos fuera de Colombia, la transmisión internacional se hará conforme al artículo 26 de la Ley 1581 de 2012, con las garantías contractuales del caso. `[El abogado debe verificar si aplica transferencia internacional y sus mecanismos: estándares de la SIC, cláusulas contractuales, etc.]`

6.3. La Plataforma **no vende** datos personales a terceros.

---

## 7. DATOS SENSIBLES — CONSENTIMIENTO EXPRESO Y SEPARADO

7.1. Conforme al artículo 5 de la Ley 1581 de 2012, son datos sensibles los datos biométricos y los antecedentes judiciales.

7.2. Su tratamiento:
- Requiere **autorización expresa, informada y separada** del titular, solicitada en un paso independiente del registro general.
- Es **siempre opcional**: el Usuario puede usar las funciones básicas de la Plataforma (nivel 1 y 2 de verificación) sin entregar datos sensibles.
- Se almacena **cifrado** y con acceso restringido al personal estrictamente autorizado.
- El titular puede revocar el consentimiento en cualquier momento, con efectos hacia el futuro (ver §8), sin efectos retroactivos sobre la licitud del tratamiento previo.

---

## 8. DERECHOS DEL TITULAR Y PROCEDIMIENTO (ARCO)

Conforme a los artículos 8 y 14-15 de la Ley 1581 de 2012, el titular puede, de forma gratuita:

- **Acceder:** conocer qué datos suyos tratamos.
- **Actualizar y Rectificar:** corregir datos inexactos o incompletos.
- **Suprimir (Cancelar):** solicitar la eliminación de sus datos cuando no exista deber legal de conservarlos.
- **Oponerse / Revocar:** revocar el consentimiento para finalidades secundarias o datos sensibles.

**Procedimiento:**
1. Radicar la solicitud en `[EMAIL DATOS]` o `[CANAL FÍSICO]`, indicando: nombre, identificación, descripción de la solicitud y datos de contacto para la respuesta.
2. También puede ejercer la supresión desde la propia aplicación: `Configuración → Cuenta → Eliminar cuenta`, o en la página pública `[URL DE ELIMINACIÓN DE CUENTA]` (disponible sin necesidad de iniciar sesión, conforme a las políticas de las tiendas de aplicaciones).
3. Términos de respuesta: **consultas: 10 días hábiles**; **reclamos: 15 días hábiles**, conforme a la ley.
4. Si la solicitud es incompleta, se requerirá al titular dentro de los 5 días siguientes para completarla; si no lo hace en 2 meses, se entenderá desistida.

---

## 9. SEGURIDAD DE LA INFORMACIÓN

La Plataforma implementa medidas técnicas y administrativas razonables para proteger los datos, entre ellas:

- Cifrado de contraseñas (algoritmo bcrypt) y de datos sensibles en reposo.
- Cifrado en tránsito (TLS) en todas las comunicaciones.
- Control de acceso por roles y registro de auditoría de accesos a datos personales.
- Copias de seguridad periódicas.
- Limitación de retención: los datos se conservan solo mientras sean necesarios para las finalidades o exigidos por ley.

Ningún sistema es infalible; en caso de incidente de seguridad que afecte datos personales, la Plataforma actuará conforme a la ley y, cuando corresponda, informará a los titulares y a las autoridades.

---

## 10. DATOS DE MENORES DE EDAD

La Plataforma no está dirigida a menores de edad y no recolecta deliberadamente sus datos. Si se detecta una cuenta de un menor, será cancelada y sus datos eliminados.

---

## 11. VIGENCIA, RETENCIÓN Y ELIMINACIÓN

11.1. Los datos de la cuenta se conservan mientras esta esté activa.

11.2. Tras la eliminación de la cuenta, los datos se bloquean y conservan únicamente por los términos legales exigidos (contables y fiscales: generalmente 10 años conforme al art. 28 de la Ley 962 de 2005; documentos de operaciones y trazabilidad: el término aplicable), y luego se eliminan de forma segura.

11.3. Los datos anonimizados (que ya no identifican a nadie) podrán conservarse con fines estadísticos.

---

## 12. REGISTRO NACIONAL DE BASES DE DATOS (RNBD)

La base de datos de la Plataforma será registrada ante la Superintendencia de Industria y Comercio conforme al Decreto 1074 de 2015. `[Completar número de registro una vez realizado el trámite.]`

---

## 13. CAMBIOS A ESTA POLÍTICA

Cambios sustanciales serán notificados por correo y/o aviso en la Plataforma con al menos `[15]` días de antelación. Cuando el cambio implique nuevas finalidades que requieran consentimiento, este se solicitará nuevamente.

---

**Fecha de última actualización:** `[FECHA]`
**Versión:** `[1.0]`

---

### 📋 NOTAS PARA EL ABOGADO (no publicar)

1. Verificar si por el volumen/actividad aplica registro RNBD obligatorio y en qué momento (hay umbrales por activos/ingresos para personas naturales; las sociedades deben registrar).
2. La plataforma usa OpenAI en EE.UU.: confirmar encuadre de la transmisión internacional (art. 26 L.1581) — aunque no se envían datos personales, el contrato con el encargado debe reflejarlo.
3. Considerar nombramiento formal de oficial de protección de datos (no obligatorio en Colombia, pero recomendado).
4. Revisar la retención de geolocalización (`24 meses`) frente al principio de proporcionalidad — podría justificarse por plazos de prescripción y auditorías Supertransporte.
5. Ley 1266/2008: si se activa `saldoAFavor` o crédito a transportadores, se requiere sección adicional de datos financieros.
6. Preparar el formato de "Autorización de tratamiento de datos sensibles" como documento separado con firma/aceptación propia.
