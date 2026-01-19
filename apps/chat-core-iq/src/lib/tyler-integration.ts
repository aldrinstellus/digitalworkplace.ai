/**
 * Tyler Technologies Integration Service
 *
 * Simulates integration with Tyler Enterprise Suite:
 * - iasWorld: Property Assessment & Tax Management
 * - Eagle: Land Records & Document Management
 * - EnerGov: Permitting & Code Enforcement
 * - Munis: Financial Management
 *
 * This is a demonstration module showing the full potential
 * of Tyler integration for municipal chatbots.
 */

import { promises as fs } from 'fs';
import path from 'path';

// =============================================================================
// TYPES
// =============================================================================

export interface TylerProperty {
  folio: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    formatted: string;
  };
  parcel: {
    legalDescription: string;
    subdivision: string;
    platBook: string;
    platPage: string;
    lot?: string;
    block?: string;
    unit?: string;
    acres: number;
    sqft: number;
  };
  ownership: {
    current: {
      name: string;
      mailingAddress: string;
      ownershipType: string;
      acquisitionDate: string;
      acquisitionPrice?: number;
      deedBook?: string;
      deedPage?: string;
      deedType?: string;
    };
    history?: Array<{
      name: string;
      fromDate: string;
      toDate: string;
      salePrice?: number;
    }>;
  };
  building: {
    yearBuilt: number;
    effectiveYear?: number;
    buildingType: string;
    constructionType?: string;
    roofType?: string;
    stories: number;
    bedrooms?: number;
    bathrooms?: number;
    livingArea?: number;
    totalArea: number;
    garageSpaces?: number;
    poolType?: string;
    features?: string[];
    [key: string]: unknown;
  };
  assessment: {
    currentYear: number;
    landValue?: number;
    buildingValue?: number;
    totalMarketValue: number;
    assessedValue?: number;
    taxableValue: number;
    exemptions?: Array<{
      type: string;
      amount: number | string;
      status: string;
    }>;
    history?: Array<{
      year: number;
      marketValue: number;
      assessedValue: number;
    }>;
  };
  taxes: {
    currentYear?: number;
    annualAmount?: number;
    status: string;
    paidDate?: string;
    dueDate?: string;
    delinquentSince?: string;
    penaltyAmount?: number;
    totalDue?: number;
    breakdown?: Array<{
      authority: string;
      amount: number;
      millageRate?: number;
    }>;
    history?: Array<{
      year: number;
      amount: number;
      status: string;
    }>;
  };
  zoning: {
    code: string;
    description: string;
    futureUse?: string;
    overlay?: string | null;
    restrictions?: string[];
  };
  permits: {
    active: TylerPermit[];
    completed: TylerPermit[];
  };
  liens: TylerLien[];
  codeViolations: TylerViolation[];
}

export interface TylerPermit {
  number: string;
  type: string;
  status: string;
  issuedDate?: string;
  submittedDate?: string;
  finaledDate?: string;
  contractor?: string;
  value?: number;
  estimatedValue?: number;
  inspections?: Array<{
    type: string;
    date?: string;
    scheduledDate?: string;
    result: string;
  }>;
}

export interface TylerLien {
  type: string;
  amount: number;
  filedDate: string;
  creditor: string;
  status: string;
  caseNumber: string;
  description: string;
}

export interface TylerViolation {
  number: string;
  type: string;
  description: string;
  status: string;
  issuedDate: string;
  complianceDeadline: string;
  inspector: string;
  fineAmount: number;
  notes: string;
}

export interface TylerQueryResult {
  success: boolean;
  queryType: TylerQueryType;
  property?: TylerProperty;
  formattedResponse: string;
  sources: string[];
  relatedActions?: TylerAction[];
}

export interface TylerAction {
  label: string;
  type: 'link' | 'workflow' | 'info';
  url?: string;
  workflowId?: string;
}

export type TylerQueryType =
  | 'property-lookup'
  | 'ownership-info'
  | 'tax-information'
  | 'permit-history'
  | 'liens-encumbrances'
  | 'code-violations'
  | 'zoning-info'
  | 'comprehensive-report'
  | 'not-tyler-related';

interface TylerMockData {
  metadata: {
    system: string;
    modules: string[];
    lastSync: string;
    jurisdiction: string;
  };
  properties: Record<string, TylerProperty>;
  searchIndex: {
    byAddress: Record<string, string>;
    byOwner: Record<string, string[]>;
  };
}

// =============================================================================
// QUERY DETECTION PATTERNS
// =============================================================================

