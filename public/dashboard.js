(() => {
  'use strict';

  const state = {
    socket: null,
    socketRetry: null,
    cameraStream: null,
    scanFrame: null,
    scannerActive: false,
    toastTimer: null,
    activity: [],
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const elements = {
    connectedBots: $('#connectedBots'),
    activeSessions: $('#activeSessions'),
    pendingPairings: $('#pendingPairings'),
    persistentSessions: $('#persistentSessions'),
    systemStatus: $('#systemStatus'),
    statusDot: $('#statusDot'),
    liveDot: $('#liveDot'),
    statusUpdatedAt: $('#statusUpdatedAt'),
    botState: $('#botState'),
    lastEvent: $('#lastEvent'),
    uptime: $('#uptime'),
    activityList: $('#activityList'),
    number: $('#number'),
    pairButton: $('#pairButton'),
    pairLoading: $('#pairLoading'),
    pairError: $('#pairError'),
    codeResult: $('#codeResult'),
    codeBox: $('#codeBox'),
    copyPairingCode: $('#copyPairingCode'),
    qrModal: $('#qrModal'),
    scannerFrame: $('#scannerFrame'),
    video: $('#scannerVideo'),
    canvas: $('#scannerCanvas'),
    startCamera: $('#startCamera'),
    stopCamera: $('#stopCamera'),
    fileInput: $('#qrFileInput'),
    scanResult: $('#scanResult'),
    scanResultValue: $('#scanResultValue'),
    copyScan: $('#copyScan'),
    closeScanner: $('#closeScanner'),
    toast: $('#toast'),
  };

  function formatUptime(seconds) {
    const total = Math.max(0, Number(seconds) || 0);
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours || days) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    return parts.join(' ');
  }

  function formatTime(timestamp) {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function showToast(message) {
    if (!elements.toast) return;
    elements.toast.textContent = message;
    elements.toast.classList.add('is-visible');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => elements.toast.classList.remove('is-visible'), 3600);
  }

  function addActivity(message, tone = '') {
    if (!elements.activityList) return;
    state.activity.unshift({ message, tone, time: new Date() });
    state.activity = state.activity.slice(0, 5);
    elements.activityList.innerHTML = state.activity.map((item) => `
      <li class="activity-item ${item.tone ? `is-${item.tone}` : ''}">
        <span class="activity-bullet" aria-hidden="true"></span>
        <span class="activity-copy">${escapeHtml(item.message)}</span>
        <time class="activity-time">${formatTime(item.time)}</time>
      </li>
    `).join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }[character]));
  }

  function setIndicator(element, status) {
    if (!element) return;
    element.classList.remove('is-warning', 'is-danger');
    if (status === 'DEGRADED' || status === 'CONNECTING' || status === 'RECONNECTING') {
      element.classList.add('is-warning');
    }
    if (status === 'OFFLINE') element.classList.add('is-danger');
  }

  function renderStatus(data, source = 'live') {
    if (!data) return;
    const status = String(data.status || 'CONNECTING').toUpperCase();
    if (elements.connectedBots) elements.connectedBots.textContent = String(data.connectedBots ?? 0);
    if (elements.activeSessions) elements.activeSessions.textContent = String(data.activeSessions ?? 0);
    if (elements.pendingPairings) elements.pendingPairings.textContent = String(data.pendingPairings ?? 0);
    if (elements.persistentSessions) elements.persistentSessions.textContent = String(data.persistentSessions ?? 0);
    if (elements.systemStatus) elements.systemStatus.textContent = status;
    if (elements.statusUpdatedAt) elements.statusUpdatedAt.textContent = `${source.toUpperCase()} · ${formatTime(data.timestamp || new Date())}`;
    if (elements.botState) elements.botState.textContent = String(data.botState || 'starting').replace('_', ' ');
    if (elements.lastEvent) elements.lastEvent.textContent = formatTime(data.lastEventAt);
    if (elements.uptime) elements.uptime.textContent = formatUptime(data.uptime);
    setIndicator(elements.statusDot, status);
    setIndicator(elements.liveDot, status);
  }

  async function fetchStatus() {
    try {
      const response = await fetch('/api/system-status', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Status endpoint returned ${response.status}`);
      renderStatus(await response.json(), 'poll');
    } catch (error) {
      setIndicator(elements.statusDot, 'DEGRADED');
      if (elements.systemStatus) elements.systemStatus.textContent = 'DEGRADED';
      if (elements.statusUpdatedAt) elements.statusUpdatedAt.textContent = 'RETRYING CONNECTION';
    }
  }

  function connectStatusSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}`;
    const socket = new WebSocket(url);
    state.socket = socket;

    socket.addEventListener('open', () => {
      clearTimeout(state.socketRetry);
      addActivity('Live system telemetry connected.', 'success');
      fetchStatus();
    });

    socket.addEventListener('message', (event) => {
      try {
        renderStatus(JSON.parse(event.data), 'live');
      } catch (error) {
        console.warn('Invalid status payload', error);
      }
    });

    socket.addEventListener('error', () => {
      setIndicator(elements.liveDot, 'DEGRADED');
    });

    socket.addEventListener('close', () => {
      if (elements.statusUpdatedAt) elements.statusUpdatedAt.textContent = 'RECONNECTING TELEMETRY';
      setIndicator(elements.liveDot, 'RECONNECTING');
      clearTimeout(state.socketRetry);
      state.socketRetry = setTimeout(connectStatusSocket, 3000);
    });
  }

  function setPairLoading(loading) {
    if (elements.pairButton) elements.pairButton.disabled = loading;
    if (elements.pairLoading) elements.pairLoading.classList.toggle('is-visible', loading);
  }

  function showPairError(message) {
    if (!elements.pairError) return;
    elements.pairError.textContent = message;
    elements.pairError.classList.toggle('is-visible', Boolean(message));
  }

  async function requestPairingCode() {
    const number = String(elements.number?.value || '').replace(/\D/g, '');
    showPairError('');
    if (elements.codeResult) elements.codeResult.classList.remove('is-visible');

    if (!/^\d{10,15}$/.test(number)) {
      showPairError('Enter a valid WhatsApp number with country code, using 10–15 digits.');
      elements.number?.focus();
      return;
    }

    setPairLoading(true);
    addActivity('Requesting a secure pairing code from WhatsApp.');

    try {
      const response = await fetch(`/code?number=${encodeURIComponent(number)}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.code) {
        throw new Error(data.error || 'WhatsApp did not return a pairing code.');
      }

      if (elements.codeBox) elements.codeBox.textContent = data.code;
      if (elements.codeResult) elements.codeResult.classList.add('is-visible');
      addActivity('Pairing code ready. Finish linking it in WhatsApp.', 'success');
      showToast('Pairing code is ready to use.');
      fetchStatus();
    } catch (error) {
      showPairError(error.message || 'Unable to generate a pairing code. Please try again.');
      addActivity('Pairing request failed. Try again when the service is online.', 'warning');
    } finally {
      setPairLoading(false);
    }
  }

  async function copyText(value, successMessage) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      showToast(successMessage);
    } catch (error) {
      const helper = document.createElement('textarea');
      helper.value = value;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      document.execCommand('copy');
      helper.remove();
      showToast(successMessage);
    }
  }

  function setScannerIdle() {
    elements.scannerFrame?.classList.add('is-idle');
    elements.scannerFrame?.classList.remove('is-scanning');
  }

  function setScanResult(value) {
    if (!elements.scanResult || !elements.scanResultValue) return;
    elements.scanResultValue.textContent = value;
    elements.scanResult.classList.add('is-visible');
    stopScanner();
    addActivity('QR payload decoded locally in the browser.', 'success');
    showToast('QR code scanned successfully.');
  }

  function scanVideoFrame() {
    if (!state.scannerActive || !elements.video || !elements.canvas) return;
    if (elements.video.readyState >= 2 && elements.video.videoWidth > 0) {
      const canvas = elements.canvas;
      canvas.width = elements.video.videoWidth;
      canvas.height = elements.video.videoHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(elements.video, 0, 0, canvas.width, canvas.height);
      const image = context.getImageData(0, 0, canvas.width, canvas.height);
      const result = window.jsQR?.(image.data, image.width, image.height, { inversionAttempts: 'attemptBoth' });
      if (result?.data) {
        setScanResult(result.data);
        return;
      }
    }
    state.scanFrame = requestAnimationFrame(scanVideoFrame);
  }

  async function startScanner() {
    if (!navigator.mediaDevices?.getUserMedia) {
      showToast('Camera access is unavailable here. Choose an image instead.');
      elements.fileInput?.click();
      return;
    }

    try {
      stopScanner();
      state.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      elements.video.srcObject = state.cameraStream;
      elements.video.setAttribute('playsinline', 'true');
      await elements.video.play();
      state.scannerActive = true;
      elements.scannerFrame?.classList.remove('is-idle');
      elements.scannerFrame?.classList.add('is-scanning');
      addActivity('Camera scanner active. Point it at a WhatsApp QR code.');
      scanVideoFrame();
    } catch (error) {
      showToast('Camera permission was not granted. Choose an image instead.');
      elements.fileInput?.click();
    }
  }

  function stopScanner() {
    state.scannerActive = false;
    if (state.scanFrame) cancelAnimationFrame(state.scanFrame);
    state.scanFrame = null;
    if (state.cameraStream) {
      state.cameraStream.getTracks().forEach((track) => track.stop());
      state.cameraStream = null;
    }
    if (elements.video) {
      elements.video.pause();
      elements.video.srcObject = null;
    }
    setScannerIdle();
  }

  function scanImage(file) {
    if (!file || !elements.canvas) return;
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const canvas = elements.canvas;
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      const result = window.jsQR?.(pixels.data, pixels.width, pixels.height, { inversionAttempts: 'attemptBoth' });
      URL.revokeObjectURL(objectUrl);
      if (result?.data) setScanResult(result.data);
      else showToast('No QR code was found in that image.');
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      showToast('That image could not be read.');
    };
    image.src = objectUrl;
  }

  function openScanner() {
    if (!elements.qrModal) return;
    elements.qrModal.hidden = false;
    elements.scanResult?.classList.remove('is-visible');
    setScannerIdle();
    startScanner();
  }

  function closeScanner() {
    stopScanner();
    if (elements.qrModal) elements.qrModal.hidden = true;
  }

  function switchMethod(method) {
    $$('.method-tab').forEach((tab) => tab.classList.toggle('is-active', tab.dataset.method === method));
    $$('[data-method-panel]').forEach((panel) => panel.classList.toggle('is-active', panel.dataset.methodPanel === method));
  }

  $$('.method-tab').forEach((tab) => tab.addEventListener('click', () => switchMethod(tab.dataset.method)));
  $('#pairButton')?.addEventListener('click', requestPairingCode);
  $('#number')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') requestPairingCode();
  });
  $('#copyPairingCode')?.addEventListener('click', () => copyText(elements.codeBox?.textContent, 'Pairing code copied.'));
  $('#openScanner')?.addEventListener('click', openScanner);
  $('#heroScanner')?.addEventListener('click', openScanner);
  $('#closeScanner')?.addEventListener('click', closeScanner);
  $('#startCamera')?.addEventListener('click', startScanner);
  $('#stopCamera')?.addEventListener('click', stopScanner);
  $('#copyScan')?.addEventListener('click', () => copyText(elements.scanResultValue?.textContent, 'Scanned QR payload copied.'));
  $('#qrFileInput')?.addEventListener('change', (event) => {
    scanImage(event.target.files?.[0]);
    event.target.value = '';
  });
  $('#refreshStatus')?.addEventListener('click', () => {
    fetchStatus();
    showToast('System status refreshed.');
  });
  elements.qrModal?.addEventListener('click', (event) => {
    if (event.target === elements.qrModal) closeScanner();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && elements.qrModal && !elements.qrModal.hidden) closeScanner();
  });
  window.addEventListener('beforeunload', stopScanner);

  addActivity('Dashboard interface initialized.', 'success');
  fetchStatus();
  connectStatusSocket();
})();
