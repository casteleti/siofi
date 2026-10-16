import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { z } from 'zod';

const root = resolve('/app/dist/client');
const port = Number(process.env.PORT || 3000);
const touch = z.object({
  utm_source:z.string().max(100).optional(),utm_medium:z.string().max(100).optional(),
  utm_campaign:z.string().max(150).optional(),utm_content:z.string().max(150).optional(),
  utm_term:z.string().max(150).optional(),gclid:z.string().max(255).optional(),
  gbraid:z.string().max(255).optional(),wbraid:z.string().max(255).optional(),
  fbclid:z.string().max(255).optional(),landing_url:z.string().max(2048).optional(),
  referrer:z.string().max(2048).optional(),seen_at:z.string().max(64).optional()
}).strict();
const schema = z.object({
  leadId:z.uuid(),name:z.string().trim().min(1).max(120),
  company:z.string().trim().min(1).max(150),whatsapp:z.string().trim().min(10).max(20),
  city:z.string().trim().min(1).max(100),employeesRange:z.enum(['1-4','5-12','13+']),
  usesManagementSystem:z.enum(['sim','nao']),currentSystem:z.string().max(150).optional(),
  formContext:z.enum(['final_cta','troca_sistema']).default('final_cta'),
  pageVariant:z.string().max(60).default('siofi_main'),website_url:z.string().max(500).optional().default(''),
  formRenderedAt:z.number(),firstTouch:touch.nullable().optional(),lastTouch:touch.nullable().optional(),
  fbp:z.string().max(255).optional(),fbc:z.string().max(255).optional(),
  consentAdUserData:z.boolean().default(false),consentAnalyticsStorage:z.boolean().default(false)
}).strict();
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.woff2':'font/woff2','.json':'application/json','.xml':'application/xml','.txt':'text/plain'};
const attempts=new Map(), completed=new Map();
const send=(res,status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
const sanitize=s=>s.replace(/[<>\x00-\x1f]/g,'').trim();
async function lead(req,res){
  const origin=req.headers.origin;
  const expected='https://siofi.com.br';
  if(origin && origin!==expected) return send(res,403,{ok:false,error:'forbidden'});
  const ip=(req.socket.remoteAddress||'unknown');
  const now=Date.now(), prev=(attempts.get(ip)||[]).filter(t=>now-t<60000);
  if(prev.length>=10) return send(res,429,{ok:false,error:'rate_limited'});
  attempts.set(ip,[...prev,now]);
  let raw='';
  try {
    for await(const chunk of req){raw+=chunk;if(raw.length>16384)return send(res,413,{ok:false,error:'too_large'});}
    const parsed=schema.safeParse(JSON.parse(raw));
    if(!parsed.success)return send(res,422,{ok:false,error:'validation'});
    const d=parsed.data;
    if(d.website_url||now-d.formRenderedAt<3000)return send(res,200,{ok:true,lead_id:d.leadId});
    if(completed.has(d.leadId))return send(res,200,completed.get(d.leadId));
    const phone=d.whatsapp.replace(/\D/g,'');
    if(phone.length<10||phone.length>13)return send(res,422,{ok:false,error:'validation'});
    const token=process.env.RD_STATION_API_KEY;
    if(!token)return send(res,503,{ok:false,error:'integration_unavailable'});
    const payload={event_type:'CONVERSION',event_family:'CDP',payload:{
      conversion_identifier:'siofi_site_form',name:sanitize(d.name),
      phone:phone.startsWith('55')?'+'+phone:'+55'+phone,
      company_name:sanitize(d.company),city:sanitize(d.city),
      tags:['siofi','landing_page'],traffic_source:d.lastTouch?.utm_source||d.firstTouch?.utm_source||undefined
    }};
    let response;
    try {
      response=await fetch('https://api.rd.services/platform/conversions?api_key='+encodeURIComponent(token),{
        method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify(payload),signal:AbortSignal.timeout(10000)
      });
    }catch{return send(res,502,{ok:false,error:'integration_unavailable'});}
    if(!response.ok)return send(res,502,{ok:false,error:'integration_unavailable'});
    const result={ok:true,lead_id:d.leadId};completed.set(d.leadId,result);
    return send(res,200,result);
  }catch{return send(res,422,{ok:false,error:'validation'});}
}
setInterval(()=>{const cutoff=Date.now()-3600000;for(const [k,v] of attempts)if(v.at(-1)<cutoff)attempts.delete(k);if(completed.size>5000)completed.clear();},600000).unref();
http.createServer(async(req,res)=>{
  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return send(res,400,{ok:false,error:'invalid_path'});}
  if(pathname==='/api/lead'){
    if(req.method!=='POST'){res.setHeader('Allow','POST');return send(res,405,{ok:false,error:'method_not_allowed'});}
    return lead(req,res);
  }
  if(req.method!=='GET'&&req.method!=='HEAD')return send(res,405,{ok:false,error:'method_not_allowed'});
  if(pathname==='/siofi'||pathname==='/siofi/'){res.writeHead(301,{Location:'/'});return res.end();}
  const path=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(path!==root&&!path.startsWith(root+sep))return send(res,403,{ok:false,error:'forbidden'});
  const candidates=[path, path+'.html',resolve(path,'index.html')];
  for(const file of candidates){
    try{
      if(!(await stat(file)).isFile())continue;
      const body=await readFile(file);
      res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});
      return res.end(req.method==='HEAD'?undefined:body);
    }catch{}
  }
  res.writeHead(404);res.end('Not Found');
}).listen(port,'0.0.0.0',()=>console.log('siofi server listening on '+port));
