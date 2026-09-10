# AUTORIZACIÓN EXPRESA PARA EL TRATAMIENTO DE DATOS SENSIBLES
## Verificación Premium (KYC Nivel 3) — DESCARGO & CARGO
### BORRADOR PARA REVISIÓN LEGAL · Versión 0.1 · 2026-07-24

> ⚠️ **ADVERTENCIA:** Borrador técnico como insumo para el abogado del proyecto. No publicar sin revisión legal. Los campos `[...]` deben completarse.
>
> **Fundamento:** artículos 5, 6 y 9 de la Ley 1581 de 2012 y Decreto 1377 de 2013. Los datos sensibles requieren autorización **expresa e informada**, separada de la autorización general de la Política de Tratamiento de Datos. Este documento se presenta al Usuario **en un paso independiente** dentro del flujo de Verificación Premium, nunca pre-marcado ni empaquetado con los TyC.

---

## 1. RESPONSABLE DEL TRATAMIENTO

**[RAZÓN SOCIAL S.A.S.]** — NIT `[NIT]`, domicilio `[CIUDAD, DIRECCIÓN]`, correo `[EMAIL DATOS]`, teléfono `[TELÉFONO]` (en adelante, "**la Plataforma**").

---

## 2. DECLARACIÓN DEL TITULAR

Yo, `[NOMBRE COMPLETO]`, identificado con `[TIPO DE DOCUMENTO]` No. `[NÚMERO]`, actuando en nombre propio, de manera **libre, expresa, informada e inequívoca**, declaro que:

### 2.1. Autorizo el tratamiento de los siguientes datos sensibles:

| Dato sensible | ¿Qué se recolecta? | Finalidad ÚNICA |
|---------------|--------------------|-----------------|
| **Dato biométrico facial** | Una fotografía (selfie) sosteniendo mi documento de identidad y el análisis de correspondencia facial entre esa fotografía y la foto del documento | Verificar que soy la persona titular del documento presentado, exclusivamente para otorgar la insignia de **Verificación Premium** en la Plataforma |
| **Antecedentes judiciales** | La consulta y resultado del certificado de antecedentes ante las fuentes públicas habilitadas `[Policía Nacional / Rama Judicial — definir con abogado]` | Evaluar la idoneidad para la insignia de Verificación Premium, generando confianza en los demás usuarios de la Plataforma |

### 2.2. Entiendo y acepto que:

1. **Este tratamiento es OPCIONAL.** No es obligatorio entregar datos sensibles: puedo usar todas las funciones básicas de la Plataforma con la verificación de niveles 1 y 2, sin entregar biometría ni antecedentes. La única diferencia es no obtener la insignia de Verificación Premium.
2. La negativa a otorgar esta autorización, o su revocación posterior, **no me genera sanción, cobro ni limitación** en los demás servicios de la Plataforma.
3. La fotografía biométrica se usa **una sola vez** para la comparación facial; el resultado (coincidencia/no coincidencia y un puntaje de confianza) es lo único que queda asociado a mi perfil, y la imagen se elimina en un plazo máximo de `[90]` días después de la verificación. `[Validar este plazo con el abogado — cuanto más corto, mejor proporcionalidad]`.
4. El certificado de antecedentes se conserva `[el resultado de la consulta / el documento]`, cifrado y con acceso restringido, durante la vigencia de mi insignia Premium, y se elimina al revocar la autorización o cancelar mi cuenta, salvo deber legal de conservación.
5. Mis datos sensibles se almacenan **cifrados** y **no se comparten con otros usuarios**: lo único visible para terceros es la insignia "Verificación Premium", nunca el contenido de los datos.
6. Mis datos sensibles **no se venden, no se usan para publicidad y no se envían a servicios de inteligencia artificial**.
7. La insignia Premium puede ser revocada por la Plataforma si la información deja de ser vigente o si incumplo los Términos y Condiciones.

---

## 3. DERECHOS QUE CONSERVO

Conozco que, conforme a la Ley 1581 de 2012, puedo en cualquier momento y de forma gratuita:

- **Conocer** qué datos sensibles míos trata la Plataforma;
- **Revocar esta autorización** y solicitar la **supresión** de mis datos sensibles, sin efectos retroactivos sobre la licitud del tratamiento anterior;
- **Actualizar y rectificar** la información;
- **Presentar quejas** ante la Superintendencia de Industria y Comercio por infracciones a la ley.

**Canales para ejercer estos derechos:**
- Correo: `[EMAIL DATOS]`
- En la aplicación: `Configuración → Privacidad → Revocar verificación premium`
- Página pública: `[URL]`
- Físico: `[DIRECCIÓN]`

Términos de respuesta: consultas, 10 días hábiles; reclamos, 15 días hábiles.

---

## 4. MANIFESTACIÓN DE CONSENTIMIENTO

☐ **SÍ autorizo** el tratamiento de mis datos sensibles (biometría facial y antecedentes judiciales) en los términos de este documento, exclusivamente para la Verificación Premium.

☐ **NO autorizo** el tratamiento de mis datos sensibles. Entiendo que puedo seguir usando la Plataforma con normalidad, sin la insignia Premium.

*(La casilla debe marcarse activamente por el titular; ninguna opción viene pre-marcada.)*

---

**Registro de aceptación (generado automáticamente por la Plataforma):**
- Fecha y hora: `[TIMESTAMP]`
- Dirección IP: `[IP]`
- Versión del documento aceptada: `[1.0]`
- Medio: `[APP MÓVIL / WEB]`
- Identificador de sesión: `[ID]`

---

**Fecha de última actualización:** `[FECHA]`
**Versión:** `[1.0]`

---

### 📋 NOTAS PARA EL ABOGADO (no publicar)

1. **Decisión clave — fuente de antecedentes:** validar qué certificado es jurídicamente utilizable para este fin comercial (Policía Nacional emite "certificado de antecedentes judiciales" para fines civiles; la Procuraduría y Contraloría tienen consultas públicas de inhabilidades). Definir si la plataforma consulta directamente (con autorización) o el usuario sube su propio certificado (más seguro jurídicamente — recomendado).
2. **Proveedor biométrico:** si se usa un tercero (AWS Rekognition, Verifik, Face++), este documento debe mencionarlo como encargado y el contrato debe incluir cláusulas de encargo (art. 25, Decreto 1377/2013).
3. **Retención biométrica:** verificar que el plazo de eliminación de la imagen (`90 días`) sea defendible; la tendencia de la SIC es exigir minimización extrema en biometría. Alternativa más robusta: eliminar la imagen inmediatamente después de la comparación y conservar solo el resultado.
4. **Registro de aceptación:** la tabla del §4 ya está soportada en el schema Prisma (`AuditLog` + campos de verificación) — verificar con el equipo técnico que se guarde versión del documento aceptado.
5. Considerar si personas jurídicas (empresas transportadoras) requieren una versión de este documento para sus conductores — en ese caso el titular es el conductor, no la empresa: **la autorización debe firmarla cada conductor individualmente**.
