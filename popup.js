/*  ═══════════════════════════════════════════════
    LEGITNESS PRIVACY — Popup Controller
    ═══════════════════════════════════════════════ */

(function() {
    'use strict';

    var CONFIG = window.LP_CONFIG;
    if (!CONFIG) {
        document.getElementById('content').innerHTML =
            '<div style="padding:24px;color:#c1442d;text-align:center;font-size:11px;">Error: config.js tidak termuat</div>';
        return;
    }

    function esc(str) {
        var d = document.createElement('div');
        d.appendChild(document.createTextNode(str));
        return d.innerHTML;
    }

    function loadAll() {
        return new Promise(function(r) { chrome.storage.sync.get('lp_settings', function(d) { r(d.lp_settings || {}); }); });
    }

    function saveAll(s) { chrome.storage.sync.set({ lp_settings: s }); }

    function buildDefaults(siteId) {
        var site = CONFIG.sites[siteId];
        var d = { master: true, rules: {}, options: {}, jsRules: {} };
        for (var i = 0; i < site.rules.length; i++) d.rules[site.rules[i].id] = site.rules[i].default !== false;
        for (var j = 0; j < (site.options || []).length; j++) d.options[site.options[j].id] = site.options[j].default || false;
        for (var k = 0; k < (site.jsRules || []).length; k++) d.jsRules[site.jsRules[k].id] = site.jsRules[k].default !== false;
        return d;
    }

    function getSettings(all, siteId) {
        var d = buildDefaults(siteId);
        var s = all[siteId] || {};
        return {
            master: s.master !== undefined ? s.master : d.master,
            rules: Object.assign({}, d.rules, s.rules || {}),
            options: Object.assign({}, d.options, s.options || {}),
            jsRules: Object.assign({}, d.jsRules, s.jsRules || {})
        };
    }

    function findSite(url) {
        for (var id in CONFIG.sites) {
            if (CONFIG.sites.hasOwnProperty(id) && url.indexOf(CONFIG.sites[id].domain) !== -1) return id;
        }
        return null;
    }

    /* compact redaction-bar switch, used for rule / option / jsRule */
    function sw(siteId, type, key, checked, extra) {
        var attrs = ' data-site="' + siteId + '" data-type="' + type + '"';
        if (key) attrs += ' data-key="' + key + '"';
        if (extra) attrs += ' ' + extra;
        return '<label class="rswitch sm"><input type="checkbox"' + attrs + (checked ? ' checked' : '') +
               '><span class="bar"></span></label>';
    }

    /* bold diagonal wipe-fill switch, used only for the site master control */
    function masterSwitch(siteId, checked) {
        var attrs = ' data-site="' + siteId + '" data-type="master"';
        return '<label class="master-toggle cut-sm"><input type="checkbox"' + attrs + (checked ? ' checked' : '') +
               '><span class="mt-fill"></span><span class="mt-text">' + (checked ? 'ON' : 'OFF') + '</span></label>';
    }

    /* ─── RENDER ─── */
    function renderRegistered(allSettings, siteId) {
        var site = CONFIG.sites[siteId];
        var s = getSettings(allSettings, siteId);

        var totalRules = site.rules.length;
        var activeRules = 0;
        for (var c = 0; c < site.rules.length; c++) {
            if (s.rules[site.rules[c].id]) activeRules++;
        }
        var statusText = s.master ? (activeRules + '/' + totalRules + ' klausul aktif') : 'Standby';

        var h = '<div class="doc cut' + (s.master ? ' armed' : '') + '">';

        /* Head: site tag, name, status, master switch — whole row toggles master */
        h += '<div class="doc-head">';
        var iconHtml = (site.icon && site.icon.indexOf('http') === 0)
            ? '<img src="' + esc(site.icon) + '" width="18" height="18" alt="" onerror="this.style.display=\'none\';this.parentElement.insertAdjacentText(\'afterbegin\',\'' + esc(site.name.charAt(0)) + '\')">'
            : esc(site.icon || site.name.charAt(0));
        h += '<div class="doc-id"><span class="doc-tag">' + iconHtml + '</span>';
        h += '<div class="doc-meta"><div class="doc-name">' + esc(site.name) + '</div>';
        h += '<div class="doc-status">' + statusText + '</div></div></div>';
        h += masterSwitch(siteId, s.master);
        h += '</div>';

        h += '<div class="clauses">';

        var currentGroup = '';

        for (var r = 0; r < site.rules.length; r++) {
            var rule = site.rules[r];
            var ruleGroup = rule.group || '';

            /* Group header */
            if (ruleGroup !== currentGroup) {
                if (currentGroup) h += '</div>';
                currentGroup = ruleGroup;
                if (currentGroup) {
                    h += '<div class="clause-group">';
                    h += '<div class="group-tab"><span class="mark">&sect;</span>' + esc(currentGroup) + '</div>';
                }
            }

            /* Rule toggle */
            h += '<div class="clause"><span class="clause-label">' + rule.label + '</span>';
            h += sw(siteId, 'rule', rule.id, s.rules[rule.id]) + '</div>';

            /* Options sub-items */
            for (var o = 0; o < (site.options || []).length; o++) {
                var opt = site.options[o];
                if (opt.targetRules && opt.targetRules.indexOf(rule.id) !== -1) {
                    h += '<div class="clause nested"><span class="clause-label">' + opt.label + '</span>';
                    h += sw(siteId, 'option', opt.id, s.options[opt.id]) + '</div>';
                }
            }

            /* jsRules sub-items */
            for (var j = 0; j < (site.jsRules || []).length; j++) {
                var jr = site.jsRules[j];
                if (jr.parentRule === rule.id) {
                    var extra = jr.mutex ? 'data-mutex="' + esc(jr.mutex) + '"' : '';
                    h += '<div class="clause nested-2"><span class="clause-label">' + jr.label + '</span>';
                    h += sw(siteId, 'jsRule', jr.id, s.jsRules[jr.id], extra) + '</div>';
                }
            }
        }

        if (currentGroup) h += '</div>';
        h += '</div></div>';

        document.getElementById('content').innerHTML = h;
        bindToggles();
        updateDot(allSettings);
    }

    function renderNotRegistered(domain) {
        var h = '<div class="no-file">';
        h += '<div class="no-file-stamp">Belum Terdaftar</div>';
        h += '<div class="no-file-title">Website ini belum terdaftar</div>';
        h += '<div class="no-file-sub">Belum ada modul privacy aktif<br>untuk website ini.</div>';
        h += '<div class="no-file-domain">' + esc(domain) + '</div></div>';
        document.getElementById('content').innerHTML = h;
        var dot = document.getElementById('status-dot');
        dot.className = 'seal';
        dot.title = '';
    }

    function bindToggles() {
        var inputs = document.querySelectorAll('#content input[type="checkbox"]');
        for (var i = 0; i < inputs.length; i++) inputs[i].addEventListener('change', onToggle);

        /* Make the whole row/head act as the click target, not just the tiny switch —
           clicking directly on the switch is left to its native <label> behavior. */
        var rows = document.querySelectorAll('#content .clause, #content .doc-head');
        for (var j = 0; j < rows.length; j++) {
            rows[j].addEventListener('click', function(e) {
                if (e.target.closest('label')) return;
                var cb = this.querySelector('input[type="checkbox"]');
                if (cb) cb.click();
            });
        }
    }

    async function onToggle() {
        var all = await loadAll();
        var siteId = this.getAttribute('data-site');
        var type = this.getAttribute('data-type');
        var key = this.getAttribute('data-key');
        if (!all[siteId]) all[siteId] = buildDefaults(siteId);

        if (type === 'master') {
            all[siteId].master = this.checked;
        }
        else if (type === 'rule') {
            all[siteId].rules = all[siteId].rules || {};
            all[siteId].rules[key] = this.checked;
        }
        else if (type === 'jsRule') {
            all[siteId].jsRules = all[siteId].jsRules || {};
            all[siteId].jsRules[key] = this.checked;

            /* Mutex handling */
            var mutexKey = this.getAttribute('data-mutex');
            if (mutexKey) {
                if (this.checked) {
                    /* Turn ON → turn OFF the other */
                    all[siteId].jsRules[mutexKey] = false;
                    var mutexEl = document.querySelector('input[data-key="' + mutexKey + '"]');
                    if (mutexEl) mutexEl.checked = false;
                } else {
                    /* Turn OFF → if other is also OFF, turn it ON (ensures one always active) */
                    if (!all[siteId].jsRules[mutexKey]) {
                        all[siteId].jsRules[mutexKey] = true;
                        var mutexEl2 = document.querySelector('input[data-key="' + mutexKey + '"]');
                        if (mutexEl2) mutexEl2.checked = true;
                    }
                }
            }
        }
        else if (type === 'option') {
            all[siteId].options = all[siteId].options || {};
            all[siteId].options[key] = this.checked;
        }

        saveAll(all);
        updateDot(all);
    }

    function updateDot(allSettings) {
        var any = false;
        for (var id in CONFIG.sites) {
            if (CONFIG.sites.hasOwnProperty(id) && getSettings(allSettings, id).master) { any = true; break; }
        }
        var dot = document.getElementById('status-dot');
        dot.className = 'seal' + (any ? ' on' : '');
        dot.title = any ? 'Perlindungan aktif' : 'Perlindungan nonaktif';
    }

    async function init() {
        var allSettings = await loadAll();
        var currentUrl = '';
        try {
            var tabs = await new Promise(function(r) { chrome.tabs.query({ active: true, currentWindow: true }, r); });
            if (tabs && tabs[0] && tabs[0].url) currentUrl = tabs[0].url;
        } catch (e) {}

        var matchedSiteId = findSite(currentUrl);
        if (matchedSiteId) {
            renderRegistered(allSettings, matchedSiteId);
        } else {
            var domain = 'unknown';
            try { domain = new URL(currentUrl).hostname || 'unknown'; } catch (e) {}
            renderNotRegistered(domain);
        }

        chrome.storage.onChanged.addListener(function(changes) {
            if (changes.lp_settings && matchedSiteId)
                renderRegistered(changes.lp_settings.newValue || {}, matchedSiteId);
        });
    }

    init();
})();