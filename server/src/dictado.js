import Anthropic from '@anthropic-ai/sdk';

// Convierte lo que Edison dicta en una feria ("Café La Mesa, habla con Juan
// Pérez, gerente, celular tres diez...") en los campos del formulario de
// contacto. Con ANTHROPIC_API_KEY lo organiza Claude; sin ella (o si la
// llamada falla) se sacan celular y correo con reglas y todo el texto queda
// en notas, para que el dictado nunca se pierda.

const CAMPOS = ['empresa', 'contacto', 'cargo', 'telefono', 'email', 'web', 'ciudad', 'notas'];

const ESQUEMA = {
  type: 'object',
  properties: Object.fromEntries(CAMPOS.map((c) => [c, { type: 'string' }])),
  required: CAMPOS,
  additionalProperties: false,
};

const INSTRUCCIONES = `Organizas notas dictadas en voz alta en una feria comercial en Colombia, sobre una empresa con la que se habló en su stand. Llena los campos con lo que se dijo:
- empresa: nombre de la empresa.
- contacto: nombre de la persona.
- cargo: su cargo.
- telefono: celular colombiano de 10 dígitos, solo números, sin +57. Si se dictó en palabras ("tres diez cinco..."), pásalo a dígitos.
- email: correo; "arroba" es @ y "punto" es un punto.
- web: página web o enlace.
- ciudad: ciudad de la empresa.
- notas: todo lo demás que sirva para el seguimiento (qué producen o despachan, a dónde, volúmenes, compromisos, cuándo llamar), redactado claro y breve.
Si un dato no se dijo, deja el campo vacío. No inventes ni completes datos.`;

const cliente = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

export async function organizarDictado(texto) {
  if (cliente) {
    try {
      return await conClaude(texto);
    } catch (err) {
      console.error('[dictado] Claude no respondió, uso reglas:', err.message);
    }
  }
  return extraerBasico(texto);
}

async function conClaude(texto) {
  const r = await cliente.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 4000,
    system: INSTRUCCIONES,
    messages: [{ role: 'user', content: texto }],
    output_config: { effort: 'low', format: { type: 'json_schema', schema: ESQUEMA } },
    // Si un clasificador de seguridad declinara (raro para datos de contacto), otro modelo responde.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
  });
  if (r.stop_reason !== 'end_turn') throw new Error(`stop_reason ${r.stop_reason}`);
  const json = r.content.find((b) => b.type === 'text')?.text;
  const datos = JSON.parse(json);
  return Object.fromEntries(CAMPOS.map((c) => [c, String(datos[c] ?? '').trim()]));
}

// Sin IA: celular y correo por patrones; el resto, tal cual, en notas.
export function extraerBasico(texto) {
  const limpio = texto.replace(/\s+arroba\s+/gi, '@').replace(/(@\S+?)\s+punto\s+/gi, '$1.');
  const telefono = (limpio.replace(/(\d)[\s.-]+(?=\d)/g, '$1').match(/(?<!\d)(?:\+?57)?(3\d{9})(?!\d)/) ?? [])[1] ?? '';
  const email = (limpio.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/) ?? [''])[0].toLowerCase();
  const base = Object.fromEntries(CAMPOS.map((c) => [c, '']));
  return { ...base, telefono, email, notas: texto.trim() };
}
