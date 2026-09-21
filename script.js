(() => {
  'use strict';

  const toast = document.getElementById('toast');
  const shareButton = document.getElementById('sharePage');
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  // Profil fotoğrafı yoksa/bozuksa baş harf avatarı göster.
  document.querySelectorAll('[data-avatar]').forEach((avatar) => {
    const img = avatar.querySelector('img');
    if (!img) {
      avatar.classList.add('is-fallback');
      return;
    }

    const useFallback = () => avatar.classList.add('is-fallback');
    img.addEventListener('error', useFallback, { once: true });

    if (img.complete && img.naturalWidth === 0) {
      useFallback();
    }
  });

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) throw new Error('copy_failed');
  }

  shareButton?.addEventListener('click', async () => {
    const shareData = {
      title: document.title,
      text: 'NeuroOncoTrack-AI dijital kartvizit',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await copyText(window.location.href);
      showToast('Sayfa bağlantısı kopyalandı.');
    } catch (error) {
      if (error?.name !== 'AbortError') {
        showToast('Bağlantı kopyalanamadı. Adres çubuğundan paylaşabilirsiniz.');
      }
    }
  });

  function escapeVCard(value = '') {
    return String(value)
      .replace(/\\/g, '\\\\')
      .replace(/\r?\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');
  }

  function splitName(fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return { first: parts[0], last: '' };
    return {
      first: parts.slice(0, -1).join(' '),
      last: parts.at(-1)
    };
  }

  function slugify(text) {
    const charMap = {
      'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'İ': 'i',
      'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u'
    };

    return text
      .replace(/[çÇğĞıİöÖşŞüÜ]/g, (char) => charMap[char])
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  document.querySelectorAll('.save-contact').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.member-card');
      if (!card) return;

      const name = card.dataset.name || '';
      const phone = card.dataset.phone || '';
      const email = card.dataset.email || '';
      const linkedin = card.dataset.linkedin || '';
      const { first, last } = splitName(name);

      const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escapeVCard(last)};${escapeVCard(first)};;;`,
        `FN:${escapeVCard(name)}`,
        `ORG:${escapeVCard('NeuroOncoTrack-AI')}`,
        `TITLE:${escapeVCard('Proje Ekibi')}`,
        phone ? `TEL;TYPE=CELL:${phone}` : '',
        email ? `EMAIL;TYPE=INTERNET:${escapeVCard(email)}` : '',
        linkedin ? `URL:${linkedin}` : '',
        `NOTE:${escapeVCard('TEKNOFEST finalisti NeuroOncoTrack-AI proje ekibi')}`,
        'END:VCARD'
      ].filter(Boolean).join('\r\n');

      const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${slugify(name) || 'contact'}.vcf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);

      showToast(`${name} için kişi kartı indirildi.`);
    });
  });
})();
