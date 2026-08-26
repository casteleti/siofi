/**
 * Dados de contato reais da F5 (fornecidos em conversa — ainda faltam
 * WhatsApp e CNPJ, ver README). Centralizado aqui para não duplicar os
 * mesmos valores em Footer, SupportSection e organization.json.
 */
export const CONTACT = {
  address: {
    street: 'R. Floriano Peixoto, 907',
    complement: 'Sala 07 e 08 - Centro',
    city: 'Jaboticabal',
    state: 'SP',
    zip: '14870-370',
    country: 'BR',
  },
  phone: {
    display: '(16) 3203-4341',
    href: 'tel:+551632034341',
  },
  emails: {
    contact: 'falecom@f5sg.com.br',
    support: 'suporte@f5sg.com.br',
    billing: 'cobranca@f5sg.com.br',
  },
} as const;

export const CITY_STATE = `${CONTACT.address.city}, ${CONTACT.address.state}`;

export const ADDRESS_ONE_LINE = `${CONTACT.address.street}, ${CONTACT.address.complement}, ${CITY_STATE} — CEP ${CONTACT.address.zip}`;

export function getMapsHref(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS_ONE_LINE)}`;
}
