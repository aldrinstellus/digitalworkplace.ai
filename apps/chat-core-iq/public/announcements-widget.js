/**
 * Doral Announcements Banner Widget
 *
 * Displays active announcements with elegant animations and smooth transitions.
 * Supports auto-rotation with configurable settings from admin portal.
 *
 * Usage: Add to static HTML:
 *   <div id="doral-announcements-banner"></div>
 *   <script src="/announcements-widget.js"></script>
 */
(function() {
  'use strict';

  // API Base URL - for cross-origin requests when widget is embedded on different port
  const API_BASE = window.CHAT_WIDGET_API_BASE || 'http://localhost:3002/dcq';

  const CONFIG = {
    apiUrl: API_BASE + '/api/announcements',
    settingsUrl: API_BASE + '/api/banner-settings',
    containerId: 'doral-announcements-banner',
    storageKey: 'doral-dismissed-announcements',
    typeColors: {
      urgent: {
        bg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        border: '#dc2626',
        text: '#991b1b',
        iconBg: '#dc2626',
        icon: '⚠️',
        glow: 'rgba(220, 38, 38, 0.15)'
      },
      warning: {
        bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        border: '#f59e0b',
        text: '#92400e',
        iconBg: '#f59e0b',
        icon: '⚡',
        glow: 'rgba(245, 158, 11, 0.15)'
      },
      info: {
        bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        border: '#3b82f6',
        text: '#1e40af',
        iconBg: '#3b82f6',
        icon: 'ℹ️',
        glow: 'rgba(59, 130, 246, 0.15)'
      }
    },
    defaults: {
      rotationEnabled: true,
      rotationInterval: 8000,
      pauseOnHover: true,
      showNavigation: true,
      showDismiss: true
    }
  };

  let state = {
    announcements: [],
    currentIndex: 0,
    settings: { ...CONFIG.defaults },
    rotationTimer: null,
    progressTimer: null,
    isPaused: false,
    progress: 0,
    isTransitioning: false
  };

  // Inject CSS styles for animations
  function injectStyles() {
    if (document.getElementById('doral-announcements-styles')) return;

    const style = document.createElement('style');
    style.id = 'doral-announcements-styles';
    style.textContent = `
      @keyframes doralSlideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes doralSlideOut {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(10px);
        }
      }

      @keyframes doralFadeSlideLeft {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes doralFadeSlideRight {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes doralPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      @keyframes doralProgress {
        from { width: 0%; }
        to { width: 100%; }
      }

      @keyframes doralShimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      .doral-banner-enter {
        animation: doralSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .doral-content-enter-left {
        animation: doralFadeSlideLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .doral-content-enter-right {
        animation: doralFadeSlideRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .doral-announcement-banner {
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .doral-announcement-banner:hover {
        transform: translateY(-1px);
      }

      .doral-nav-btn {
        transition: all 0.2s ease;
        opacity: 0.5;
      }

      .doral-nav-btn:hover {
        opacity: 1;
        transform: scale(1.15);
      }

      .doral-nav-btn:active {
        transform: scale(0.95);
      }

      .doral-dot {
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .doral-dot:hover {
        transform: scale(1.3);
      }

      .doral-dot.active {
        transform: scale(1.2);
      }

      .doral-dismiss-btn {
        transition: all 0.2s ease;
        opacity: 0.4;
      }

      .doral-dismiss-btn:hover {
        opacity: 1;
        transform: rotate(90deg) scale(1.1);
      }

      .doral-icon-container {
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .doral-announcement-banner:hover .doral-icon-container {
        transform: scale(1.1) rotate(-3deg);
      }

      .doral-progress-bar {
        transition: opacity 0.3s ease;
      }

      .doral-content-wrapper {
        transition: opacity 0.3s ease;
      }
    `;
    document.head.appendChild(style);
  }

  function getDismissed() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]');
    } catch (e) {
      return [];
    }
  }

  function dismiss(id) {
    const dismissed = getDismissed();
    if (!dismissed.includes(id)) {
      dismissed.push(id);
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(dismissed));
    }
  }

  async function fetchSettings() {
    try {
      const res = await fetch(CONFIG.settingsUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        return { ...CONFIG.defaults, ...data };
      }
    } catch (err) {
      console.warn('[DoralAnnouncements] Could not fetch settings, using defaults');
    }
    return CONFIG.defaults;
  }

  async function fetchAnnouncements() {
    try {
      const res = await fetch(CONFIG.apiUrl + '?active=true', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!res.ok) throw new Error('Failed to fetch announcements');

      const data = await res.json();
      return data.announcements || [];
    } catch (err) {
      console.error('[DoralAnnouncements] Fetch error:', err);
      return [];
    }
  }

  function sortByPriority(announcements) {
    const priority = { urgent: 0, warning: 1, info: 2 };
    return announcements.sort((a, b) => {
      const aPri = priority[a.type] !== undefined ? priority[a.type] : 2;
      const bPri = priority[b.type] !== undefined ? priority[b.type] : 2;
      return aPri - bPri;
    });
  }

  function animateTransition(direction, callback) {
    if (state.isTransitioning) return;
    state.isTransitioning = true;

    const container = document.getElementById(CONFIG.containerId);
    const contentWrapper = container?.querySelector('.doral-content-wrapper');

    if (contentWrapper) {
      contentWrapper.style.opacity = '0';
      contentWrapper.style.transform = direction === 'next' ? 'translateX(-20px)' : 'translateX(20px)';
    }

    setTimeout(() => {
      callback();

      const newContentWrapper = container?.querySelector('.doral-content-wrapper');
      if (newContentWrapper) {
        newContentWrapper.style.opacity = '0';
        newContentWrapper.style.transform = direction === 'next' ? 'translateX(20px)' : 'translateX(-20px)';

        requestAnimationFrame(() => {
          newContentWrapper.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
          newContentWrapper.style.opacity = '1';
          newContentWrapper.style.transform = 'translateX(0)';
        });
      }

      setTimeout(() => {
        state.isTransitioning = false;
      }, 400);
    }, 200);
  }

  function goToAnnouncement(index, animate = true) {
    const dismissed = getDismissed();
    const visible = state.announcements.filter(a => !dismissed.includes(a.id));

    if (index >= 0 && index < visible.length && index !== state.currentIndex) {
      const direction = index > state.currentIndex ? 'next' : 'prev';

      if (animate) {
        animateTransition(direction, () => {
          state.currentIndex = index;
          render(false);
        });
      } else {
        state.currentIndex = index;
        render(false);
      }
      resetRotationTimer();
    }
  }

  function nextAnnouncement(animate = true) {
    const dismissed = getDismissed();
    const visible = state.announcements.filter(a => !dismissed.includes(a.id));

    if (visible.length > 1) {
      const nextIndex = (state.currentIndex + 1) % visible.length;

      if (animate) {
        animateTransition('next', () => {
          state.currentIndex = nextIndex;
          render(false);
        });
      } else {
        state.currentIndex = nextIndex;
        render(false);
      }
    }
  }

  function prevAnnouncement(animate = true) {
    const dismissed = getDismissed();
    const visible = state.announcements.filter(a => !dismissed.includes(a.id));

    if (visible.length > 1) {
      const prevIndex = (state.currentIndex - 1 + visible.length) % visible.length;

      if (animate) {
        animateTransition('prev', () => {
          state.currentIndex = prevIndex;
          render(false);
        });
      } else {
        state.currentIndex = prevIndex;
        render(false);
      }
    }
  }

  function startProgressTimer() {
    stopProgressTimer();
    state.progress = 0;

    const interval = 50; // Update every 50ms for smooth animation
    const steps = state.settings.rotationInterval / interval;
    const increment = 100 / steps;

    state.progressTimer = setInterval(() => {
      if (!state.isPaused) {
        state.progress += increment;
        updateProgressBar();

        if (state.progress >= 100) {
          state.progress = 0;
          nextAnnouncement();
        }
      }
    }, interval);
  }

  function stopProgressTimer() {
    if (state.progressTimer) {
      clearInterval(state.progressTimer);
      state.progressTimer = null;
    }
  }

  function updateProgressBar() {
    const progressBar = document.querySelector('.doral-progress-fill');
    if (progressBar) {
      progressBar.style.width = state.progress + '%';
    }
  }

  function startRotationTimer() {
    if (state.settings.rotationEnabled && state.announcements.length > 1) {
      startProgressTimer();
    }
  }

  function stopRotationTimer() {
    stopProgressTimer();
    if (state.rotationTimer) {
      clearInterval(state.rotationTimer);
      state.rotationTimer = null;
    }
  }

  function resetRotationTimer() {
    state.progress = 0;
    if (state.settings.rotationEnabled) {
      startRotationTimer();
    }
  }

  function render(animate = true) {
    const container = document.getElementById(CONFIG.containerId);
    if (!container) {
      console.warn('[DoralAnnouncements] Container not found:', CONFIG.containerId);
      return;
    }

    const dismissed = getDismissed();
    const visible = sortByPriority(
      state.announcements.filter(a => !dismissed.includes(a.id))
    );

    if (visible.length === 0) {
      container.innerHTML = '';
      container.style.display = 'none';
      stopRotationTimer();
      return;
    }

    if (state.currentIndex >= visible.length) {
      state.currentIndex = 0;
    }

    const current = visible[state.currentIndex];
    const colors = CONFIG.typeColors[current.type] || CONFIG.typeColors.info;
    const showNav = state.settings.showNavigation && visible.length > 1;
    const showProgress = state.settings.rotationEnabled && visible.length > 1;

    container.style.display = 'block';

    const bannerHTML = `
      <div class="doral-announcement-banner ${animate ? 'doral-banner-enter' : ''}" style="
        background: ${colors.bg};
        border-left: 5px solid ${colors.border};
        color: ${colors.text};
        padding: 0;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        box-shadow: 0 4px 15px -3px ${colors.glow}, 0 2px 6px -2px rgba(0,0,0,0.05);
        position: relative;
        z-index: 1000;
        border-radius: 0 8px 8px 0;
        overflow: hidden;
      ">
        ${showProgress ? `
          <div class="doral-progress-bar" style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: rgba(0,0,0,0.08);
            border-radius: 0 8px 0 0;
            overflow: hidden;
          ">
            <div class="doral-progress-fill" style="
              height: 100%;
              width: ${state.progress}%;
              background: ${colors.border};
              transition: width 0.05s linear;
              border-radius: 0 2px 2px 0;
            "></div>
          </div>
        ` : ''}

        <div style="display: flex; align-items: center; padding: 14px 20px; ${showProgress ? 'padding-top: 17px;' : ''}">
          ${showNav ? `
            <button class="doral-nav-btn" onclick="window.doralPrevAnnouncement()" style="
              background: none;
              border: none;
              width: 32px;
              height: 32px;
              cursor: pointer;
              color: ${colors.text};
              margin-right: 12px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              font-weight: 600;
            " aria-label="Previous">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          ` : ''}

          <div class="doral-content-wrapper" style="display: flex; align-items: flex-start; gap: 14px; flex: 1; min-width: 0;">
            <div class="doral-icon-container" style="
              width: 42px;
              height: 42px;
              border-radius: 12px;
              background: ${colors.iconBg};
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              box-shadow: 0 4px 12px -2px ${colors.glow};
            ">
              <span style="font-size: 20px; line-height: 1; filter: brightness(0) invert(1);">${colors.icon}</span>
            </div>
            <div style="flex: 1; min-width: 0;">
              <strong style="
                font-size: 15px;
                font-weight: 600;
                display: block;
                margin-bottom: 4px;
                letter-spacing: -0.01em;
              ">${escapeHtml(current.title)}</strong>
              <p style="
                margin: 0;
                font-size: 13px;
                opacity: 0.85;
                line-height: 1.5;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              ">${escapeHtml(current.content)}</p>
            </div>
          </div>

          ${showNav ? `
            <div style="display: flex; align-items: center; gap: 6px; margin: 0 16px;">
              ${visible.map((_, i) => `
                <button class="doral-dot ${i === state.currentIndex ? 'active' : ''}" onclick="window.doralGoToAnnouncement(${i})" style="
                  width: ${i === state.currentIndex ? '24px' : '8px'};
                  height: 8px;
                  border-radius: 4px;
                  border: none;
                  background: ${colors.border};
                  opacity: ${i === state.currentIndex ? '1' : '0.3'};
                  cursor: pointer;
                  padding: 0;
                " aria-label="Go to announcement ${i + 1}"></button>
              `).join('')}
            </div>
          ` : ''}

          ${showNav ? `
            <button class="doral-nav-btn" onclick="window.doralNextAnnouncement()" style="
              background: none;
              border: none;
              width: 32px;
              height: 32px;
              cursor: pointer;
              color: ${colors.text};
              margin-right: 8px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              font-weight: 600;
            " aria-label="Next">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          ` : ''}

          ${state.settings.showDismiss ? `
            <button class="doral-dismiss-btn" onclick="window.doralDismissAnnouncement('${current.id}')" style="
              background: none;
              border: none;
              width: 28px;
              height: 28px;
              cursor: pointer;
              color: ${colors.text};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            " aria-label="Dismiss" title="Dismiss this announcement">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          ` : ''}
        </div>
      </div>
    `;

    container.innerHTML = bannerHTML;

    // Add hover pause functionality
    if (state.settings.pauseOnHover) {
      const banner = container.querySelector('.doral-announcement-banner');
      if (banner) {
        banner.addEventListener('mouseenter', () => {
          state.isPaused = true;
          const progressBar = container.querySelector('.doral-progress-bar');
          if (progressBar) progressBar.style.opacity = '0.5';
        });
        banner.addEventListener('mouseleave', () => {
          state.isPaused = false;
          const progressBar = container.querySelector('.doral-progress-bar');
          if (progressBar) progressBar.style.opacity = '1';
        });
      }
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Global functions
  window.doralDismissAnnouncement = function(id) {
    const container = document.getElementById(CONFIG.containerId);
    const banner = container?.querySelector('.doral-announcement-banner');

    if (banner) {
      banner.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(-10px) scale(0.98)';
    }

    setTimeout(() => {
      dismiss(id);
      state.currentIndex = 0;
      state.progress = 0;
      fetchAnnouncements().then(anns => {
        state.announcements = anns;
        render();
        startRotationTimer();
      });
    }, 300);
  };

  window.doralNextAnnouncement = function() {
    nextAnnouncement();
    resetRotationTimer();
  };

  window.doralPrevAnnouncement = function() {
    prevAnnouncement();
    resetRotationTimer();
  };

  window.doralGoToAnnouncement = function(index) {
    goToAnnouncement(index);
  };

  async function init() {
    injectStyles();

    const [settings, announcements] = await Promise.all([
      fetchSettings(),
      fetchAnnouncements()
    ]);

    state.settings = settings;
    state.announcements = announcements;
    state.currentIndex = 0;

    render();
    startRotationTimer();

    // Refresh every 2 minutes
    setInterval(async () => {
      const newAnnouncements = await fetchAnnouncements();
      const newSettings = await fetchSettings();

      // Only re-render if data changed
      const announcementsChanged = JSON.stringify(newAnnouncements.map(a => a.id)) !==
                                   JSON.stringify(state.announcements.map(a => a.id));
      const settingsChanged = JSON.stringify(newSettings) !== JSON.stringify(state.settings);

      if (announcementsChanged || settingsChanged) {
        state.announcements = newAnnouncements;
        state.settings = newSettings;
        render(false);
        if (settingsChanged) {
          resetRotationTimer();
        }
      }
    }, 120000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
