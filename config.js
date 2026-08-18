/*  ═══════════════════════════════════════════════
    LEGITNESS PRIVACY — Site Configurations
    ═══════════════════════════════════════════════ */

window.LP_CONFIG = {
    sites: {

        /* ═══ INSTAGRAM ═══ */
        instagram: {
            name: 'Instagram',
            icon: 'https://www.instagram.com/static/images/ico/favicon-192.png',
            domain: 'instagram.com',
            rules: [
                {
                    id: 'dmUsername',
                    label: 'Sensor Username DM',
                    default: true,
                    effects: [{ type: 'blur', amount: '12px' }],
                    selectors: [
                        '.xkj4a21',
                        'div.xgf5ljw div.xr9ek0c > span > span'
                    ]
                },
                {
                    id: 'profile',
                    label: 'Sensor Foto Profil',
                    default: true,
                    effects: [{ type: 'blur', amount: '12px' }],
                    selectors: [
                        'img[alt="user-profile-picture"]',
                        'span[style*="height: 74px"] img:not([alt=""])',
                        'li:has(span[style*="height: 74px"] img:not([alt=""])) .xr9ek0c > span > span',
                        'li:has(span[style*="height: 74px"] img:not([alt=""])) [role="button"] > div > div:first-child:not(:has(audio))',
                        'span[style*="height: 160px"] img:not([alt=""])',
                        'div.xgf5ljw div.x1vjfegm:not(:has(audio))',
                        'img.html-img.xuw900x.xt7dq6l'
                    ]
                }
            ],
            options: [
                {
                    id: 'grayscale',
                    label: 'Hitam Putih',
                    default: false,
                    targetRules: ['profile'],
                    effect: { type: 'grayscale' }
                }
            ],
            jsRules: [
                {
                    id: 'dmPreview',
                    label: 'Sensor Nama di Preview',
                    default: true,
                    parentRule: 'dmUsername'
                }
            ]
        },

        /* ═══ GEMINI ═══ */
        gemini: {
            name: 'Gemini',
            icon: 'https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg',
            domain: 'gemini.google.com',
            rules: [
                {
                    id: 'profilePhoto',
                    label: 'Sensor Foto Profile',
                    default: true,
                    group: 'Sensor Profile',
                    effects: [{ type: 'blur', amount: '12px' }],
                    selectors: [
                        'sidenav-mavatar-footer img.mavatar-image'
                    ]
                },
                {
                    id: 'profileName',
                    label: 'Sensor Nama Akun',
                    default: true,
                    group: 'Sensor Profile',
                    effects: [],
                    selectors: []
                },
                {
                    id: 'profileTier',
                    label: 'Sensor Paket Akun',
                    default: true,
                    group: 'Sensor Profile',
                    effects: [{ type: 'blur', amount: '12px' }],
                    selectors: [
                        'sidenav-mavatar-footer .mavatar-tier-label'
                    ]
                },
                {
                    id: 'chatTitle',
                    label: 'Sensor Judul Chat',
                    default: true,
                    effects: [{ type: 'blur', amount: '12px' }],
                    selectors: [
                        '#sidenav-section-content-chats .title-text'
                    ]
                }
            ],
            options: [],
            jsRules: [
                {
                    id: 'replaceName',
                    label: 'Ganti "Legitness"',
                    default: false,
                    parentRule: 'profileName',
                    mutex: 'blurName'
                },
                {
                    id: 'blurName',
                    label: 'Blur',
                    default: true,
                    parentRule: 'profileName',
                    mutex: 'replaceName'
                },
                {
                    id: 'activeChat',
                    label: 'Sensor Chat Aktif',
                    default: true,
                    parentRule: 'chatTitle'
                },
                {
                    id: 'hoverReveal',
                    label: 'Hover untuk Lihat',
                    default: true,
                    parentRule: 'chatTitle'
                }
            ]
        },

        /* ═══ CHATGPT ═══ */
        chatgpt: {
            name: 'ChatGPT',
            icon: 'https://chatgpt.com/favicon.ico',
            domain: 'chatgpt.com',
            rules: [
                {
                    id: 'profilePhoto',
                    label: 'Sensor Foto Profile',
                    default: true,
                    group: 'Sensor Profile',
                    effects: [{ type: 'blur', amount: '12px' }],
                    selectors: [
                        '[data-testid="accounts-profile-button"] img'
                    ]
                },
                {
                    id: 'profileName',
                    label: 'Sensor Nama Akun',
                    default: true,
                    group: 'Sensor Profile',
                    effects: [],
                    selectors: []
                },
                {
                    id: 'profileTier',
                    label: 'Sensor Paket Akun',
                    default: true,
                    group: 'Sensor Profile',
                    effects: [{ type: 'blur', amount: '12px' }],
                    selectors: [
                        '[data-testid="accounts-profile-button"] .text-caption-regular'
                    ]
                },
                {
                    id: 'profileUpgrade',
                    label: 'Sensor Tombol Upgrade',
                    default: true,
                    group: 'Sensor Profile',
                    effects: [{ type: 'blur', amount: '12px' }],
                    selectors: [
                        '[data-testid="accounts-profile-button"] .trailing[data-trailing-style]'
                    ]
                },
                {
                    id: 'chatTitle',
                    label: 'Sensor Judul Chat',
                    default: true,
                    effects: [{ type: 'blur', amount: '12px' }],
                    selectors: [
                        'a[data-sidebar-item="true"] .truncate > span'
                    ]
                }
            ],
            options: [],
            jsRules: [
                {
                    id: 'replaceName',
                    label: 'Ganti "Legitness"',
                    default: false,
                    parentRule: 'profileName',
                    mutex: 'blurName'
                },
                {
                    id: 'blurName',
                    label: 'Blur',
                    default: true,
                    parentRule: 'profileName',
                    mutex: 'replaceName'
                },
                {
                    id: 'activeChat',
                    label: 'Sensor Chat Aktif',
                    default: true,
                    parentRule: 'chatTitle'
                },
                {
                    id: 'hoverReveal',
                    label: 'Hover untuk Lihat',
                    default: true,
                    parentRule: 'chatTitle'
                }
            ]
        },

        /* ═══ CLAUDE ═══ */
        claude: {
            name: 'Claude',
            icon: 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/ce67964e7-CAX1bqSh.png',
            domain: 'claude.ai',
            rules: [
                {
                    id: 'profilePhoto',
                    label: 'Sensor Foto Profile',
                    default: true,
                    group: 'Sensor Profile',
                    effects: [{ type: 'blur', amount: '12px' }],
                    selectors: [
                        '[data-cds="Avatar"]'
                    ]
                },
                {
                    id: 'profileName',
                    label: 'Sensor Nama Akun',
                    default: true,
                    group: 'Sensor Profile',
                    effects: [],
                    selectors: []
                },
                {
                    id: 'profileTier',
                    label: 'Sensor Paket Akun',
                    default: true,
                    group: 'Sensor Profile',
                    effects: [{ type: 'blur', amount: '12px' }],
                    selectors: [
                        'span.w-full.truncate.text-xs.text-muted'
                    ]
                },
                {
                    id: 'chatTitle',
                    label: 'Sensor Judul Chat',
                    default: true,
                    effects: [{ type: 'blur', amount: '12px' }],
                    selectors: [
                        '[data-testid="sidebar-pinned"] a > div > span.truncate',
                        '[data-testid="sidebar-recents"] a > div > span.truncate'
                    ]
                }
            ],
            options: [],
            jsRules: [
                {
                    id: 'replaceName',
                    label: 'Ganti "Legitness"',
                    default: false,
                    parentRule: 'profileName',
                    mutex: 'blurName'
                },
                {
                    id: 'blurName',
                    label: 'Blur',
                    default: true,
                    parentRule: 'profileName',
                    mutex: 'replaceName'
                },
                {
                    id: 'activeChat',
                    label: 'Sensor Chat Aktif',
                    default: true,
                    parentRule: 'chatTitle'
                },
                {
                    id: 'hoverReveal',
                    label: 'Hover untuk Lihat',
                    default: true,
                    parentRule: 'chatTitle'
                }
            ]
        }

    }
};