// Número de contacto WhatsApp del club (sin '+'), centralizado — mismo número
// que usa el sitio web (app/lib/whatsapp.ts en sistema-club-deportivo).
export const WA_CLUB_NUMBER = '5493756415586';

export function waLink(text: string): string {
  return `https://wa.me/${WA_CLUB_NUMBER}?text=${encodeURIComponent(text)}`;
}

// Identidad para el menú de consulta por WhatsApp — null si no hay sesión.
// dni es opcional: si hay usuario logueado pero no tenemos su DNI a mano,
// se omite esa parte del texto (nunca se inventa ni se pide).
export type ConsultaUsuario = { nombre: string; dni?: string | null } | null;

export type ConsultaOpcion = {
  key: 'BAJA' | 'CUOTA' | 'BENEFICIOS' | 'OTRA';
  label: string;
  texto: string;
};

export function construirOpcionesConsulta(usuario: ConsultaUsuario): ConsultaOpcion[] {
  if (usuario) {
    const identificacion = usuario.dni
      ? `soy ${usuario.nombre} (socio, DNI ${usuario.dni})`
      : `soy ${usuario.nombre} (socio)`;
    return [
      { key: 'BAJA', label: 'Quiero darme de baja', texto: `Hola, ${identificacion}. Quiero consultar sobre darme de baja del club.` },
      { key: 'CUOTA', label: 'Consulta sobre mi cuota o pago', texto: `Hola, ${identificacion}. Tengo una consulta sobre mi cuota / pago.` },
      { key: 'BENEFICIOS', label: '¿Qué beneficios tengo como socio?', texto: `Hola, ${identificacion}. Quiero conocer los beneficios de ser socio.` },
      { key: 'OTRA', label: 'Otra consulta', texto: `Hola, ${identificacion}. ` },
    ];
  }
  return [
    { key: 'BAJA', label: 'Quiero darme de baja', texto: 'Hola, quiero consultar sobre darme de baja del club.' },
    { key: 'CUOTA', label: 'Consulta sobre mi cuota o pago', texto: 'Hola, tengo una consulta sobre una cuota / pago.' },
    { key: 'BENEFICIOS', label: '¿Qué beneficios tengo como socio?', texto: 'Hola, quiero conocer los beneficios de ser socio.' },
    { key: 'OTRA', label: 'Otra consulta', texto: 'Hola, ' },
  ];
}
