/*!
 * websitesettings.js — local stub for the dCQ Doral mirror.
 *
 * The original City of Doral / Granicus OpenCities CMS serves this file
 * from a per-instance ocapi endpoint that is not part of our scrape. Without
 * it, downstream scripts crash with `Cannot read properties of undefined
 * (reading 'AddressPickerVariables' / 'Application' / 'LanguageSettings' /
 * 'GroupName')`, which in turn freezes the "Doral By The Numbers" animated
 * counters at 0.
 *
 * This stub initializes the minimal globals the bundled jQuery code expects,
 * so the cascade stops. No business logic is intended — features that depend
 * on real config (address autocomplete, etc.) will degrade gracefully.
 *
 * Counter fallback: even if the Granicus animation script never runs (because
 * it depends on properties we can't supply), an event listener at the end of
 * this file paints each `[data-number]` element with its raw value so the
 * "By The Numbers" stats render real numbers instead of 0.
 */
(function (root, doc) {
    "use strict";

    // ---------------------------------------------------------------
    // Defensive Proxy — Granicus's minified bundle reads OpenCities
    // settings via paths we can't fully enumerate without source maps.
    // This Proxy returns a permissive default for any property access,
    // any method call, and any nested chain, so the bundle never trips
    // on "Cannot read properties of undefined (reading X)".
    // ---------------------------------------------------------------
    function makeSafeDefault() {
        var fn = function () { return makeSafeDefault(); };
        return new Proxy(fn, {
            get: function (target, prop) {
                if (prop === Symbol.toPrimitive) return function () { return ""; };
                if (prop === "toString" || prop === "valueOf") return function () { return ""; };
                if (prop === Symbol.iterator) return undefined;
                if (prop === "length") return 0;
                if (prop === "then") return undefined; // not a thenable
                return makeSafeDefault();
            },
            apply: function () { return makeSafeDefault(); },
            has: function () { return true; },
        });
    }

    var OpenCities = root.OpenCities = root.OpenCities || {};

    // The Granicus bundled JS doesn't have source maps, so we don't know the
    // exact lookup paths it tries. The defensive strategy: scaffold the same
    // empty-object placeholders at every reasonable parent location. Cheap
    // (a few KB of `{}` literals) and totally robust to whichever path the
    // minified code happens to walk.
    var emptyLang = { DefaultCulture: "en-US", Languages: [], LanguageSettings: { DefaultCulture: "en-US" } };
    var emptyGroup = { GroupName: "", GroupId: "", Groups: [] };

    // Path: OpenCities.Settings.*
    var S = OpenCities.Settings = OpenCities.Settings || {};
    S.AddressPickerVariables = S.AddressPickerVariables || {};
    S.WebsiteSettings        = S.WebsiteSettings        || { LanguageSettings: emptyLang, GroupName: "", GroupSettings: emptyGroup };
    S.SiteConfig             = S.SiteConfig             || { LanguageSettings: emptyLang };
    S.Localization           = S.Localization           || { Culture: "en-US", LanguageSettings: emptyLang };
    S.LanguageSettings       = S.LanguageSettings       || emptyLang;
    S.GroupSettings          = S.GroupSettings          || emptyGroup;
    S.GroupName              = S.GroupName              || "";
    S.ApiBaseUrl             = S.ApiBaseUrl             || "";
    S.SiteId                 = S.SiteId                 || "";
    S.CultureName            = S.CultureName            || "en-US";
    S.MapSettings            = S.MapSettings            || {};
    S.FormSettings           = S.FormSettings           || {};
    S.SearchSettings         = S.SearchSettings         || {};
    S.FeatureFlags           = S.FeatureFlags           || {};

    // Path: OpenCities.*
    OpenCities.Application      = OpenCities.Application      || { LanguageSettings: emptyLang, GroupName: "" };
    OpenCities.LanguageSettings = OpenCities.LanguageSettings || emptyLang;
    OpenCities.GroupSettings    = OpenCities.GroupSettings    || emptyGroup;
    OpenCities.GroupName        = OpenCities.GroupName        || "";

    // Path: window.* (top-level globals)
    root.Application      = root.Application      || OpenCities.Application;
    root.LanguageSettings = root.LanguageSettings || emptyLang;
    root.GroupSettings    = root.GroupSettings    || emptyGroup;
    root.GroupName        = root.GroupName        || "";

    // Belt-and-suspenders: trap remaining undefined-property accesses on
    // OpenCities and Application via a Proxy that lazily returns safe
    // defaults. Stops the lingering "Cannot read properties of undefined"
    // errors emitted by megabundled Granicus modules whose lookup paths
    // we can't trace without source maps.
    try {
        var rawOC = OpenCities;
        root.OpenCities = new Proxy(rawOC, {
            get: function (t, p) {
                if (p in t) return t[p];
                return makeSafeDefault();
            },
        });
        var rawApp = OpenCities.Application;
        OpenCities.Application = root.Application = new Proxy(rawApp, {
            get: function (t, p) {
                if (p in t) return t[p];
                return makeSafeDefault();
            },
        });
    } catch (_) {
        // Old browsers without Proxy support — fallback to plain objects.
    }

    // No-op helper hooks the original config may have exposed.
    S.getValue = S.getValue || function () { return null; };
    S.isFeatureEnabled = S.isFeatureEnabled || function () { return false; };

    // ---------------------------------------------------------------
    // Counter fallback — paint [data-number] elements with their real
    // values once the DOM is parsed, in case the Granicus animation
    // script never runs.
    // ---------------------------------------------------------------
    function paintCounters() {
        var nodes = doc.querySelectorAll("[data-number]");
        for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            // Skip if Granicus has already animated to a non-zero value.
            var current = (el.textContent || "").replace(/[^0-9]/g, "");
            if (current && current !== "0") continue;
            var before = el.getAttribute("data-symbol-before") || "";
            var num    = el.getAttribute("data-number") || "0";
            var after  = el.getAttribute("data-symbol-after") || "";
            el.textContent = before + num + after;
        }
    }
    if (doc.readyState === "loading") {
        doc.addEventListener("DOMContentLoaded", paintCounters);
    } else {
        paintCounters();
    }
    // Re-paint after a short delay too, in case Granicus zeroed them out
    // before its animation aborted on an undefined property.
    if (root.setTimeout) {
        root.setTimeout(paintCounters, 1500);
    }
}(window, document));
