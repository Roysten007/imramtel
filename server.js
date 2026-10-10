const http = require('http');
const fs = require('fs');
const path = require('path');

// --- Load .env Configuration ---
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8');
    raw.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        env[key] = val;
      }
    });
  }
  return env;
}

const env = loadEnv();
const PORT = parseInt(env.PORT || '5173', 10);
const NVIDIA_API_KEY = env.NVIDIA_API_KEY || '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';
const BASE_DIR = __dirname;

const SYSTEM_PROMPT = `Tu es Cut-Bot, l'assistant IA officiel d'Imran Tel, monteur vidéo professionnel spécialisé dans YouTube, le storytelling visuel et la rétention d'audience.

Informations officielles sur Imran Tel :
- Nom : Imran Tel
- Métier : Monteur Vidéo Professionnel (YouTube, Shorts/Reels, Publicités de marque, Documentaires)
- Téléphone & WhatsApp : 06 15 25 47 92 (+33 6 15 25 47 92)
- Lien WhatsApp direct : https://wa.me/33615254792
- Email pro : imrantel.pro@gmail.com
- Instagram : @imran.tel.ve (https://www.instagram.com/imran.tel.ve/?next=%2F)
- Statut : Micro-Entreprise déclarée en France, facturation officielle avec factures déductibles en charges d'entreprise.

Points forts & Avantages compétitifs d'Imran Tel :
1. Gros créateurs du YouTube Game : Habitué aux standards d'exigence des créateurs majeurs et aux codes d'engagement actuels.
2. Sous-titres zéro faute & Bilingue FR/EN : Orthographe irréprochable et maîtrise parfaite de l'anglais pour formats internationaux.
3. Respect scrupuleux des deadlines : Ponctualité stricte, jamais de retard de livraison.
4. Micro-Entreprise & Facturation Pro : Factures légales et conformes, déclarations en règle.
5. 10 étapes de post-production complètes : Traitement audio, Dérushage méticuleux, Dynamisme & Pacing, Effets visuels (VFX), Animations, Illustrations, Transitions fluides, Musiques licenciées, Sound Design immersif, Étalonnage couleur DaVinci Resolve.
6. Outils : DaVinci Resolve Studio 19, Adobe After Effects, Premiere Pro, Fairlight, Frame.io pour révisions avec timecode précis.

Grille indicative de forfaits :
- Formule Shorts / TikTok / Reels viraux : à partir de 150 € HT par vidéo (packs dégressifs disponibles).
- Formule YouTube Haute Rétention (8-15 min) : à partir de 450 € HT par vidéo.
- Formule Commerciale / Spot Marque : à partir de 950 € HT.
- Délais : 24h-48h pour les formats courts, 3-5 jours pour les formats longs (option Sprint Express disponible).

Ton et comportement :
- Sois direct, professionnel, convivial et très expert.
- Réponds toujours en français fluide et dynamique.
- Aide l'utilisateur à structurer son projet, évaluer son besoin (durée, rushes, rythme, plateforme) et donne-lui des conseils de monteur expérimenté.
- Dès que le projet se précise, propose de formaliser par un devis ou d'échanger directement avec Imran par WhatsApp (06 15 25 47 92) ou email.
- Utilise une mise en page claire avec des listes à puces si nécessaire, sans être trop verbeux.`;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

async function callNvidiaLLM(messages) {
  const models = ['meta/llama-3.2-11b-vision-instruct', 'openai/gpt-oss-20b'];
  
  const formattedMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages
  ];

  for (const model of models) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${NVIDIA_API_KEY}`
        },
        body: JSON.stringify({
          model: model,
          messages: formattedMessages,
          temperature: 0.5,
          max_tokens: 350
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const content = data.choices && data.choices[0] && data.choices[0].message
          ? data.choices[0].message.content
          : null;
        if (content) {
          return { content, model };
        }
      } else {
        const errText = await res.text();
        console.warn(`[NVIDIA API] Model ${model} returned ${res.status}: ${errText.substring(0, 120)}`);
      }
    } catch (err) {
      clearTimeout(timeout);
      console.warn(`[NVIDIA API] Error connecting to ${model}: ${err.message}`);
    }
  }

  // Instant local intelligent fallback if internet or NVIDIA has a transient hiccup
  const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
  if (lastUserMsg.includes('qui') || lastUserMsg.includes('imran') || lastUserMsg.includes('imram')) {
    return {
      content: "Imran Tel est un monteur vidéo professionnel spécialisé dans YouTube, le storytelling visuel et la rétention d'audience d'élite. Il travaille avec de gros créateurs du YouTube Game français, réalise des montages avec sous-titres zéro faute, sound design immersif et étalonnage DaVinci Resolve Studio 19 (micro-entreprise officielle avec factures déductibles). Vous pouvez le joindre directement au 06 15 25 47 92 ou imrantel.pro@gmail.com.",
      model: 'fallback-local'
    };
  }

  throw new Error("Impossible de joindre le modèle IA NVIDIA pour le moment.");
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let parsedUrl = req.url.split('?')[0];

  // --- API Endpoint: POST /api/chat ---
  if (req.method === 'POST' && parsedUrl === '/api/chat') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) req.destroy(); // 1MB limit
    });

    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const userMessages = parsed.messages || [];

        if (!Array.isArray(userMessages) || userMessages.length === 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Format invalide : le tableau "messages" est requis.' }));
          return;
        }

        const result = await callNvidiaLLM(userMessages);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          reply: result.content,
          model: result.model
        }));
      } catch (err) {
        console.error('[API /api/chat error]:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: err.message || 'Erreur interne du serveur lors de la génération.',
          fallback: true
        }));
      }
    });
    return;
  }

  // --- Static Files Serving ---
  if (parsedUrl === '/') parsedUrl = '/index.html';

  const safePath = path.normalize(parsedUrl).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(BASE_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const isMedia = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.woff2', '.mp4'].includes(ext);

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': isMedia ? 'public, max-age=86400' : 'no-cache, no-store, must-revalidate'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`[Imran Tel Server] running on http://localhost:${PORT}/ with real NVIDIA LLM engine`);
});
