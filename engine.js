/*  ═══════════════════════════════════════════════
    LEGITNESS PRIVACY — Core Engine
    ═══════════════════════════════════════════════ */

(function() {
    'use strict';

    var CONFIG = window.LP_CONFIG;
    var EFFECTS = window.LP_Effects;

    if (!CONFIG) { console.error('[LP] LP_CONFIG missing'); return; }
    if (!EFFECTS) { console.error('[LP] LP_Effects missing'); return; }

    console.log('[LP] Engine loaded');

    function esc(str) {
        var d = document.createElement('div');
        d.appendChild(document.createTextNode(str));
        return d.innerHTML;
    }

    function detectSite() {
        var host = window.location.hostname;
        for (var id in CONFIG.sites) {
            if (CONFIG.sites.hasOwnProperty(id) && host.indexOf(CONFIG.sites[id].domain) !== -1)
                return { id: id, config: CONFIG.sites[id] };
        }
        return null;
    }

    var currentSite = detectSite();
    if (!currentSite) { console.log('[LP] Not registered:', window.location.hostname); return; }
    console.log('[LP] Active on:', currentSite.config.name);

    var cachedAll = null;

    function loadAll(cb) {
        chrome.storage.sync.get('lp_settings', function(d) { cachedAll = d.lp_settings || {}; cb(cachedAll); });
    }

    function buildDefaults() {
        var site = currentSite.config;
        var d = { master: true, rules: {}, options: {}, jsRules: {} };
        for (var i = 0; i < site.rules.length; i++) d.rules[site.rules[i].id] = site.rules[i].default !== false;
        for (var j = 0; j < (site.options || []).length; j++) d.options[site.options[j].id] = site.options[j].default || false;
        for (var k = 0; k < (site.jsRules || []).length; k++) d.jsRules[site.jsRules[k].id] = site.jsRules[k].default !== false;
        return d;
    }

    function getSettings(all) {
        var d = buildDefaults();
        var s = all[currentSite.id] || {};
        return {
            master: s.master !== undefined ? s.master : d.master,
            rules: Object.assign({}, d.rules, s.rules || {}),
            options: Object.assign({}, d.options, s.options || {}),
            jsRules: Object.assign({}, d.jsRules, s.jsRules || {})
        };
    }

    /* ─── CSS ENGINE ─── */
    var lastCSS = '';

    function generateCSS(settings) {
        var site = currentSite.config;
        if (!settings.master) return '';
        var css = '';

        for (var r = 0; r < site.rules.length; r++) {
            var rule = site.rules[r];
            if (!settings.rules[rule.id]) continue;
            if (!rule.selectors || !rule.selectors.length) continue;

            var fx = rule.effects.slice();
            for (var o = 0; o < (site.options || []).length; o++) {
                var opt = site.options[o];
                if (settings.options[opt.id] && opt.targetRules && opt.targetRules.indexOf(rule.id) !== -1)
                    fx.push(opt.effect);
            }
            if (!fx.length) continue;

            var composed = EFFECTS.compose(fx);
            if (!composed.filter) continue;

            for (var s = 0; s < rule.selectors.length; s++) {
                css += rule.selectors[s] + '{filter:' + composed.filter + '!important;transition:filter 0.3s ease;';
                for (var e = 0; e < composed.extras.length; e++)
                    if (composed.extras[e]) css += composed.extras[e];
                css += '}\n';
            }
        }
        return css;
    }

    function applyCSS(css) {
        if (css === lastCSS) return;
        lastCSS = css;
        var el = document.getElementById('lp-css');
        if (!el) {
            el = document.createElement('style');
            el.id = 'lp-css';
            document.head.appendChild(el);
        }
        el.textContent = css;
    }

    /* ═══════════════════════════════════════════════
       SHARED HELPERS
       ═══════════════════════════════════════════════ */

    function injectStyle(id, css) {
        var old = document.getElementById(id);
        if (old) old.remove();
        if (!css) return;
        var sty = document.createElement('style');
        sty.id = id;
        sty.textContent = css;
        document.head.appendChild(sty);
    }

    function profileReplace(enabled, selector) {
        var MARK = 'data-lp-replace';
        var els = document.querySelectorAll(selector);
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            if (enabled) {
                if (!el.hasAttribute(MARK)) el.setAttribute(MARK, el.textContent);
                el.textContent = 'Legitness';
                el.style.setProperty('filter', 'none', 'important');
            } else {
                if (el.hasAttribute(MARK)) {
                    el.textContent = el.getAttribute(MARK);
                    el.removeAttribute(MARK);
                }
                el.style.removeProperty('filter');
            }
        }
    }

    function profileBlur(enabled, selector, styleId) {
        var old = document.getElementById(styleId);
        if (old) old.remove();
        if (enabled) {
            var sty = document.createElement('style');
            sty.id = styleId;
            sty.textContent = selector + '{filter:blur(12px)!important;transition:filter 0.3s ease;}';
            document.head.appendChild(sty);
        }
    }

    /* ═══════════════════════════════════════════════
       INSTAGRAM HANDLERS
       ═══════════════════════════════════════════════ */
    var HANDLERS = {};
    HANDLERS.instagram = {};

    HANDLERS.instagram.dmPreview = function(enabled) {
        var MARK = 'data-lp-dm-orig';

        if (!enabled) {
            var marked = document.querySelectorAll('[' + MARK + ']');
            for (var m = 0; m < marked.length; m++) {
                marked[m].textContent = marked[m].getAttribute(MARK);
                marked[m].removeAttribute(MARK);
            }
            return;
        }

        var kw = [
            ' sent an attachment.', ' sent a photo.', ' sent a video.',
            ' sent a reel.', ' sent a link.', ' sent a voice message.',
            ' sent a message.', ' sent a gif.', ' sent a sticker.',
            ' mengirim lampiran.', ' mengirim foto.', ' mengirim video.',
            ' mengirim reel.', ' mengirim tautan.', ' mengirim pesan suara.',
            ' mengirim pesan.', ' mengirim gif.', ' mengirim stiker.'
        ];

        var spans = document.getElementsByTagName('span');
        for (var i = 0; i < spans.length; i++) {
            var span = spans[i];
            if (span.children.length > 0) continue;
            if (span.hasAttribute(MARK)) continue;
            var text = span.textContent;
            if (text.length < 8) continue;
            if (text.indexOf(' sent ') === -1 && text.indexOf(' mengirim ') === -1) continue;

            var splitIdx = -1;
            for (var k = 0; k < kw.length; k++) {
                var idx = text.indexOf(kw[k]);
                if (idx > 0) { splitIdx = idx; break; }
            }
            if (splitIdx > 0) {
                var user = text.substring(0, splitIdx);
                var rest = text.substring(splitIdx);
                span.setAttribute(MARK, text);
                span.innerHTML =
                    '<span style="filter:blur(12px)!important;user-select:none!important;">'
                    + esc(user) + '</span>' + esc(rest);
            }
        }
    };

    var OWN = 'data-lp-own';
    var TXT = 'data-lp-txt';

    HANDLERS.instagram.dmInfo = function(settings) {
        var pics = document.querySelectorAll('img.html-img.xuw900x.xt7dq6l');

        var owns = document.querySelectorAll('[' + OWN + ']');
        for (var o = 0; o < owns.length; o++) {
            owns[o].removeAttribute(OWN);
            owns[o].style.removeProperty('filter');
        }
        var txts = document.querySelectorAll('[' + TXT + ']');
        for (var t = 0; t < txts.length; t++) {
            txts[t].removeAttribute(TXT);
            txts[t].style.removeProperty('filter');
        }

        if (pics.length === 0) return;
        if (!settings.master || settings.rules.profile === false) return;

        var popup = document.querySelector('.x7r02ix');
        if (popup) {
            var popupImgs = popup.querySelectorAll('img.html-img.xuw900x.xt7dq6l');
            if (popupImgs.length > 0) {
                popupImgs[0].style.setProperty('filter', 'none', 'important');
                popupImgs[0].setAttribute(OWN, '1');
                var ownBtn = popupImgs[0].closest('[role="button"]');
                if (ownBtn) {
                    var ownTxt = ownBtn.querySelector('div[style*="--x-height: 60px"]');
                    if (ownTxt) ownTxt.setAttribute(OWN, '1');
                }
            }
        }

        if (!settings.master || settings.rules.dmUsername === false) return;

        for (var i = 0; i < pics.length; i++) {
            var img = pics[i];
            if (img.hasAttribute(OWN)) continue;
            var btn = img.closest('[role="button"]');
            if (!btn) continue;
            var txt = btn.querySelector('div[style*="--x-height: 60px"]');
            if (!txt || txt.hasAttribute(OWN) || txt.hasAttribute(TXT)) continue;
            txt.style.filter = 'blur(12px)';
            txt.setAttribute(TXT, '1');
        }
    };

    /* ═══════════════════════════════════════════════
       GEMINI HANDLERS
       ═══════════════════════════════════════════════ */
    HANDLERS.gemini = {};

    HANDLERS.gemini.replaceName = function(enabled) {
        profileReplace(enabled, 'sidenav-mavatar-footer .mavatar-user-name');
    };

    HANDLERS.gemini.blurName = function(enabled) {
        profileBlur(enabled, 'sidenav-mavatar-footer .mavatar-user-name', 'lp-blurname-gem');
    };

    HANDLERS.gemini.activeChat = function(enabled) {
        /*
         * CSS approach: specificity 1-2-0 > blur's 1-1-0
         * Survives Angular re-renders (unlike inline styles)
         */
        injectStyle('lp-active-gem', enabled ? null :
            '#sidenav-section-content-chats .title-text.gds-emphasized-body-s{filter:none!important;}'
        );
    };

    HANDLERS.gemini.greetingName = function(settings) {
        if (!settings.master || settings.rules.profileName === false) {
            cleanupGreeting();
            return;
        }

        var nameEl = document.querySelector('sidenav-mavatar-footer .mavatar-user-name');
        if (!nameEl) { cleanupGreeting(); return; }

        var fullName = (nameEl.getAttribute('data-lp-replace') || nameEl.textContent || '').trim();
        var firstName = fullName.split(/\s+/)[0];
        if (!firstName || firstName.length < 2) { cleanupGreeting(); return; }

        var replaceOn = settings.jsRules.replaceName !== false;
        var blurOn = settings.jsRules.blurName !== false;

        if (!replaceOn && !blurOn) { cleanupGreeting(); return; }

        var greetingEls = document.querySelectorAll('.message-text');
        for (var i = 0; i < greetingEls.length; i++) {
            var el = greetingEls[i];

            if (el.hasAttribute(GREETING_MARK)) {
                /* Already processed — check if mode changed */
                var currentState = el.getAttribute(GREETING_MARK);
                var desiredState = replaceOn ? 'replace' : 'blur';
                if (currentState === desiredState) continue;
                /* Mode changed — cleanup this element and re-process */
                var orig = el.getAttribute(GREETING_ORIG);
                if (orig !== null) {
                    el.textContent = orig;
                    el.removeAttribute(GREETING_ORIG);
                }
                el.removeAttribute(GREETING_MARK);
                el.style.removeProperty('filter');
            }

            var text = el.textContent || '';
            var idx = text.indexOf(firstName);
            if (idx === -1) continue;

            el.setAttribute(GREETING_ORIG, text);

            if (replaceOn) {
                el.setAttribute(GREETING_MARK, 'replace');
                el.textContent = text.replace(new RegExp(firstName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'Legitness');
                el.style.setProperty('filter', 'none', 'important');
            } else {
                el.setAttribute(GREETING_MARK, 'blur');
                var before = text.substring(0, idx);
                var after = text.substring(idx + firstName.length);
                el.innerHTML =
                    esc(before) +
                    '<span style="filter:blur(12px)!important;user-select:none!important;">' +
                    esc(firstName) +
                    '</span>' +
                    esc(after);
            }
        }
    };


    HANDLERS.gemini.hoverReveal = function(enabled) {
        injectStyle('lp-hover-gem', enabled ?
            '#sidenav-section-content-chats a.mat-mdc-list-item:hover .title-text{filter:none!important;transition:filter 0.15s ease;}' :
            null
        );
    };

    /* ═══════════════════════════════════════════════
       CHATGPT HANDLERS
       ═══════════════════════════════════════════════ */
    HANDLERS.chatgpt = {};

    HANDLERS.chatgpt.replaceName = function(enabled) {
        profileReplace(enabled, '[data-testid="accounts-profile-button"] .truncate');
    };

    HANDLERS.chatgpt.blurName = function(enabled) {
        profileBlur(enabled, '[data-testid="accounts-profile-button"] .truncate', 'lp-blurname-gpt');
    };

    HANDLERS.chatgpt.activeChat = function(enabled) {
        /*
         * CSS approach: specificity 0-3-2 > blur's 0-2-2
         */
        injectStyle('lp-active-gpt', enabled ? null :
            'a[data-active][data-sidebar-item="true"] .truncate > span{filter:none!important;}'
        );
    };

    HANDLERS.chatgpt.hoverReveal = function(enabled) {
        injectStyle('lp-hover-gpt', enabled ?
            'a[data-sidebar-item="true"]:hover .truncate > span{filter:none!important;transition:filter 0.15s ease;}' :
            null
        );
    };

    /* ═══════════════════════════════════════════════
       CLAUDE HANDLERS
       ═══════════════════════════════════════════════ */
    HANDLERS.claude = {};

    HANDLERS.claude.replaceName = function(enabled) {
        profileReplace(enabled, 'span.w-full.text-start.block.truncate');
    };

    HANDLERS.claude.blurName = function(enabled) {
        profileBlur(enabled, 'span.w-full.text-start.block.truncate', 'lp-blurname-claude');
    };

    HANDLERS.claude.activeChat = function(enabled) {
        /*
         * CSS approach: specificity 0-3-3 > blur's 0-2-3
         * Survives Angular re-renders
         */
        injectStyle('lp-active-claude', enabled ? null :
            '[data-testid="sidebar-pinned"] a[aria-current="page"] > div > span.truncate,' +
            '[data-testid="sidebar-recents"] a[aria-current="page"] > div > span.truncate' +
            '{filter:none!important;}'
        );
    };

    HANDLERS.claude.hoverReveal = function(enabled) {
        injectStyle('lp-hover-claude', enabled ?
            '[data-testid="sidebar-pinned"] a:hover > div > span.truncate,' +
            '[data-testid="sidebar-recents"] a:hover > div > span.truncate' +
            '{filter:none!important;transition:filter 0.15s ease;}' :
            null
        );
    };

    /* ─── Shared Greeting Helpers ─── */
    var GREETING_MARK = 'data-lp-greeting-state';
    var GREETING_ORIG = 'data-lp-greeting-orig';

    function cleanupGreeting() {
        var marked = document.querySelectorAll('[' + GREETING_MARK + ']');
        for (var i = 0; i < marked.length; i++) {
            var el = marked[i];
            var orig = el.getAttribute(GREETING_ORIG);
            if (orig !== null) {
                el.textContent = orig;
                el.removeAttribute(GREETING_ORIG);
            }
            el.removeAttribute(GREETING_MARK);
            el.style.removeProperty('filter');
        }
    }

    function applyGreetingReplace(el, origName) {
        var state = el.getAttribute(GREETING_MARK);
        if (state === 'replace') return;

        cleanupGreeting();
        var text = el.textContent;
        if (text.indexOf(origName) === -1) return;

        el.setAttribute(GREETING_ORIG, text);
        el.setAttribute(GREETING_MARK, 'replace');
        el.textContent = text.replace(origName, 'Legitness');
    }

    function applyGreetingBlur(el, origName) {
        var state = el.getAttribute(GREETING_MARK);
        if (state === 'blur') return;

        cleanupGreeting();
        var text = el.textContent;
        var idx = text.indexOf(origName);
        if (idx === -1) return;

        el.setAttribute(GREETING_ORIG, text);
        el.setAttribute(GREETING_MARK, 'blur');
        var before = text.substring(0, idx);
        var after = text.substring(idx + origName.length);
        el.innerHTML =
            esc(before) +
            '<span style="filter:blur(12px)!important;user-select:none!important;">' +
            esc(origName) +
            '</span>' +
            esc(after);
    }

    HANDLERS.claude.greetingName = function(settings) {
        var el = getGreetingEl();
        if (!el) {
            cleanupGreeting();
            return;
        }

        if (!settings.master || settings.rules.profileName === false) {
            cleanupGreeting();
            return;
        }

        /* Get original username from sidebar */
        var nameEl = document.querySelector('span.w-full.text-start.block.truncate');
        if (!nameEl) { cleanupGreeting(); return; }

        var origName = (nameEl.getAttribute('data-lp-replace') || nameEl.textContent || '').trim();
        if (!origName || origName.length < 2) { cleanupGreeting(); return; }

        var replaceOn = settings.jsRules.replaceName !== false;
        var blurOn = settings.jsRules.blurName !== false;

        if (replaceOn) {
            applyGreetingReplace(el, origName);
        } else if (blurOn) {
            applyGreetingBlur(el, origName);
        } else {
            cleanupGreeting();
        }
    };

    /* ═══════════════════════════════════════════════
       RUN HANDLERS
       ═══════════════════════════════════════════════ */
    function runJsHandlers(settings) {
        var h = HANDLERS[currentSite.id];
        if (!h) return;

        /* Config jsRules (have toggles in popup) */
        var jsRules = currentSite.config.jsRules || [];
        for (var i = 0; i < jsRules.length; i++) {
            var rule = jsRules[i];
            if (!h[rule.id]) continue;
            var on = settings.master && (settings.jsRules[rule.id] !== false);
            if (on && rule.parentRule) {
                on = settings.rules[rule.parentRule] !== false;
            }
            try { h[rule.id](on, settings.options); } catch (e) { console.error('[LP]', rule.id, e); }
        }

        /* Internal handlers (receive full settings, no toggle) */
        if (h.dmInfo) {
            try { h.dmInfo(settings); } catch (e) { console.error('[LP] dmInfo', e); }
        }
        if (h.greetingName) {
            try { h.greetingName(settings); } catch (e) { console.error('[LP] greetingName', e); }
        }
    }

    /* ─── APPLY ─── */
    function doApply(all) {
        var settings = getSettings(all);
        applyCSS(generateCSS(settings));
        runJsHandlers(settings);
    }

    function apply() {
        if (cachedAll) { doApply(cachedAll); return; }
        loadAll(function(all) { doApply(all); });
    }

    /* ─── INIT ─── */
    apply();

    chrome.storage.onChanged.addListener(function(changes) {
        if (changes.lp_settings) {
            cachedAll = changes.lp_settings.newValue || {};
            apply();
        }
    });

    if (document.body) {
        var tid;
        new MutationObserver(function() {
            clearTimeout(tid);
            tid = setTimeout(apply, 0);
        }).observe(document.body, { childList: true, subtree: true });
    }

})();