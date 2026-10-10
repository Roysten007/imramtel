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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée. Utilisez POST.' });
  }

  try {
    const userMessages = req.body?.messages || [];
    if (!Array.isArray(userMessages) || userMessages.length === 0) {
      return res.status(400).json({ error: 'Format invalide : le tableau "messages" est requis.' });
    }

    const apiKey = process.env.NVIDIA_API_KEY || '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';
    const models = ['meta/llama-3.2-11b-vision-instruct', 'openai/gpt-oss-20b'];
    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...userMessages
    ];

    let result = null;
    for (const model of models) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      try {
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
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

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            result = { content, model };
            break;
          }
        }
      } catch (err) {
        clearTimeout(timeout);
      }
    }

    if (!result) {
      const lastMsg = userMessages[userMessages.length - 1]?.content?.toLowerCase() || '';
      if (lastMsg.includes('qui') || lastMsg.includes('imran') || lastMsg.includes('imram') || lastMsg.includes('tarif') || lastMsg.includes('prix')) {
        result = {
          content: "Imran Tel est un monteur vidéo professionnel spécialisé dans YouTube, le storytelling visuel et la rétention d'audience d'élite. Il travaille avec de gros créateurs du YouTube Game français, réalise des montages avec sous-titres zéro faute, sound design immersif et étalonnage DaVinci Resolve Studio 19 (micro-entreprise officielle avec factures déductibles). Vous pouvez le joindre directement au 06 15 25 47 92 ou imrantel.pro@gmail.com.",
          model: 'fallback-local'
        };
      } else {
        result = {
          content: "Bonjour ! Imran Tel est disponible pour monter vos formats YouTube ou Shorts viraux. N'hésitez pas à poser votre question ou à le contacter directement par WhatsApp au 06 15 25 47 92.",
          model: 'fallback-local'
        };
      }
    }

    return res.status(200).json({
      reply: result.content,
      model: result.model
    });
  } catch (error) {
    console.error('[API /api/chat error]:', error.message);
    return res.status(500).json({
      error: error.message || 'Erreur interne.',
      fallback: true
    });
  }
};
