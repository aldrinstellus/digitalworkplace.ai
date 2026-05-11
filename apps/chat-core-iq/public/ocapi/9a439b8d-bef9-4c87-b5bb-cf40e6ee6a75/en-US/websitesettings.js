/*!
 * websitesettings.js — local stub for the dCQ Doral mirror.
 *
 * The original City of Doral / Granicus OpenCities CMS serves this file
 * from a per-instance ocapi endpoint that is not part of our scrape. Without
 * it, downstream scripts crash with `Cannot read properties of undefined
 * (reading 'AddressPickerVariables')` / `(reading 'Application')`, which in
 * turn freezes the "Doral By The Numbers" animated counters at 0.
 *
 * This stub initializes the minimal globals the bundled jQuery code expects,
 * so the cascade stops. No business logic is intended — features that depend
 * on real config (address autocomplete, etc.) will degrade gracefully.
 */
(function (root) {
    "use strict";

    var OpenCities = root.OpenCities = root.OpenCities || {};

    // Core settings bag — Granicus templates dereference deep keys, so we
    // pre-allocate them as empty objects rather than leaving them undefined.
    OpenCities.Settings = OpenCities.Settings || {};
    OpenCities.Settings.AddressPickerVariables = OpenCities.Settings.AddressPickerVariables || {};
    OpenCities.Settings.WebsiteSettings = OpenCities.Settings.WebsiteSettings || {};
    OpenCities.Settings.SiteConfig = OpenCities.Settings.SiteConfig || {};
    OpenCities.Settings.Localization = OpenCities.Settings.Localization || { Culture: "en-US" };

    // Some templates reference a top-level Application object.
    OpenCities.Application = OpenCities.Application || {};
    root.Application = root.Application || OpenCities.Application;

    // No-op helper hooks the original config may have exposed.
    OpenCities.Settings.getValue = function () { return null; };
    OpenCities.Settings.isFeatureEnabled = function () { return false; };
}(window));
