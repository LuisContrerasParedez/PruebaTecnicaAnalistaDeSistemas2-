import * as svc from './reportes.service.js';

export async function expResumen(req, res) {
  const q = req.validated?.query || req.query || {};
  const data = await svc.expResumen(q);
  res.json({ data });
}

export async function expDetalle(req, res) {
  const q = req.validated?.query || req.query || {};
  const out = await svc.expDetalle(q);
  res.json(out);
}

export async function expDetalleCsv(req, res) {
  const q = req.validated?.query || req.query || {};
  const out = await svc.expDetalle(q);
  const rows = out.data || [];

  // CSV simple
  const headers = [
    'CodigoExpediente','no_expediente','fiscalia','unidad','estado',
    'descripcion','creado_en','actualizado_en','tecnico_nombre','coordinador_nombre','indicios_count'
  ];
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => {
      const v = r[h] ?? '';
      const s = (typeof v === 'string') ? v.replace(/"/g,'""') : String(v);
      return `"${s}"`;
    }).join(','))
  ].join('\r\n');

  res.setHeader('Content-Type','text/csv; charset=utf-8');
  res.setHeader('Content-Disposition','attachment; filename="expedientes_detalle.csv"');
  res.send(csv);
}

export async function expSerie(req, res) {
  const q = req.validated?.query || req.query || {};
  const data = await svc.expSerie(q);
  res.json({ data });
}

export async function indiciosPorExpediente(req, res) {
  const q = req.validated?.query || req.query || {};
  const out = await svc.indiciosPorExpediente(q);
  res.json(out);
}

export async function rechazosMotivos(req, res) {
  const q = req.validated?.query || req.query || {};
  const data = await svc.rechazosMotivos(q);
  res.json({ data });
}
