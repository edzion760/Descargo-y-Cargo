"""Lee los 3 excels viejos (2023) de prospectos, normaliza telefonos/emails,
elimina duplicados entre hojas, y escribe un JSON listo para importar.
Uso: python normalizar_prospectos.py
No toca la base de datos de la app -- solo genera el JSON.
"""
import json
import re
import openpyxl

BASE = r"C:\Users\USUARIO\OneDrive\Desktop\DYC\Bases datos Transporte"


def normalizar_tel(v):
    if v is None:
        return None
    s = str(v)
    s = re.sub(r"[^\d]", "", s)  # solo digitos
    if s.startswith("57") and len(s) > 10:
        s = s[2:]
    if len(s) < 7:
        return None
    return s[-10:] if len(s) >= 10 else s


def normalizar_email(v):
    if v is None:
        return None
    s = str(v).strip().lower()
    return s if "@" in s and "." in s else None


prospectos = {}  # clave dedup -> registro
fuentes_count = {}


def agregar(nombre, tipo, fuente, telefonos, email, nit=None, direccion=None, ciudad=None,
            departamento=None, sector=None):
    nombre = (str(nombre).strip() if nombre else None)
    tels = [normalizar_tel(t) for t in telefonos]
    tels = [t for t in tels if t]
    email = normalizar_email(email)
    if not nombre and not tels and not email:
        return  # fila vacia/basura

    clave = tels[0] if tels else (email if email else f"sin-clave-{nombre}")
    if clave in prospectos:
        # completa campos faltantes en vez de duplicar
        existente = prospectos[clave]
        if not existente.get("email") and email:
            existente["email"] = email
        for t in tels:
            if t not in existente["telefonos"]:
                existente["telefonos"].append(t)
        return

    prospectos[clave] = {
        "nombre": nombre,
        "tipoInteres": tipo,
        "fuente": fuente,
        "telefonos": tels,
        "email": email,
        "nit": str(nit) if nit else None,
        "direccion": direccion,
        "ciudad": ciudad,
        "departamento": departamento,
        "sector": sector,
    }
    fuentes_count[fuente] = fuentes_count.get(fuente, 0) + 1


# 1) Empresas Trans (registro oficial, TRANSPORTADOR)
wb = openpyxl.load_workbook(f"{BASE}\\Empresas de transporte- Edison.xlsx", data_only=True)
ws = wb["Empresas Trans"]
for row in ws.iter_rows(min_row=2, values_only=True):
    nombre, nit, territorial, direccion, ciudad, t1, t2, t3, email = row
    agregar(nombre, "TRANSPORTADOR", "Registro MinTransporte 2023", [t1, t2, t3], email,
            nit=nit, direccion=direccion, ciudad=ciudad, departamento=territorial)

# 2) Contactos Facebook (mudanzas, TRANSPORTADOR)
ws = wb["Contactos Facebook"]
for row in ws.iter_rows(min_row=2, values_only=True):
    t1, t2, nombre, direccion, email = row
    agregar(nombre, "TRANSPORTADOR", "Facebook 2023", [t1, t2], email, direccion=direccion)

# 3) Empresas Publicar (por sector, PUBLICADOR)
ws = wb["Empresas Publicar"]
for row in ws.iter_rows(min_row=2, values_only=True):
    tel, nombre, sector = row
    agregar(nombre, "PUBLICADOR", "Prospección sectorial 2023", [tel], None, sector=sector)

wb.close()

# 4) Base Datos Transportadores.xlsx (78 filas, TRANSPORTADOR, mudanzas -- se
# solapa mucho con Contactos Facebook, agregar() ya deduplica por telefono)
wb2 = openpyxl.load_workbook(f"{BASE}\\Base Datos Transportadores.xlsx", data_only=True)
ws = wb2["Hoja1"]
for row in ws.iter_rows(min_row=2, values_only=True):
    t1, t2, nombre, direccion, email = row
    agregar(nombre, "TRANSPORTADOR", "Base transportadores 2023", [t1, t2], email, direccion=direccion)
wb2.close()

registros = list(prospectos.values())
con_contacto = [r for r in registros if r["telefonos"] or r["email"]]

print(f"Total únicos: {len(registros)}")
print(f"Con al menos un teléfono o email real: {len(con_contacto)}")
print("Por fuente:", fuentes_count)
print("Por tipo:", {
    "TRANSPORTADOR": sum(1 for r in registros if r["tipoInteres"] == "TRANSPORTADOR"),
    "PUBLICADOR": sum(1 for r in registros if r["tipoInteres"] == "PUBLICADOR"),
})

with open(f"{BASE}\\prospectos_limpios.json", "w", encoding="utf-8") as f:
    json.dump(con_contacto, f, ensure_ascii=False, indent=2)
print("Escrito:", f"{BASE}\\prospectos_limpios.json")
