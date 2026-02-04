import { ChatLink, PersonaType } from './types';
import { getPersonaData } from './persona-data';

const MAX_LINKS = 5;

interface ResolveLinksParams {
  responseText: string;
  sources: { title: string; type: string; similarity: number }[];
  persona: PersonaType;
}

export function resolveLinks({ responseText, sources, persona }: ResolveLinksParams): ChatLink[] {
  const personaData = getPersonaData(persona);
  const featureMap = new Map(personaData.features.map(f => [f.name.toLowerCase(), f]));
  const categorySet = new Set(personaData.features.map(f => f.category));

  const links = new Map<string, ChatLink>();

  // Strategy 1: Bold text extraction — match **Feature Name** against persona features
  const boldMatches = responseText.matchAll(/\*\*(.*?)\*\*/g);
  for (const match of boldMatches) {
    const text = match[1].trim();
    const textLower = text.toLowerCase();

    // Check for exact feature match
    const feature = featureMap.get(textLower);
    if (feature) {
      const key = `feature:${feature.id}`;
      if (!links.has(key)) {
        links.set(key, {
          id: key,
          target: 'feature',
          entityId: feature.id,
          label: feature.name,
          description: `Coverage: ${feature.coverage}%, Risk: ${feature.riskScore}`,
          page: 'dashboard',
          persona,
        });
      }
      continue;
    }

    // Check for category match
    for (const cat of categorySet) {
      if (cat.toLowerCase() === textLower) {
        const key = `category:${cat}`;
        if (!links.has(key)) {
          const catFeatures = personaData.features.filter(f => f.category === cat);
          const avgCoverage = Math.round(catFeatures.reduce((s, f) => s + f.coverage, 0) / catFeatures.length);
          links.set(key, {
            id: key,
            target: 'category',
            entityId: cat,
            label: cat,
            description: `${catFeatures.length} features, ${avgCoverage}% avg coverage`,
            page: 'dashboard',
            persona,
          });
        }
        break;
      }
    }
  }

  // Strategy 2: Source-based — map RAG source types to links
  for (const source of sources) {
    if (links.size >= MAX_LINKS) break;

    if (source.type === 'feature') {
      const feature = personaData.features.find(f => f.name.toLowerCase() === source.title.toLowerCase());
      if (feature) {
        const key = `feature:${feature.id}`;
        if (!links.has(key)) {
          links.set(key, {
            id: key,
            target: 'feature',
            entityId: feature.id,
            label: feature.name,
            description: `Coverage: ${feature.coverage}%, Risk: ${feature.riskScore}`,
            page: 'dashboard',
            persona,
          });
        }
      }
    } else if (source.type === 'category_summary') {
      const catName = source.title.replace(/ Summary$/i, '').replace(/ Category$/i, '');
      if (categorySet.has(catName)) {
        const key = `category:${catName}`;
        if (!links.has(key)) {
          const catFeatures = personaData.features.filter(f => f.category === catName);
          const avgCoverage = Math.round(catFeatures.reduce((s, f) => s + f.coverage, 0) / catFeatures.length);
          links.set(key, {
            id: key,
            target: 'category',
            entityId: catName,
            label: catName,
            description: `${catFeatures.length} features, ${avgCoverage}% avg coverage`,
            page: 'dashboard',
            persona,
          });
        }
      }
    } else if (source.type === 'persona_kpi') {
      const key = `metric:${source.title}`;
      if (!links.has(key)) {
        links.set(key, {
          id: key,
          target: 'metric',
          entityId: source.title,
          label: source.title,
          description: 'View metric details',
          page: 'dashboard',
          persona,
        });
      }
    }
  }

  // Strategy 3: Keyword detection
  const lower = responseText.toLowerCase();

  if (links.size < MAX_LINKS && (lower.includes('test run') || lower.includes('test report') || lower.includes('test execution'))) {
    const key = 'report:test-reports';
    if (!links.has(key)) {
      links.set(key, {
        id: key,
        target: 'report',
        entityId: 'test-reports',
        label: 'Test Reports',
        description: 'View test execution history',
        page: 'reports',
        persona,
      });
    }
  }

  if (links.size < MAX_LINKS && (lower.includes('trend') || lower.includes('history') || lower.includes('30-day') || lower.includes('30 day'))) {
    const key = 'history:performance';
    if (!links.has(key)) {
      links.set(key, {
        id: key,
        target: 'history',
        entityId: 'performance',
        label: 'Performance History',
        description: 'View 30-day metric trends',
        page: 'history',
        persona,
      });
    }
  }

  // Cap and return
  return Array.from(links.values()).slice(0, MAX_LINKS);
}
