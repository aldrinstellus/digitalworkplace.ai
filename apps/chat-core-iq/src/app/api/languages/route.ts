import { NextRequest, NextResponse } from 'next/server';
import {
  getLanguageSettings,
  saveLanguageSettings,
  addAuditLog,
  LanguageSettings,
  LanguageConfig
} from '@/lib/data-store';

// GET - Fetch language configuration
export async function GET() {
  try {
    const settings = await getLanguageSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching language settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch language settings' },
      { status: 500 }
    );
  }
}

// PUT - Update entire language settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const settings: LanguageSettings = body;

    // Validate at least one language is enabled
    const enabledLanguages = settings.languages.filter(l => l.enabled);
    if (enabledLanguages.length === 0) {
      return NextResponse.json(
        { error: 'At least one language must be enabled' },
        { status: 400 }
      );
    }

    // Validate exactly one default language
    const defaultLanguages = settings.languages.filter(l => l.isDefault);
    if (defaultLanguages.length !== 1) {
      return NextResponse.json(
        { error: 'Exactly one language must be set as default' },
        { status: 400 }
      );
    }

    // Ensure default language is enabled
    const defaultLang = defaultLanguages[0];
    if (!defaultLang.enabled) {
      return NextResponse.json(
        { error: 'Default language must be enabled' },
        { status: 400 }
      );
    }

    // Update timestamps
    settings.languages = settings.languages.map(l => ({
      ...l,
      updatedAt: new Date().toISOString(),
    }));

    await saveLanguageSettings(settings);
    await addAuditLog('System', 'update', 'language-settings', 'all', {
      action: 'bulk_update',
      languageCount: settings.languages.length,
      enabledCount: enabledLanguages.length,
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating language settings:', error);
    return NextResponse.json(
      { error: 'Failed to update language settings' },
      { status: 500 }
    );
  }
}

// POST - Perform specific actions on languages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, language, languageCode } = body;

    const settings = await getLanguageSettings();

    switch (action) {
      case 'add': {
        // Add new language
        const newLang: LanguageConfig = {
          ...language,
          order: settings.languages.length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Check if language code already exists
        if (settings.languages.some(l => l.code === newLang.code)) {
          return NextResponse.json(
            { error: `Language with code '${newLang.code}' already exists` },
            { status: 400 }
          );
        }

        settings.languages.push(newLang);
        await saveLanguageSettings(settings);
        await addAuditLog('System', 'create', 'language', newLang.code, { name: newLang.name });
        break;
      }

      case 'update': {
        // Update existing language
        const idx = settings.languages.findIndex(l => l.code === language.code);
        if (idx === -1) {
          return NextResponse.json(
            { error: `Language '${language.code}' not found` },
            { status: 404 }
          );
        }

        settings.languages[idx] = {
          ...settings.languages[idx],
          ...language,
          updatedAt: new Date().toISOString(),
        };
        await saveLanguageSettings(settings);
        await addAuditLog('System', 'update', 'language', language.code, { name: language.name });
        break;
      }

      case 'delete': {
        // Delete language (cannot delete if it's the only enabled one or if it's default)
        const langToDelete = settings.languages.find(l => l.code === languageCode);
        if (!langToDelete) {
          return NextResponse.json(
            { error: `Language '${languageCode}' not found` },
            { status: 404 }
          );
        }

        if (langToDelete.isDefault) {
          return NextResponse.json(
            { error: 'Cannot delete the default language. Set another language as default first.' },
            { status: 400 }
          );
        }

        const enabledCount = settings.languages.filter(l => l.enabled).length;
        if (langToDelete.enabled && enabledCount <= 1) {
          return NextResponse.json(
            { error: 'Cannot delete the only enabled language' },
            { status: 400 }
          );
        }

        settings.languages = settings.languages.filter(l => l.code !== languageCode);
        await saveLanguageSettings(settings);
        await addAuditLog('System', 'delete', 'language', languageCode, { name: langToDelete.name });
        break;
      }

      case 'setDefault': {
        // Set a language as default
        const langToSetDefault = settings.languages.find(l => l.code === languageCode);
        if (!langToSetDefault) {
          return NextResponse.json(
            { error: `Language '${languageCode}' not found` },
            { status: 404 }
          );
        }

        if (!langToSetDefault.enabled) {
          return NextResponse.json(
            { error: 'Cannot set a disabled language as default' },
            { status: 400 }
          );
        }

        settings.languages = settings.languages.map(l => ({
          ...l,
          isDefault: l.code === languageCode,
          updatedAt: new Date().toISOString(),
        }));
        settings.fallbackLanguage = languageCode;
        await saveLanguageSettings(settings);
        await addAuditLog('System', 'update', 'language', languageCode, { action: 'set_default' });
        break;
      }

      case 'toggle': {
        // Toggle language enabled/disabled
        const langToToggle = settings.languages.find(l => l.code === languageCode);
        if (!langToToggle) {
          return NextResponse.json(
            { error: `Language '${languageCode}' not found` },
            { status: 404 }
          );
        }

        // Cannot disable the default language
        if (langToToggle.isDefault && langToToggle.enabled) {
          return NextResponse.json(
            { error: 'Cannot disable the default language. Set another language as default first.' },
            { status: 400 }
          );
        }

        // Cannot disable if it's the only enabled language
        const enabledCount = settings.languages.filter(l => l.enabled).length;
        if (langToToggle.enabled && enabledCount <= 1) {
          return NextResponse.json(
            { error: 'Cannot disable the only enabled language' },
            { status: 400 }
          );
        }

        settings.languages = settings.languages.map(l =>
          l.code === languageCode
            ? { ...l, enabled: !l.enabled, updatedAt: new Date().toISOString() }
            : l
        );
        await saveLanguageSettings(settings);
        await addAuditLog('System', 'update', 'language', languageCode, {
          action: 'toggle',
          enabled: !langToToggle.enabled,
        });
        break;
      }

      case 'reorder': {
        // Reorder languages
        const { order } = body; // Array of language codes in new order
        if (!Array.isArray(order)) {
          return NextResponse.json(
            { error: 'Order must be an array of language codes' },
            { status: 400 }
          );
        }

        settings.languages = settings.languages.map(l => ({
          ...l,
          order: order.indexOf(l.code) + 1,
          updatedAt: new Date().toISOString(),
        })).sort((a, b) => a.order - b.order);

        await saveLanguageSettings(settings);
        await addAuditLog('System', 'update', 'language-settings', 'all', { action: 'reorder' });
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    const updatedSettings = await getLanguageSettings();
    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error('Error performing language action:', error);
    return NextResponse.json(
      { error: 'Failed to perform language action' },
      { status: 500 }
    );
  }
}
