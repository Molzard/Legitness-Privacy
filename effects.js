/*  ═══════════════════════════════════════════════
    LEGITNESS PRIVACY — Effects Library (Reusable)
    ═══════════════════════════════════════════════ */

window.LP_Effects = {};

(function(effects) {

    /* ─── BLUR ─── */
    effects.blur = function(opts) {
        var amount = (opts && opts.amount) || '12px';
        return {
            filter: 'blur(' + amount + ')',
            hoverFilter: 'blur(4px)',
            extra: 'user-select: none !important;'
        };
    };

    /* ─── GRAYSCALE ─── */
    effects.grayscale = function() {
        return {
            filter: 'grayscale(100%) brightness(0.3) contrast(1.2)',
            hoverFilter: 'grayscale(100%) brightness(0.6)',
            extra: ''
        };
    };

    /* ─── BLACKOUT ─── */
    effects.blackout = function() {
        return {
            filter: 'brightness(0)',
            hoverFilter: 'brightness(0.3)',
            extra: ''
        };
    };

    /* ─── RESOLVE ─── */
    effects.resolve = function(effectDef) {
        var fn = effects[effectDef.type];
        if (!fn) {
            console.warn('[LP] Unknown effect:', effectDef.type);
            return { filter: '', hoverFilter: '', extra: '' };
        }
        return fn(effectDef);
    };

    /* ─── COMPOSE ─── */
    effects.compose = function(effectDefs) {
        var filters = [];
        var hoverFilters = [];
        var extras = [];

        for (var i = 0; i < effectDefs.length; i++) {
            var r = effects.resolve(effectDefs[i]);
            if (r.filter) filters.push(r.filter);
            if (r.hoverFilter) hoverFilters.push(r.hoverFilter);
            if (r.extra) extras.push(r.extra);
        }

        return {
            filter: filters.join(' '),
            hoverFilter: hoverFilters.length > 0
                ? hoverFilters.join(' ')
                : filters.join(' '),
            extras: extras
        };
    };

})(LP_Effects);