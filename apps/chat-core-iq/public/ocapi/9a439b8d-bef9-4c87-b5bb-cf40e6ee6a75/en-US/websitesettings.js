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

    var OpenCities = root.OpenCities = root.OpenCities || {};

    // Core settings bag — Granicus templates dereference deep keys, so we
    // pre-allocate them as empty objects rather than leaving them undefined.
    var S = OpenCities.Settings = OpenCities.Settings || {};
    S.AddressPickerVariables = S.AddressPickerVariables || {};
    S.WebsiteSettings        = S.WebsiteSettings        || {};
    S.SiteConfig             = S.SiteConfig             || {};
    S.Localization           = S.Localization           || { Culture: "en-US" };
    S.LanguageSettings       = S.LanguageSettings       || { DefaultCulture: "en-US", Languages: [] };
    S.GroupSettings          = S.GroupSettings          || { GroupName: "" };
    S.ApiBaseUrl             = S.ApiBaseUrl             || "";
    S.SiteId                 = S.SiteId                 || "";
    S.CultureName            = S.CultureName            || "en-US";
    S.MapSettings            = S.MapSettings            || {};
    S.FormSettings           = S.FormSettings           || {};
    S.SearchSettings         = S.SearchSettings         || {};
    S.FeatureFlags           = S.FeatureFlags           || {};

    // Some templates reference top-level Application + helpers.
    OpenCities.Application = OpenCities.Application || {};
    root.Application       = root.Application       || OpenCities.Application;
    root.GroupName         = root.GroupName         || "";

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
