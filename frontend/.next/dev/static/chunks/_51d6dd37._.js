(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/store/theme-store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useThemeStore",
    ()=>useThemeStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$9_$40$types$2b$react$40$_abef80168be8267936275a0417dbfe6a$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zustand@5.0.9_@types+react@_abef80168be8267936275a0417dbfe6a/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$9_$40$types$2b$react$40$_abef80168be8267936275a0417dbfe6a$2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zustand@5.0.9_@types+react@_abef80168be8267936275a0417dbfe6a/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
;
;
const useThemeStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$9_$40$types$2b$react$40$_abef80168be8267936275a0417dbfe6a$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$9_$40$types$2b$react$40$_abef80168be8267936275a0417dbfe6a$2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set)=>({
        theme: "light",
        accentColor: "blue",
        setTheme: (theme)=>set({
                theme
            }),
        toggleTheme: ()=>set((state)=>({
                    theme: state.theme === "light" ? "dark" : "light"
                })),
        setAccentColor: (accentColor)=>set({
                accentColor
            })
    }), {
    name: "theme-storage"
}));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/theme-config.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Theme configuration based on the design documentation
__turbopack_context__.s([
    "themeColors",
    ()=>themeColors
]);
const themeColors = {
    blue: {
        name: "Bleu Océan",
        primary: "#3B82F6",
        primary50: "#EFF6FF",
        primary100: "#DBEAFE",
        primary500: "#3B82F6",
        primary600: "#2563EB",
        primary700: "#1D4ED8"
    },
    green: {
        name: "Vert Émeraude",
        primary: "#10B981",
        primary50: "#ECFDF5",
        primary100: "#D1FAE5",
        primary500: "#10B981",
        primary600: "#059669",
        primary700: "#047857"
    },
    gold: {
        name: "Or Royal",
        primary: "#F59E0B",
        primary50: "#FFFBEB",
        primary100: "#FEF3C7",
        primary500: "#F59E0B",
        primary600: "#D97706",
        primary700: "#B45309"
    },
    purple: {
        name: "Violet Mystique",
        primary: "#8B5CF6",
        primary50: "#F5F3FF",
        primary100: "#EDE9FE",
        primary500: "#8B5CF6",
        primary600: "#7C3AED",
        primary700: "#6D28D9"
    },
    red: {
        name: "Or Antique",
        primary: "#D4AF37",
        primary50: "#FEFBF3",
        primary100: "#FDF7E6",
        primary500: "#D4AF37",
        primary600: "#B8942E",
        primary700: "#9C7A26"
    },
    pink: {
        name: "Rose Pétale",
        primary: "#EC4899",
        primary50: "#FDF2F8",
        primary100: "#FCE7F3",
        primary500: "#EC4899",
        primary600: "#DB2777",
        primary700: "#BE185D"
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/providers/theme-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$theme$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/theme-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$theme$2d$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/theme-config.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function ThemeProvider({ children }) {
    _s();
    const { theme, accentColor } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$theme$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useThemeStore"])();
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "ThemeProvider.useEffect": ()=>{
            const root = document.documentElement;
            // Apply theme class
            root.classList.remove("light", "dark");
            root.classList.add(theme);
            // Apply accent color CSS variables
            const colors = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$theme$2d$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["themeColors"][accentColor];
            root.style.setProperty("--primary", colors.primary);
            root.style.setProperty("--primary-50", colors.primary50);
            root.style.setProperty("--primary-100", colors.primary100);
            root.style.setProperty("--primary-500", colors.primary500);
            root.style.setProperty("--primary-600", colors.primary600);
            root.style.setProperty("--primary-700", colors.primary700);
        }
    }["ThemeProvider.useEffect"], [
        theme,
        accentColor
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
_s(ThemeProvider, "Nwrko/C003mqY1EqGNhWYQL9qI0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$theme$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useThemeStore"]
    ];
});
_c = ThemeProvider;
var _c;
__turbopack_context__.k.register(_c, "ThemeProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_51d6dd37._.js.map