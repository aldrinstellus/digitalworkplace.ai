/**
 * Chat Core IQ FAQ Widget
 * Accordion-style FAQ section powered by admin Custom FAQs
 *
 * Features:
 * - Fetches FAQs from API with page-specific filtering
 * - Smooth accordion animations
 * - Accessible (ARIA, keyboard navigation)
 * - Responsive design matching site theme
 * - Graceful error handling
 * - Search/filter functionality
 */
(function() {
  'use strict';

  // API Base URL - auto-detect production vs localhost
  function getApiBase() {
    if (window.CHAT_WIDGET_API_BASE) return window.CHAT_WIDGET_API_BASE;
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3002/dcq';
    }
    return window.location.origin + '/dcq';
  }
  const API_BASE = getApiBase();

  // Store all FAQs for filtering
  let allFaqs = [];

  // Configuration
  const CONFIG = {
    apiUrl: API_BASE + '/api/faqs',
    pageUrl: '/Home',
    limit: 6,
    containerId: 'doral-faq-section',
    // Colors matching Chat Core IQ theme
    colors: {
      primaryBlue: '#052942',
      secondaryBlue: '#1c86db',
      gold: '#FFCF4B',
      lightGray: '#f8f9fa',
      text: '#333333',
      white: '#ffffff'
    }
  };

  // Inject CSS styles
  function injectStyles() {
    const styleId = 'doral-faq-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* FAQ Section Container */
      .row-index-faq {
        background-color: ${CONFIG.colors.lightGray};
        padding: 60px 0;
      }

      .row-index-faq .row-container-title h1 {
        color: ${CONFIG.colors.primaryBlue};
        text-align: center;
        margin-bottom: 40px;
        font-family: 'Figtree', sans-serif;
        font-size: 2rem;
        font-weight: 600;
      }

      /* FAQ Container */
      .doral-faq-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 0 20px;
      }

      /* Loading State */
      .doral-faq-loading {
        text-align: center;
        padding: 40px;
        color: ${CONFIG.colors.text};
      }

      .doral-faq-loading-spinner {
        display: inline-block;
        width: 40px;
        height: 40px;
        border: 3px solid ${CONFIG.colors.lightGray};
        border-top-color: ${CONFIG.colors.secondaryBlue};
        border-radius: 50%;
        animation: doral-faq-spin 1s linear infinite;
      }

      @keyframes doral-faq-spin {
        to { transform: rotate(360deg); }
      }

      /* Error State */
      .doral-faq-error {
        text-align: center;
        padding: 40px;
        color: #666;
        font-style: italic;
      }

      /* FAQ Item */
      .doral-faq-item {
        background: ${CONFIG.colors.white};
        border-radius: 8px;
        margin-bottom: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        overflow: hidden;
        transition: box-shadow 0.2s ease;
      }

      .doral-faq-item:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      /* Question Button */
      .doral-faq-question {
        width: 100%;
        padding: 18px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        background: transparent;
        border: none;
        cursor: pointer;
        text-align: left;
        font-family: 'Figtree', sans-serif;
        font-size: 1.05rem;
        font-weight: 500;
        color: ${CONFIG.colors.primaryBlue};
        transition: background-color 0.2s ease;
      }

      .doral-faq-question:hover {
        background-color: #f0f7ff;
      }

      .doral-faq-question:focus {
        outline: 2px solid ${CONFIG.colors.secondaryBlue};
        outline-offset: -2px;
      }

      .doral-faq-question-text {
        flex: 1;
        line-height: 1.4;
      }

      /* Icon */
      .doral-faq-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${CONFIG.colors.secondaryBlue};
        font-size: 1.5rem;
        font-weight: 300;
        transition: transform 0.3s ease;
      }

      .doral-faq-item.open .doral-faq-icon {
        transform: rotate(45deg);
      }

      /* Answer */
      .doral-faq-answer {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease, padding 0.3s ease;
      }

      .doral-faq-answer-inner {
        padding: 0 20px 20px;
        font-family: 'Figtree', sans-serif;
        font-size: 1rem;
        line-height: 1.7;
        color: ${CONFIG.colors.text};
      }

      .doral-faq-answer-inner p {
        margin: 0;
      }

      .doral-faq-answer-inner a {
        color: ${CONFIG.colors.secondaryBlue};
        text-decoration: underline;
      }

      .doral-faq-answer-inner a:hover {
        color: ${CONFIG.colors.primaryBlue};
      }

      /* Category Badge */
      .doral-faq-category {
        display: inline-block;
        padding: 2px 8px;
        margin-bottom: 8px;
        background-color: ${CONFIG.colors.lightGray};
        color: ${CONFIG.colors.primaryBlue};
        font-size: 0.75rem;
        font-weight: 500;
        border-radius: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      /* No FAQs message */
      .doral-faq-empty {
        display: none;
      }

      /* Search Box */
      .doral-faq-search-wrapper {
        margin-bottom: 24px;
      }

      .doral-faq-search {
        position: relative;
        max-width: 100%;
      }

      .doral-faq-search-icon {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 20px;
        color: #999;
        pointer-events: none;
      }

      .doral-faq-search-input {
        width: 100%;
        padding: 14px 16px 14px 48px;
        font-family: 'Figtree', sans-serif;
        font-size: 1rem;
        color: ${CONFIG.colors.text};
        background: ${CONFIG.colors.white};
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .doral-faq-search-input::placeholder {
        color: #999;
      }

      .doral-faq-search-input:focus {
        border-color: ${CONFIG.colors.secondaryBlue};
        box-shadow: 0 0 0 3px rgba(28, 134, 219, 0.15);
      }

      .doral-faq-search-clear {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 24px;
        height: 24px;
        padding: 0;
        background: #e2e8f0;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        color: #666;
        font-size: 14px;
        line-height: 1;
        transition: background-color 0.2s ease;
      }

      .doral-faq-search-clear:hover {
        background-color: #cbd5e1;
      }

      .doral-faq-search-clear.visible {
        display: flex;
      }

      /* No results message */
      .doral-faq-no-results {
        text-align: center;
        padding: 30px 20px;
        color: #666;
        font-family: 'Figtree', sans-serif;
        font-size: 1rem;
        background: ${CONFIG.colors.white};
        border-radius: 8px;
        display: none;
      }

      .doral-faq-no-results.visible {
        display: block;
      }

      /* Hidden FAQ items during search */
      .doral-faq-item.hidden {
        display: none;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .row-index-faq {
          padding: 40px 0;
        }

        .row-index-faq .row-container-title h1 {
          font-size: 1.5rem;
          margin-bottom: 24px;
        }

        .doral-faq-container {
          padding: 0 16px;
        }

        .doral-faq-question {
          padding: 16px;
          font-size: 0.95rem;
        }

        .doral-faq-answer-inner {
          padding: 0 16px 16px;
          font-size: 0.9rem;
        }

        .doral-faq-search-wrapper {
          margin-bottom: 20px;
        }

        .doral-faq-search-input {
          padding: 12px 14px 12px 44px;
          font-size: 0.95rem;
        }

        .doral-faq-search-icon {
          left: 14px;
          width: 18px;
          height: 18px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // Render loading state
  function renderLoading() {
    const container = document.getElementById(CONFIG.containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="doral-faq-container">
        <div class="doral-faq-loading">
          <div class="doral-faq-loading-spinner"></div>
        </div>
      </div>
    `;
  }

  // Render error state
  function renderError() {
    const container = document.getElementById(CONFIG.containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="doral-faq-container">
        <div class="doral-faq-error">
          FAQs are currently unavailable. Please try again later.
        </div>
      </div>
    `;
  }

  // Hide section when no FAQs
  function hideSection() {
    const section = document.querySelector('.row-index-faq');
    if (section) {
      section.style.display = 'none';
    }
  }

  // Render FAQs
  function renderFaqs(faqs) {
    const container = document.getElementById(CONFIG.containerId);
    if (!container) return;

    if (!faqs || faqs.length === 0) {
      hideSection();
      return;
    }

    // Store FAQs for filtering
    allFaqs = faqs;

    const faqsHtml = faqs.map((faq, index) => `
      <div class="doral-faq-item" data-index="${index}" data-question="${escapeHtml(faq.question).toLowerCase()}" data-answer="${escapeHtml(faq.answer).toLowerCase()}">
        <button type="button" class="doral-faq-question"
                aria-expanded="false"
                aria-controls="faq-answer-${index}"
                id="faq-question-${index}">
          <span class="doral-faq-question-text">${escapeHtml(faq.question)}</span>
          <span class="doral-faq-icon" aria-hidden="true">+</span>
        </button>
        <div class="doral-faq-answer"
             id="faq-answer-${index}"
             role="region"
             aria-labelledby="faq-question-${index}"
             aria-hidden="true">
          <div class="doral-faq-answer-inner">
            ${faq.category ? `<span class="doral-faq-category">${escapeHtml(faq.category)}</span>` : ''}
            <p>${formatAnswer(faq.answer)}</p>
          </div>
        </div>
      </div>
    `).join('');

    // Search box HTML with magnifying glass icon
    const searchHtml = `
      <div class="doral-faq-search-wrapper">
        <div class="doral-faq-search">
          <svg class="doral-faq-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text"
                 class="doral-faq-search-input"
                 placeholder="Search FAQs..."
                 aria-label="Search frequently asked questions"
                 id="doral-faq-search-input">
          <button type="button" class="doral-faq-search-clear" aria-label="Clear search" id="doral-faq-search-clear">&times;</button>
        </div>
      </div>
    `;

    container.innerHTML = `
      <div class="doral-faq-container">
        ${searchHtml}
        <div class="doral-faq-list">
          ${faqsHtml}
        </div>
        <div class="doral-faq-no-results" id="doral-faq-no-results">
          No FAQs match your search. Try different keywords.
        </div>
      </div>
    `;

    // Attach event listeners
    attachEventListeners();
    attachSearchListeners();
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Format answer (convert URLs to links, preserve line breaks)
  function formatAnswer(text) {
    // Escape HTML first
    let formatted = escapeHtml(text);

    // Convert URLs to links
    formatted = formatted.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Convert line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
  }

  // Toggle accordion item
  function toggleItem(item) {
    const isOpen = item.classList.contains('open');
    const question = item.querySelector('.doral-faq-question');
    const answer = item.querySelector('.doral-faq-answer');
    const answerInner = item.querySelector('.doral-faq-answer-inner');

    if (isOpen) {
      // Close
      item.classList.remove('open');
      question.setAttribute('aria-expanded', 'false');
      answer.setAttribute('aria-hidden', 'true');
      answer.style.maxHeight = '0';
    } else {
      // Open
      item.classList.add('open');
      question.setAttribute('aria-expanded', 'true');
      answer.setAttribute('aria-hidden', 'false');
      answer.style.maxHeight = answerInner.scrollHeight + 40 + 'px';
    }
  }

  // Attach event listeners
  function attachEventListeners() {
    const container = document.getElementById(CONFIG.containerId);
    if (!container) return;

    // Click handler
    container.addEventListener('click', function(e) {
      const question = e.target.closest('.doral-faq-question');
      if (question) {
        const item = question.closest('.doral-faq-item');
        if (item) {
          toggleItem(item);
        }
      }
    });

    // Keyboard handler
    container.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        const question = e.target.closest('.doral-faq-question');
        if (question) {
          e.preventDefault();
          const item = question.closest('.doral-faq-item');
          if (item) {
            toggleItem(item);
          }
        }
      }
    });
  }

  // Attach search event listeners
  function attachSearchListeners() {
    const searchInput = document.getElementById('doral-faq-search-input');
    const clearButton = document.getElementById('doral-faq-search-clear');
    const noResults = document.getElementById('doral-faq-no-results');

    if (!searchInput) return;

    // Debounce function for search
    let debounceTimer;
    function debounce(func, delay) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(func, delay);
    }

    // Filter FAQs based on search query
    function filterFaqs(query) {
      const container = document.getElementById(CONFIG.containerId);
      if (!container) return;

      const faqItems = container.querySelectorAll('.doral-faq-item');
      const normalizedQuery = query.toLowerCase().trim();
      let visibleCount = 0;

      faqItems.forEach(function(item) {
        const questionText = item.getAttribute('data-question') || '';
        const answerText = item.getAttribute('data-answer') || '';

        if (normalizedQuery === '' || questionText.includes(normalizedQuery) || answerText.includes(normalizedQuery)) {
          item.classList.remove('hidden');
          visibleCount++;
        } else {
          item.classList.add('hidden');
        }
      });

      // Show/hide no results message
      if (noResults) {
        if (visibleCount === 0 && normalizedQuery !== '') {
          noResults.classList.add('visible');
        } else {
          noResults.classList.remove('visible');
        }
      }

      // Show/hide clear button
      if (clearButton) {
        if (normalizedQuery !== '') {
          clearButton.classList.add('visible');
        } else {
          clearButton.classList.remove('visible');
        }
      }
    }

    // Search input handler
    searchInput.addEventListener('input', function(e) {
      debounce(function() {
        filterFaqs(e.target.value);
      }, 150);
    });

    // Clear button handler
    if (clearButton) {
      clearButton.addEventListener('click', function() {
        searchInput.value = '';
        filterFaqs('');
        searchInput.focus();
      });
    }

    // Handle Escape key to clear search
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        searchInput.value = '';
        filterFaqs('');
      }
    });
  }

  // Fetch FAQs from API
  async function fetchFaqs() {
    try {
      const url = `${CONFIG.apiUrl}?url=${encodeURIComponent(CONFIG.pageUrl)}&status=active`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.faqs ? data.faqs.slice(0, CONFIG.limit) : [];
    } catch (error) {
      console.error('[DoralFAQ] Error fetching FAQs:', error);
      return null;
    }
  }

  // Initialize widget
  async function init() {
    const container = document.getElementById(CONFIG.containerId);
    if (!container) {
      console.warn('[DoralFAQ] Container not found:', CONFIG.containerId);
      return;
    }

    // Inject styles
    injectStyles();

    // Show loading state
    renderLoading();

    // Fetch and render FAQs
    const faqs = await fetchFaqs();

    if (faqs === null) {
      renderError();
    } else if (faqs.length === 0) {
      hideSection();
    } else {
      renderFaqs(faqs);
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
