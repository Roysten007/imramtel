/**
 * IMRAN TEL // CUT-BOT AI ASSISTANT
 * Real LLM Assistant powered by NVIDIA NIM & Clean Conversational Interface
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const btnAiToggle = document.getElementById('btnAiToggle');
  const btnAiClose = document.getElementById('btnAiClose');
  const aiChatWindow = document.getElementById('aiChatWindow');
  const aiChatBody = document.getElementById('aiChatBody');
  const aiChatForm = document.getElementById('aiChatForm');
  const aiUserInput = document.getElementById('aiUserInput');

  if (!btnAiToggle || !aiChatWindow || !aiChatBody) return;

  function playClick() {
    if (window.sfx && window.sfx.clickCut) window.sfx.clickCut();
  }

  // LLM Conversation History
  const conversationHistory = [];

  // Speech Bubble Tip & Suggestion Chips Handlers
  const aiBubbleTip = document.getElementById('aiBubbleTip');
  const btnTipClose = document.getElementById('btnTipClose');
  const quickChips = document.querySelectorAll('.ai-chip-pill');

  function hideBubbleTip() {
    if (aiBubbleTip) {
      aiBubbleTip.style.opacity = '0';
      aiBubbleTip.style.pointerEvents = 'none';
      setTimeout(() => {
        if (aiBubbleTip) aiBubbleTip.style.display = 'none';
      }, 300);
    }
  }

  if (btnTipClose) {
    btnTipClose.addEventListener('click', (e) => {
      e.stopPropagation();
      playClick();
      hideBubbleTip();
    });
  }

  if (aiBubbleTip) {
    aiBubbleTip.addEventListener('click', () => {
      playClick();
      hideBubbleTip();
      aiChatWindow.classList.remove('hidden');
      if (aiChatBody.children.length === 0) startConversation();
      setTimeout(() => aiUserInput && aiUserInput.focus(), 300);
    });
  }

  // Quick Chips Inside Chat Window
  quickChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      playClick();
      const prompt = chip.dataset.prompt || chip.textContent.trim();
      if (prompt) {
        askRealAi(prompt);
      }
    });
  });

  // Toggle Chat Window
  btnAiToggle.addEventListener('click', () => {
    playClick();
    hideBalloon();
    const isHidden = aiChatWindow.classList.contains('hidden');
    if (isHidden) {
      aiChatWindow.classList.remove('hidden');
      if (aiChatBody.children.length === 0) {
        startConversation();
      }
      setTimeout(() => aiUserInput && aiUserInput.focus(), 300);
    } else {
      aiChatWindow.classList.add('hidden');
    }
  });

  if (btnAiClose) {
    btnAiClose.addEventListener('click', () => {
      playClick();
      aiChatWindow.classList.add('hidden');
    });
  }

  // Helper: Append Message
  function appendMessage(sender, text, isHtml = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';

    if (isHtml) {
      bubble.innerHTML = text;
    } else {
      bubble.textContent = text;
    }

    const time = document.createElement('span');
    time.className = 'msg-time font-mono';
    const now = new Date();
    time.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    msgDiv.appendChild(bubble);
    msgDiv.appendChild(time);
    aiChatBody.appendChild(msgDiv);

    aiChatBody.scrollTop = aiChatBody.scrollHeight;
  }

  // Typing Indicator
  let typingIndicatorEl = null;

  function showTypingIndicator() {
    if (typingIndicatorEl) return;
    typingIndicatorEl = document.createElement('div');
    typingIndicatorEl.className = 'chat-msg bot typing-indicator';
    typingIndicatorEl.innerHTML = `
      <div class="msg-bubble" style="display:inline-flex; align-items:center; gap:6px; padding:10px 14px;">
        <span class="ai-typing-dot"></span>
        <span class="ai-typing-dot"></span>
        <span class="ai-typing-dot"></span>
        <span style="font-size:11px; color:#888; margin-left:4px;">Imran's AI réfléchit...</span>
      </div>
    `;
    aiChatBody.appendChild(typingIndicatorEl);
    aiChatBody.scrollTop = aiChatBody.scrollHeight;
  }

  function hideTypingIndicator() {
    if (typingIndicatorEl) {
      typingIndicatorEl.remove();
      typingIndicatorEl = null;
    }
  }

  // Start Clean Conversational Chat (no aggressive option blocks)
  function startConversation() {
    conversationHistory.length = 0;
    aiChatBody.innerHTML = '';
    const welcome = "Bonjour ! Je suis **Cut-Bot**, l'assistant IA officiel d'**Imran Tel** (Monteur Vidéo YouTube & Rétention). 🎬\n\nPosez-moi vos questions sur mes montages, mes délais, mes tarifs ou parlez-moi de votre chaîne !";
    appendMessage('bot', formatMarkdown(welcome), true);
  }

  // Real AI Query via NVIDIA Backend
  async function askRealAi(userPrompt) {
    appendMessage('user', userPrompt);
    showTypingIndicator();

    conversationHistory.push({ role: 'user', content: userPrompt });

    const apiUrl = (window.location.protocol === 'http:' || window.location.protocol === 'https:')
      ? '/api/chat'
      : 'http://localhost:5173/api/chat';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: conversationHistory
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);
      hideTypingIndicator();

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.reply || "Je suis à votre entière disposition pour cadrer votre projet avec Imran Tel.";
      
      conversationHistory.push({ role: 'assistant', content: botReply });
      appendMessage('bot', formatMarkdown(botReply), true);
    } catch (err) {
      clearTimeout(timeout);
      hideTypingIndicator();
      console.warn('Real AI fallback triggered:', err);
      fallbackOfflineAnswer(userPrompt);
    }
  }

  // Fast intelligent fallback if network is delayed
  function fallbackOfflineAnswer(text) {
    const lower = text.toLowerCase();
    let reply = "";

    if (lower.includes('qui') || lower.includes('imran') || lower.includes('imram')) {
      reply = "🎬 **Imran Tel** est un **monteur vidéo professionnel** spécialisé dans YouTube, le storytelling visuel et la rétention d'audience.\n\n• **Gros créateurs** : Habitué aux standards d'exigence des créateurs majeurs du YouTube game français.\n• **Orthographe & Bilingue** : Sous-titres zéro faute en français et anglais courant.\n• **Structure légale** : Micro-Entreprise déclarée, facturation officielle avec factures déductibles en charges d'entreprise.\n• **Contact direct** : WhatsApp **06 15 25 47 92** ou **imrantel.pro@gmail.com**.";
    } else if (lower.includes('tarif') || lower.includes('prix') || lower.includes('combien')) {
      reply = "💡 **Tarifs indicatifs d'Imran Tel :**\n- **Shorts / TikTok / Reels (9:16)** : à partir de 150 € HT\n- **YouTube Haute Rétention (8-15 min)** : à partir de 450 € HT\n- **Spot Marque / Publicité** : à partir de 950 € HT\n\nChaque formule comprend le dérushage méticuleux, sound design immersif, motion graphics et étalonnage couleur DaVinci Resolve Studio 19.";
    } else if (lower.includes('delai') || lower.includes('délai') || lower.includes('temps') || lower.includes('deadline')) {
      reply = "⚡ **Délais de livraison :**\n- Shorts / Reels : **24 à 48 heures**\n- Vidéo YouTube longue : **3 à 5 jours ouvrés**\n- Respect scrupuleux des délais garanti ! Option Sprint Express disponible pour urgences éditoriales.";
    } else if (lower.includes('contact') || lower.includes('whatsapp') || lower.includes('joindre')) {
      reply = "📞 Vous pouvez échanger directement avec Imran Tel sur WhatsApp au **06 15 25 47 92** ([wa.me/33615254792](https://wa.me/33615254792)) ou par email à **imrantel.pro@gmail.com**.";
    } else {
      reply = "Je suis l'assistant officiel d'Imran Tel. Je peux vous renseigner sur les formats, les tarifs ou cadrer votre prochain montage vidéo. Vous pouvez également échanger directement avec Imran sur WhatsApp au **06 15 25 47 92**.";
    }

    conversationHistory.push({ role: 'assistant', content: reply });
    appendMessage('bot', formatMarkdown(reply), true);
  }

  // Handle Form Input submission
  aiChatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = aiUserInput.value.trim();
    if (!val) return;
    aiUserInput.value = '';

    if (val.toLowerCase() === 'recommencer' || val.toLowerCase() === 'reset') {
      startConversation();
      return;
    }

    askRealAi(val);
  });

  // Markdown Formatter Utility
  function formatMarkdown(str) {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<div style="margin-left:8px; margin-bottom:3px;">• $1</div>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

});
