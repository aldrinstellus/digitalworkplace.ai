var langCookies;

function getCurrentLanguageOption(selector) {
    var currentLanguageOption = $(selector).filter(function () {
        var language = $(this).attr("data-translate-to").toLowerCase();
        var userSelectedLang = OpenCities.Settings.Application.LanguageSettings.UserLanguage.toLowerCase();
        return language == userSelectedLang || language.startsWith(userSelectedLang) || userSelectedLang.startsWith(language);
    });

    if (currentLanguageOption && currentLanguageOption.length > 0) {
        return currentLanguageOption[0];
    }
    else {
        return null;
    }
}

function updateUserSelectedLanguageText() {
    var currentLanguage = getCurrentLanguageOption(".toolbar-language-drop-down a");
    if (currentLanguage) {
        $(currentLanguage).find("span.visuallyhidden").remove(); // remove "Select this as your...", to get just the language display text
        var languageText = $(currentLanguage).text();
        $(".toolbar-button-language .current-language").text(languageText);
        $(".toolbar-button-language").append("<span class=\"visuallyhidden\"> is your current preferred language.</span>");

                
        $(currentLanguage).remove();
        // Handling scenario where only one language is added to LanguageSelector control. 
        if ($('.toolbar-language-drop-down ul li a').length == 0) {
            $('.toolbar-button-language').prop('disabled', true);
            $('.toolbar-button-language i').remove()
            $('.toolbar-language-drop-down').remove();
        }
    }

    currentLanguage = getCurrentLanguageOption(".toolbar-language-links a");
    if (currentLanguage) {
        $(currentLanguage).find("span.visuallyhidden").remove(); // remove "Select this as your...", to get just the language display text
        var languageCode = $(currentLanguage).attr("data-translate-to");
        var languageText = $(currentLanguage).text();
        var currentLanguagelink = $(".toolbar-language-links").find(".lang-" + languageCode);
        var currentLanguageSpan = $("<span class=\"lang-item current-language\"></span>");
        currentLanguageSpan.addClass("lang-" + languageCode);
        currentLanguageSpan.attr("lang", currentLanguagelink.attr("lang"));
        currentLanguageSpan.append(languageText + "<span class=\"visuallyhidden\"> is your current preferred language.</span>");
        currentLanguagelink.replaceWith(currentLanguageSpan);
    }
}

function googleTranslateElementInit() {
    var pageLang = OpenCities.Settings.Application.LanguageSettings.PageLanguage;
    if (pageLang !== 'zh-CN' && pageLang !== 'zh-TW') {
        pageLang = pageLang.split('-')[0];
    }
    var userLang = OpenCities.Settings.Application.LanguageSettings.UserLanguage;
    if (userLang !== 'zh-CN' && userLang !== 'zh-TW') {
        userLang = userLang.split('-')[0];
    }
    var alwaysRun = OpenCities.Settings.Application.LanguageSettings.Always;
    var runTranslate = true;
    if (!alwaysRun) {
        runTranslate = false;
        var checkLang = $('html').attr('lang').split('-')[0];
        $("*[lang]").each(function () {
            var newLang = $(this).attr('lang').split('-')[0];
            if (checkLang !== newLang) {
                runTranslate = true;
                return false;
            }
        });
    }
    if (!runTranslate) {
        return;
    }
    new google.translate.TranslateElement(
        {
            pageLanguage: pageLang,
            includedLanguages: userLang,
            layout: google.translate.TranslateElement.FloatPosition.TOP_LEFT, multilanguagePage: true
        },
        'google_translate_element');
    $('.toolbar-language .current-language').addClass('google-translate-language');
    // Update match height after google translate runs
    setTimeout(function () { $.fn.matchHeight._update(); }, 2000);
}

$(function () {
    updateUserSelectedLanguageText();
    if (OpenCities.Settings.Application.LanguageSettings.InjectGoogleTranslate) {
        var script = document.createElement('script');
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.head.appendChild(script);
    }
});