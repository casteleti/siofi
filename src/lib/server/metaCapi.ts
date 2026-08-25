/**
 * Meta Conversion API (spec técnica §29): dispara em paralelo ao Pixel do
 * browser, com o mesmo `event_id` (= `lead_id`) para deduplicação (§30).
 * Só chamado quando `META_PIXEL_ID`/`META_CAPI_ACCESS_TOKEN` estão
 * configurados e o usuário consentiu com `ad_user_data` (§38).
 */
async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export interface MetaCapiParams {
  leadId: string;
  eventSourceUrl: string;
  phoneE164: string;
  clientIp?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  pixelId: string;
  accessToken: string;
}

export async function sendMetaCapiLead(params: MetaCapiParams): Promise<{ delivered: boolean }> {
  const hashedPhone = await sha256Hex(params.phoneE164);

  const body = {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.leadId,
        action_source: 'website',
        event_source_url: params.eventSourceUrl,
        user_data: {
          ph: [hashedPhone],
          client_ip_address: params.clientIp,
          client_user_agent: params.userAgent,
          fbp: params.fbp,
          fbc: params.fbc,
          external_id: [params.leadId],
        },
      },
    ],
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${params.pixelId}/events?access_token=${encodeURIComponent(params.accessToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      console.error(`[siofi] Meta CAPI respondeu ${response.status} para lead_id=${params.leadId}`);
      return { delivered: false };
    }

    return { delivered: true };
  } catch (error) {
    console.error(`[siofi] Falha ao enviar lead_id=${params.leadId} ao Meta CAPI:`, error);
    return { delivered: false };
  }
}