const TYLER_QUERY_PATTERNS: Record<TylerQueryType, RegExp[]> = {
  'property-lookup': [
    /property\s*(info|information|details|record)/i,
    /look\s*up\s*(property|address|folio)/i,
    /who\s*owns/i,
    /owner\s*(of|for|at)/i,
    /find\s*(property|owner)/i,
    /search\s*(property|land|parcel)/i,
    /folio\s*(number|#)?:?\s*[\d-]+/i,
  ],
  'ownership-info': [
    /who\s*owns/i,
    /owner(ship)?\s*(info|information|history|details)/i,
    /deed\s*(info|history|record)/i,
    /title\s*(search|history|info)/i,
    /when\s*(was|did).*purchase/i,
    /sale\s*history/i,
    /transfer\s*history/i,
  ],
  'tax-information': [
    /property\s*tax(es)?/i,
    /tax\s*(bill|amount|info|status|payment)/i,
    /how\s*much.*tax/i,
    /pay\s*(my\s*)?tax/i,
    /delinquent\s*tax/i,
    /millage/i,
    /assessed\s*value/i,
    /exemption/i,
    /homestead/i,
  ],
  'permit-history': [
    /permit(s)?\s*(for|at|history|status)/i,
    /building\s*permit/i,
    /construction\s*permit/i,
    /active\s*permit/i,
    /inspection\s*status/i,
    /renovation\s*permit/i,
    /what\s*(permit|work).*done/i,
  ],
  'liens-encumbrances': [
    /lien(s)?/i,
    /encumbrance/i,
    /mortgage/i,
    /judgment/i,
    /owed\s*on/i,
    /debt\s*on/i,
    /contractor.*lien/i,
    /mechanic.*lien/i,
  ],
  'code-violations': [
    /code\s*violation/i,
    /violation(s)?/i,
    /code\s*enforcement/i,
    /compliance\s*(issue|status)/i,
    /citation/i,
    /fine(s)?\s*(on|at|for)/i,
  ],
  'zoning-info': [
    /zoning\s*(info|code|designation)/i,
    /what.*zone/i,
    /land\s*use/i,
    /building\s*restriction/i,
    /setback/i,
    /lot\s*coverage/i,
    /height\s*restriction/i,
  ],
  'comprehensive-report': [
    /full\s*(property\s*)?report/i,
    /complete\s*(property\s*)?report/i,
    /comprehensive\s*report/i,
    /everything\s*(about|on)/i,
    /all\s*(info|information|details)/i,
    /full\s*spectrum/i,
    /entire\s*record/i,
  ],
  'not-tyler-related': [],
};

// =============================================================================
// DATA LOADING
// =============================================================================

let tylerData: TylerMockData | null = null;

async function loadTylerData(): Promise<TylerMockData> {
  if (tylerData) return tylerData;

  try {
    const filePath = path.join(process.cwd(), 'data', 'tyler-mock-data.json');
    const data = await fs.readFile(filePath, 'utf-8');
    tylerData = JSON.parse(data);
    console.log('[Tyler] Mock data loaded successfully');
    return tylerData!;
  } catch (error) {
    console.error('[Tyler] Failed to load mock data:', error);
    throw new Error('Tyler integration data unavailable');
  }
}

// =============================================================================
// QUERY DETECTION
// =============================================================================

export function detectTylerQuery(message: string): TylerQueryType {
  const normalizedMessage = message.toLowerCase().trim();

  // Check for comprehensive report first (highest priority)
  for (const pattern of TYLER_QUERY_PATTERNS['comprehensive-report']) {
    if (pattern.test(normalizedMessage)) {
      return 'comprehensive-report';
    }
  }

  // Check other patterns in order of specificity
  const queryTypes: TylerQueryType[] = [
    'liens-encumbrances',
    'code-violations',
    'permit-history',
    'tax-information',
    'zoning-info',
    'ownership-info',
    'property-lookup',
  ];

  for (const queryType of queryTypes) {
    for (const pattern of TYLER_QUERY_PATTERNS[queryType]) {
      if (pattern.test(normalizedMessage)) {
        return queryType;
      }
    }
  }

  return 'not-tyler-related';
}

export function extractAddressOrFolio(message: string): { type: 'address' | 'folio'; value: string } | null {
  // Check for folio pattern
  const folioMatch = message.match(/(?:folio\s*(?:number|#)?:?\s*)?(35-\d{4}-\d{3}-\d{4})/i);
  if (folioMatch) {
    return { type: 'folio', value: folioMatch[1] };
  }

  // Check for address pattern
  const addressMatch = message.match(/(\d{3,5}\s+(?:NW|NE|SW|SE)?\s*\d+(?:st|nd|rd|th)?\s+(?:street|st|avenue|ave|terrace|ter|court|ct|drive|dr|boulevard|blvd|road|rd|way|lane|ln|place|pl))/i);
  if (addressMatch) {
    return { type: 'address', value: addressMatch[1].toLowerCase().replace(/\s+/g, ' ').trim() };
  }

  return null;
}

// =============================================================================
// PROPERTY LOOKUP
// =============================================================================

export async function findProperty(query: { type: 'address' | 'folio'; value: string }): Promise<TylerProperty | null> {
  const data = await loadTylerData();

  if (query.type === 'folio') {
    return data.properties[query.value] || null;
  }

  // Search by address
  const normalizedAddress = query.value.toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();
  const folio = data.searchIndex.byAddress[normalizedAddress];

  if (folio) {
    return data.properties[folio] || null;
  }

  // Fuzzy match
  for (const [addr, folioNum] of Object.entries(data.searchIndex.byAddress)) {
    if (addr.includes(normalizedAddress) || normalizedAddress.includes(addr)) {
      return data.properties[folioNum] || null;
    }
  }

  return null;
}

// =============================================================================
// RESPONSE FORMATTERS
// =============================================================================

function formatCurrency(amount: number | undefined): string {
  if (amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatOwnershipResponse(property: TylerProperty): string {
  const { ownership, address, folio } = property;
  let response = `**Property Ownership Record**\n\n`;
  response += `**Address:** ${address.formatted}\n`;
  response += `**Folio:** ${folio}\n\n`;

  response += `**Current Owner:**\n`;
  response += `- Name: ${ownership.current.name}\n`;
  response += `- Ownership Type: ${ownership.current.ownershipType}\n`;
  response += `- Acquired: ${formatDate(ownership.current.acquisitionDate)}\n`;
  if (ownership.current.acquisitionPrice) {
    response += `- Purchase Price: ${formatCurrency(ownership.current.acquisitionPrice)}\n`;
  }
  if (ownership.current.deedType) {
    response += `- Deed: ${ownership.current.deedType} (Book ${ownership.current.deedBook}, Page ${ownership.current.deedPage})\n`;
  }

  if (ownership.history && ownership.history.length > 0) {
    response += `\n**Ownership History:**\n`;
    for (const prev of ownership.history) {
      response += `- ${prev.name} (${prev.fromDate} to ${prev.toDate})`;
      if (prev.salePrice) response += ` - Sold for ${formatCurrency(prev.salePrice)}`;
      response += `\n`;
    }
  }

  return response;
}

function formatTaxResponse(property: TylerProperty): string {
  const { taxes, assessment, address, folio } = property;
  let response = `**Property Tax Information**\n\n`;
  response += `**Address:** ${address.formatted}\n`;
  response += `**Folio:** ${folio}\n\n`;

  response += `**${assessment.currentYear} Assessment:**\n`;
  if (assessment.landValue) response += `- Land Value: ${formatCurrency(assessment.landValue)}\n`;
  if (assessment.buildingValue) response += `- Building Value: ${formatCurrency(assessment.buildingValue)}\n`;
  response += `- Total Market Value: ${formatCurrency(assessment.totalMarketValue)}\n`;
  response += `- Taxable Value: ${formatCurrency(assessment.taxableValue)}\n`;

  if (assessment.exemptions && assessment.exemptions.length > 0) {
    response += `\n**Exemptions:**\n`;
    for (const ex of assessment.exemptions) {
      const amount = typeof ex.amount === 'number' ? formatCurrency(ex.amount) : ex.amount;
      response += `- ${ex.type}: ${amount} (${ex.status})\n`;
    }
  }

  response += `\n**${taxes.currentYear || 'Current'} Tax Bill:**\n`;
  response += `- Annual Amount: ${formatCurrency(taxes.annualAmount)}\n`;
  response += `- Status: **${taxes.status}**\n`;

  if (taxes.status === 'DELINQUENT') {
    response += `- Delinquent Since: ${formatDate(taxes.delinquentSince)}\n`;
    response += `- Penalty: ${formatCurrency(taxes.penaltyAmount)}\n`;
    response += `- **Total Due: ${formatCurrency(taxes.totalDue)}**\n`;
  } else if (taxes.status === 'PAID' && taxes.paidDate) {
    response += `- Paid Date: ${formatDate(taxes.paidDate)}\n`;
  } else if (taxes.status === 'PENDING' && taxes.dueDate) {
    response += `- Due Date: ${formatDate(taxes.dueDate)}\n`;
  }

  if (taxes.breakdown && taxes.breakdown.length > 0) {
    response += `\n**Tax Breakdown:**\n`;
    for (const item of taxes.breakdown) {
      response += `- ${item.authority}: ${formatCurrency(item.amount)}`;
      if (item.millageRate) response += ` (${item.millageRate} mills)`;
      response += `\n`;
    }
  }

  return response;
}

function formatPermitResponse(property: TylerProperty): string {
  const { permits, address, folio } = property;
  let response = `**Building Permit History**\n\n`;
  response += `**Address:** ${address.formatted}\n`;
  response += `**Folio:** ${folio}\n\n`;

  if (permits.active.length > 0) {
    response += `**Active Permits:**\n`;
    for (const permit of permits.active) {
      response += `\n- **${permit.number}** - ${permit.type}\n`;
      response += `  Status: ${permit.status}\n`;
      if (permit.issuedDate) response += `  Issued: ${formatDate(permit.issuedDate)}\n`;
      if (permit.submittedDate) response += `  Submitted: ${formatDate(permit.submittedDate)}\n`;
      if (permit.contractor) response += `  Contractor: ${permit.contractor}\n`;
      response += `  Value: ${formatCurrency(permit.value || permit.estimatedValue)}\n`;

      if (permit.inspections && permit.inspections.length > 0) {
        response += `  Inspections:\n`;
        for (const insp of permit.inspections) {
          const date = insp.date || insp.scheduledDate;
          response += `    - ${insp.type}: ${insp.result} (${formatDate(date)})\n`;
        }
      }
    }
  } else {
    response += `**Active Permits:** None\n`;
  }

  if (permits.completed.length > 0) {
    response += `\n**Completed Permits:**\n`;
    for (const permit of permits.completed) {
      response += `- **${permit.number}** - ${permit.type}\n`;
      response += `  Finaled: ${formatDate(permit.finaledDate)}\n`;
      if (permit.contractor) response += `  Contractor: ${permit.contractor}\n`;
      response += `  Value: ${formatCurrency(permit.value)}\n\n`;
    }
  } else {
    response += `\n**Completed Permits:** None on record\n`;
  }

  return response;
}

function formatLiensResponse(property: TylerProperty): string {
  const { liens, address, folio } = property;
  let response = `**Liens & Encumbrances**\n\n`;
  response += `**Address:** ${address.formatted}\n`;
  response += `**Folio:** ${folio}\n\n`;

  if (liens.length === 0) {
    response += `**Status:** No liens or encumbrances found on this property.\n\n`;
    response += `This property appears to have a clear title with no outstanding claims.`;
  } else {
    response += `**Active Liens:**\n`;
    for (const lien of liens) {
      response += `\n- **${lien.type}**\n`;
      response += `  Case #: ${lien.caseNumber}\n`;
      response += `  Amount: ${formatCurrency(lien.amount)}\n`;
      response += `  Creditor: ${lien.creditor}\n`;
      response += `  Filed: ${formatDate(lien.filedDate)}\n`;
      response += `  Status: ${lien.status}\n`;
      response += `  Details: ${lien.description}\n`;
    }
  }

  return response;
}

function formatViolationsResponse(property: TylerProperty): string {
  const { codeViolations, address, folio } = property;
  let response = `**Code Compliance Status**\n\n`;
  response += `**Address:** ${address.formatted}\n`;
  response += `**Folio:** ${folio}\n\n`;

  if (codeViolations.length === 0) {
    response += `**Status:** No active code violations.\n\n`;
    response += `This property is in compliance with all codes.`;
  } else {
    response += `**Active Violations:**\n`;
    for (const viol of codeViolations) {
      response += `\n- **Case ${viol.number}** - ${viol.type}\n`;
      response += `  Description: ${viol.description}\n`;
      response += `  Status: ${viol.status}\n`;
      response += `  Issued: ${formatDate(viol.issuedDate)}\n`;
      response += `  Compliance Deadline: ${formatDate(viol.complianceDeadline)}\n`;
      response += `  Inspector: ${viol.inspector}\n`;
      if (viol.fineAmount > 0) response += `  Fine: ${formatCurrency(viol.fineAmount)}\n`;
      if (viol.notes) response += `  Notes: ${viol.notes}\n`;
    }
  }

  return response;
}

function formatZoningResponse(property: TylerProperty): string {
  const { zoning, parcel, address, folio } = property;
  let response = `**Zoning & Land Use Information**\n\n`;
  response += `**Address:** ${address.formatted}\n`;
  response += `**Folio:** ${folio}\n\n`;

  response += `**Zoning:**\n`;
  response += `- Code: ${zoning.code}\n`;
  response += `- Description: ${zoning.description}\n`;
  if (zoning.futureUse) response += `- Future Land Use: ${zoning.futureUse}\n`;
  if (zoning.overlay) response += `- Overlay District: ${zoning.overlay}\n`;

  if (zoning.restrictions && zoning.restrictions.length > 0) {
    response += `\n**Development Restrictions:**\n`;
    for (const restriction of zoning.restrictions) {
      response += `- ${restriction}\n`;
    }
  }

  response += `\n**Parcel Details:**\n`;
  response += `- Legal Description: ${parcel.legalDescription}\n`;
  response += `- Subdivision: ${parcel.subdivision}\n`;
  response += `- Plat Book/Page: ${parcel.platBook}-${parcel.platPage}\n`;
  if (parcel.lot) response += `- Lot: ${parcel.lot}\n`;
  if (parcel.block && parcel.block !== 'N/A') response += `- Block: ${parcel.block}\n`;
  response += `- Size: ${parcel.acres} acres (${parcel.sqft.toLocaleString()} sq ft)\n`;

  return response;
}

function formatPropertyLookupResponse(property: TylerProperty): string {
  const { building, address, folio, ownership, assessment } = property;
  let response = `**Property Information**\n\n`;
  response += `**Address:** ${address.formatted}\n`;
  response += `**Folio:** ${folio}\n\n`;

  response += `**Owner:** ${ownership.current.name}\n`;
  response += `**Property Type:** ${building.buildingType}\n\n`;

  response += `**Building Details:**\n`;
  response += `- Year Built: ${building.yearBuilt}\n`;
  if (building.constructionType) response += `- Construction: ${building.constructionType}\n`;
  response += `- Stories: ${building.stories}\n`;
  if (building.bedrooms) response += `- Bedrooms: ${building.bedrooms}\n`;
  if (building.bathrooms) response += `- Bathrooms: ${building.bathrooms}\n`;
  if (building.livingArea) response += `- Living Area: ${building.livingArea.toLocaleString()} sq ft\n`;
  response += `- Total Area: ${building.totalArea.toLocaleString()} sq ft\n`;
  if (building.garageSpaces) response += `- Garage: ${building.garageSpaces} spaces\n`;
  if (building.poolType) response += `- Pool: ${building.poolType}\n`;

  if (building.features && building.features.length > 0) {
    response += `\n**Features:** ${building.features.join(', ')}\n`;
  }

  response += `\n**Valuation:**\n`;
  response += `- Market Value: ${formatCurrency(assessment.totalMarketValue)}\n`;
  response += `- Taxable Value: ${formatCurrency(assessment.taxableValue)}\n`;

  return response;
}

function formatComprehensiveResponse(property: TylerProperty): string {
  let response = `# COMPREHENSIVE PROPERTY REPORT\n`;
  response += `## Tyler Technologies Enterprise Suite\n`;
  response += `---\n\n`;

  // Property Header
  response += `**Property Address:** ${property.address.formatted}\n`;
  response += `**Folio Number:** ${property.folio}\n`;
  response += `**Report Generated:** ${new Date().toLocaleString()}\n\n`;

  response += `---\n\n`;

  // Section 1: Ownership (Eagle)
  response += `### SECTION 1: OWNERSHIP RECORD\n`;
  response += `*Source: Tyler Eagle Land Records*\n\n`;
  response += `**Current Owner:** ${property.ownership.current.name}\n`;
  response += `**Mailing Address:** ${property.ownership.current.mailingAddress}\n`;
  response += `**Ownership Type:** ${property.ownership.current.ownershipType}\n`;
  response += `**Acquisition Date:** ${formatDate(property.ownership.current.acquisitionDate)}\n`;
  if (property.ownership.current.acquisitionPrice) {
    response += `**Purchase Price:** ${formatCurrency(property.ownership.current.acquisitionPrice)}\n`;
  }
  if (property.ownership.current.deedType) {
    response += `**Deed Information:** ${property.ownership.current.deedType} - Book ${property.ownership.current.deedBook}, Page ${property.ownership.current.deedPage}\n`;
  }

  if (property.ownership.history && property.ownership.history.length > 0) {
    response += `\n**Chain of Title:**\n`;
    for (const prev of property.ownership.history) {
      response += `- ${prev.name}: ${prev.fromDate} to ${prev.toDate}`;
      if (prev.salePrice) response += ` (Sale: ${formatCurrency(prev.salePrice)})`;
      response += `\n`;
    }
  }

  response += `\n---\n\n`;

  // Section 2: Property Details
  response += `### SECTION 2: PROPERTY DETAILS\n`;
  response += `*Source: Tyler iasWorld Assessment*\n\n`;
  response += `**Property Type:** ${property.building.buildingType}\n`;
  response += `**Year Built:** ${property.building.yearBuilt}\n`;
  if (property.building.constructionType) response += `**Construction:** ${property.building.constructionType}\n`;
  if (property.building.roofType) response += `**Roof Type:** ${property.building.roofType}\n`;
  response += `**Stories:** ${property.building.stories}\n`;
  if (property.building.bedrooms) response += `**Bedrooms:** ${property.building.bedrooms}\n`;
  if (property.building.bathrooms) response += `**Bathrooms:** ${property.building.bathrooms}\n`;
  if (property.building.livingArea) response += `**Living Area:** ${property.building.livingArea.toLocaleString()} sq ft\n`;
  response += `**Total Building Area:** ${property.building.totalArea.toLocaleString()} sq ft\n`;
  if (property.building.garageSpaces) response += `**Garage:** ${property.building.garageSpaces} car garage\n`;
  if (property.building.poolType) response += `**Pool:** ${property.building.poolType}\n`;
  if (property.building.features && property.building.features.length > 0) {
    response += `**Features:** ${property.building.features.join(', ')}\n`;
  }

  response += `\n**Parcel Information:**\n`;
  response += `- Legal: ${property.parcel.legalDescription}\n`;
  response += `- Subdivision: ${property.parcel.subdivision}\n`;
  response += `- Plat: Book ${property.parcel.platBook}, Page ${property.parcel.platPage}\n`;
  response += `- Size: ${property.parcel.acres} acres (${property.parcel.sqft.toLocaleString()} sq ft)\n`;

  response += `\n---\n\n`;

  // Section 3: Assessment & Taxes (iasWorld + Munis)
  response += `### SECTION 3: ASSESSMENT & TAXES\n`;
  response += `*Source: Tyler iasWorld + Munis*\n\n`;
  response += `**${property.assessment.currentYear} Valuation:**\n`;
  if (property.assessment.landValue) response += `- Land Value: ${formatCurrency(property.assessment.landValue)}\n`;
  if (property.assessment.buildingValue) response += `- Building Value: ${formatCurrency(property.assessment.buildingValue)}\n`;
  response += `- **Total Market Value: ${formatCurrency(property.assessment.totalMarketValue)}**\n`;
  if (property.assessment.assessedValue) response += `- Assessed Value: ${formatCurrency(property.assessment.assessedValue)}\n`;
  response += `- **Taxable Value: ${formatCurrency(property.assessment.taxableValue)}**\n`;

  if (property.assessment.exemptions && property.assessment.exemptions.length > 0) {
    response += `\n**Exemptions Applied:**\n`;
    for (const ex of property.assessment.exemptions) {
      const amt = typeof ex.amount === 'number' ? formatCurrency(ex.amount) : ex.amount;
      response += `- ${ex.type}: ${amt} (${ex.status})\n`;
    }
  }

  response += `\n**Tax Status:**\n`;
  if (property.taxes.annualAmount) {
    response += `- Annual Tax: ${formatCurrency(property.taxes.annualAmount)}\n`;
  }
  response += `- Payment Status: **${property.taxes.status}**\n`;
  if (property.taxes.status === 'DELINQUENT') {
    response += `- Delinquent Since: ${formatDate(property.taxes.delinquentSince)}\n`;
    response += `- Penalty: ${formatCurrency(property.taxes.penaltyAmount)}\n`;
    response += `- **TOTAL DUE: ${formatCurrency(property.taxes.totalDue)}**\n`;
  } else if (property.taxes.paidDate) {
    response += `- Paid: ${formatDate(property.taxes.paidDate)}\n`;
  }

  if (property.taxes.breakdown && property.taxes.breakdown.length > 0) {
    response += `\n**Tax Breakdown by Authority:**\n`;
    for (const item of property.taxes.breakdown) {
      response += `- ${item.authority}: ${formatCurrency(item.amount)}`;
      if (item.millageRate) response += ` (${item.millageRate} mills)`;
      response += `\n`;
    }
  }

  response += `\n---\n\n`;

  // Section 4: Zoning
  response += `### SECTION 4: ZONING & LAND USE\n`;
  response += `*Source: Planning Department*\n\n`;
  response += `**Zoning Code:** ${property.zoning.code}\n`;
  response += `**Zoning Description:** ${property.zoning.description}\n`;
  if (property.zoning.futureUse) response += `**Future Land Use:** ${property.zoning.futureUse}\n`;
  if (property.zoning.restrictions && property.zoning.restrictions.length > 0) {
    response += `**Development Restrictions:**\n`;
    for (const r of property.zoning.restrictions) {
      response += `- ${r}\n`;
    }
  }

  response += `\n---\n\n`;

  // Section 5: Permits (EnerGov)
  response += `### SECTION 5: PERMIT HISTORY\n`;
  response += `*Source: Tyler EnerGov*\n\n`;

  if (property.permits.active.length > 0) {
    response += `**Active Permits:**\n`;
    for (const p of property.permits.active) {
      response += `- **${p.number}** - ${p.type} (${p.status})\n`;
      if (p.contractor) response += `  Contractor: ${p.contractor}\n`;
      response += `  Value: ${formatCurrency(p.value || p.estimatedValue)}\n`;
    }
    response += `\n`;
  } else {
    response += `**Active Permits:** None\n\n`;
  }

  if (property.permits.completed.length > 0) {
    response += `**Completed Permits:**\n`;
    for (const p of property.permits.completed) {
      response += `- **${p.number}** - ${p.type} (Finaled: ${formatDate(p.finaledDate)})\n`;
      response += `  Value: ${formatCurrency(p.value)}\n`;
    }
    response += `\n`;
  } else {
    response += `**Completed Permits:** None on record\n\n`;
  }

  response += `---\n\n`;

  // Section 6: Liens
  response += `### SECTION 6: LIENS & ENCUMBRANCES\n`;
  response += `*Source: Tyler Eagle + County Clerk*\n\n`;

  if (property.liens.length === 0) {
    response += `**Status:** CLEAR - No liens or encumbrances on record.\n\n`;
  } else {
    response += `**Active Liens:**\n`;
    for (const l of property.liens) {
      response += `- **${l.type}** - ${formatCurrency(l.amount)}\n`;
      response += `  Creditor: ${l.creditor}\n`;
      response += `  Case: ${l.caseNumber}\n`;
      response += `  Status: ${l.status}\n`;
      response += `  Filed: ${formatDate(l.filedDate)}\n`;
      response += `  Details: ${l.description}\n\n`;
    }
  }

  response += `---\n\n`;

  // Section 7: Code Violations
  response += `### SECTION 7: CODE COMPLIANCE\n`;
  response += `*Source: Tyler EnerGov Code Enforcement*\n\n`;

  if (property.codeViolations.length === 0) {
    response += `**Status:** COMPLIANT - No active code violations.\n\n`;
  } else {
    response += `**Active Violations:**\n`;
    for (const v of property.codeViolations) {
      response += `- **Case ${v.number}** - ${v.type}\n`;
      response += `  ${v.description}\n`;
      response += `  Status: ${v.status}\n`;
      response += `  Deadline: ${formatDate(v.complianceDeadline)}\n`;
      if (v.fineAmount > 0) response += `  Fine: ${formatCurrency(v.fineAmount)}\n`;
      response += `  Notes: ${v.notes}\n\n`;
    }
  }

  response += `---\n\n`;
  response += `*This report was generated from Tyler Technologies Enterprise Suite.*`;

  return response;
}

// =============================================================================
// MAIN QUERY HANDLER
// =============================================================================

export async function handleTylerQuery(message: string): Promise<TylerQueryResult | null> {
  const queryType = detectTylerQuery(message);

  if (queryType === 'not-tyler-related') {
    return null;
  }

  const addressOrFolio = extractAddressOrFolio(message);

  if (!addressOrFolio) {
    return {
      success: false,
      queryType,
      formattedResponse: `I can help you with ${queryType.replace(/-/g, ' ')}. Please provide a property address or folio number.\n\n**Example queries:**\n- "Who owns 8350 NW 52nd Terrace?"\n- "Show taxes for folio 35-2014-001-0010"\n- "Permits at 10305 NW 41st Street"`,
      sources: ['Tyler Technologies Integration'],
      relatedActions: [
        { label: 'Search Property Records', type: 'link', url: 'https://www.miamidade.gov/pa/' },
        { label: 'Pay Property Taxes', type: 'link', url: 'https://miamidade.county-taxes.com/' },
      ],
    };
  }

  const property = await findProperty(addressOrFolio);

  if (!property) {
    return {
      success: false,
      queryType,
      formattedResponse: `I couldn't find a property record for "${addressOrFolio.value}".\n\nPlease verify the address or folio number and try again. You can also:\n- Check the Miami-Dade Property Appraiser website\n- Contact the Building Department for assistance`,
      sources: ['Tyler Technologies Integration'],
      relatedActions: [
        { label: 'Miami-Dade Property Search', type: 'link', url: 'https://www.miamidade.gov/pa/' },
      ],
    };
  }

  let formattedResponse: string;
  const sources: string[] = [];
  const relatedActions: TylerAction[] = [];

  switch (queryType) {
    case 'ownership-info':
      formattedResponse = formatOwnershipResponse(property);
      sources.push('Tyler Eagle Land Records', 'Miami-Dade Clerk of Courts');
      relatedActions.push(
        { label: 'View Recorded Documents', type: 'link', url: 'https://www.miamidade.gov/clerk/' },
        { label: 'Order Title Search', type: 'workflow', workflowId: 'title-search' },
      );
      break;

    case 'tax-information':
      formattedResponse = formatTaxResponse(property);
      sources.push('Tyler iasWorld Assessment', 'Tyler Munis Tax Billing', 'Miami-Dade Tax Collector');
      relatedActions.push(
        { label: 'Pay Property Taxes', type: 'link', url: 'https://miamidade.county-taxes.com/' },
        { label: 'Apply for Exemption', type: 'link', url: 'https://www.miamidade.gov/pa/exemptions.asp' },
      );
      break;

    case 'permit-history':
      formattedResponse = formatPermitResponse(property);
      sources.push('Tyler EnerGov Permitting', 'Building Department');
      relatedActions.push(
        { label: 'Apply for Permit', type: 'link', url: '#permits' },
        { label: 'Schedule Inspection', type: 'workflow', workflowId: 'inspection-schedule' },
      );
      break;

    case 'liens-encumbrances':
      formattedResponse = formatLiensResponse(property);
      sources.push('Tyler Eagle Land Records', 'Miami-Dade Clerk of Courts', 'Florida Lien Records');
      relatedActions.push(
        { label: 'Search Lien Records', type: 'link', url: 'https://www.miamidade.gov/clerk/' },
      );
      break;

    case 'code-violations':
      formattedResponse = formatViolationsResponse(property);
      sources.push('Tyler EnerGov Code Enforcement', 'Code Compliance');
      relatedActions.push(
        { label: 'Report Violation', type: 'link', url: '#report-violation' },
        { label: 'Request Inspection', type: 'workflow', workflowId: 'code-inspection' },
      );
      break;

    case 'zoning-info':
      formattedResponse = formatZoningResponse(property);
      sources.push('Planning & Zoning', 'Miami-Dade Zoning');
      relatedActions.push(
        { label: 'Zoning Map', type: 'link', url: '#zoning-map' },
        { label: 'Request Zoning Letter', type: 'workflow', workflowId: 'zoning-letter' },
      );
      break;

    case 'comprehensive-report':
      formattedResponse = formatComprehensiveResponse(property);
      sources.push(
        'Tyler iasWorld Assessment',
        'Tyler Eagle Land Records',
        'Tyler EnerGov Permitting',
        'Tyler Munis Financial',
        'Miami-Dade Property Appraiser',
        'Municipal Records'
      );
      relatedActions.push(
        { label: 'Download Full Report (PDF)', type: 'workflow', workflowId: 'download-report' },
        { label: 'Request Official Records', type: 'link', url: '#records-request' },
      );
      break;

    case 'property-lookup':
    default:
      formattedResponse = formatPropertyLookupResponse(property);
      sources.push('Tyler iasWorld Assessment', 'Property Records');
      relatedActions.push(
        { label: 'View Full Report', type: 'info' },
        { label: 'Tax Information', type: 'info' },
        { label: 'Permit History', type: 'info' },
      );
      break;
  }

  return {
    success: true,
    queryType,
    property,
    formattedResponse,
    sources,
    relatedActions,
  };
}

// Note: All functions are already exported with 'export' keyword above
