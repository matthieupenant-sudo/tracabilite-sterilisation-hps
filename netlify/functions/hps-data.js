const { getStore } = require('@netlify/blobs');

const STORE_NAME = 'tracabilite-lavage-hps';
const KEY = 'data';

function getBlobStore() {
  if (process.env.SITE_ID && process.env.BLOBS_TOKEN) {
    return getStore({ name: STORE_NAME, siteID: process.env.SITE_ID, token: process.env.BLOBS_TOKEN });
  }
  return getStore(STORE_NAME);
}

exports.handler = async function (event) {
  const store = getBlobStore();

  if (event.httpMethod === 'GET') {
    const data = (await store.get(KEY, { type: 'json' })) || { kits: [], equipements: [] };
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  }

  if (event.httpMethod === 'POST') {
    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch (e) {
      return { statusCode: 400, body: 'JSON invalide' };
    }
    const data = {
      kits: Array.isArray(payload.kits) ? payload.kits : [],
      equipements: Array.isArray(payload.equipements) ? payload.equipements : []
    };
    await store.setJSON(KEY, data);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true })
    };
  }

  return { statusCode: 405, body: 'Méthode non autorisée' };
};
