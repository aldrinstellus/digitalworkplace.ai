/**
 * Official App Icons Component
 *
 * Professional SVG icons for all integrated apps.
 * Dark/light mode compatible with proper contrast.
 */

import React from 'react';

interface AppIconProps {
  size?: number;
  className?: string;
}

// Slack Icon
export const SlackIcon: React.FC<AppIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
    <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
    <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
    <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/>
  </svg>
);

// Jira Icon
export const JiraIcon: React.FC<AppIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="jiraGradient1" x1="99.684%" x2="39.555%" y1="15.209%" y2="62.337%">
        <stop offset="18%" stopColor="#0052CC"/>
        <stop offset="100%" stopColor="#2684FF"/>
      </linearGradient>
      <linearGradient id="jiraGradient2" x1="0.589%" x2="60.717%" y1="84.791%" y2="37.663%">
        <stop offset="18%" stopColor="#0052CC"/>
        <stop offset="100%" stopColor="#2684FF"/>
      </linearGradient>
    </defs>
    <path d="M23.323 11.33L13.001 1 12 0 4.225 7.775.677 11.33a.96.96 0 0 0 0 1.34l7.098 7.098L12 24l7.775-7.775.21-.21 3.338-3.345a.96.96 0 0 0 0-1.34zM12 15.551L8.449 12 12 8.453 15.548 12 12 15.551z" fill="url(#jiraGradient1)"/>
    <path d="M12 8.453a5.46 5.46 0 0 1-.015-7.718L4.21 8.51l3.55 3.54L12 8.453z" fill="url(#jiraGradient2)"/>
    <path d="M15.563 11.986L12 15.55a5.46 5.46 0 0 1 .015 7.718l7.775-7.782-4.227-4.5z" fill="url(#jiraGradient1)"/>
  </svg>
);

// GitHub Icon (works in both dark/light)
export const GitHubIcon: React.FC<AppIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

// Google Drive Icon
export const GoogleDriveIcon: React.FC<AppIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <path d="M7.71 3.5L1.15 15l3.43 5.99h13.7L24 15l-6.56-11.5H7.71z" fill="#3777E3"/>
    <path d="M14.12 15H24l-3.43 6H6.87l3.43-6h3.82z" fill="#FFCF63"/>
    <path d="M8.59 3.5L1.15 15h6.87L14.58 3.5H8.59z" fill="#11A861"/>
    <path d="M8.02 15L4.58 21H18.3l3.43-6H8.02z" fill="#FFCF63"/>
    <path d="M14.58 3.5H7.71l6.87 11.5h6.87L14.58 3.5z" fill="#0B8043"/>
    <path d="M1.15 15l3.43 6h6.87l-3.43-6H1.15z" fill="#1A73E8"/>
  </svg>
);

// Zoom Icon
export const ZoomIcon: React.FC<AppIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <rect width="24" height="24" rx="4" fill="#2D8CFF"/>
    <path d="M5.5 8.5C5.5 7.67 6.17 7 7 7h6c.83 0 1.5.67 1.5 1.5v4c0 .83-.67 1.5-1.5 1.5H7c-.83 0-1.5-.67-1.5-1.5v-4zm10 .75l3.25-2.25v7l-3.25-2.25v-2.5z" fill="white"/>
  </svg>
);

// Confluence Icon
export const ConfluenceIcon: React.FC<AppIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="confluenceGradient1" x1="99.14%" x2="33.859%" y1="112.977%" y2="37.814%">
        <stop offset="0%" stopColor="#0052CC"/>
        <stop offset="100%" stopColor="#2684FF"/>
      </linearGradient>
      <linearGradient id="confluenceGradient2" x1="0.86%" x2="66.14%" y1="-12.977%" y2="62.186%">
        <stop offset="0%" stopColor="#0052CC"/>
        <stop offset="100%" stopColor="#2684FF"/>
      </linearGradient>
    </defs>
    <path d="M2.04 17.28c-.24.4-.52.88-.76 1.28-.28.48-.12 1.08.36 1.4l3.8 2.36c.48.28 1.12.12 1.4-.36.2-.36.48-.8.76-1.32 1.88-3.24 3.8-2.84 7.24-1.2l3.6 1.68c.52.24 1.12 0 1.36-.52l1.92-4.2c.24-.52 0-1.12-.52-1.36-1.04-.48-2.84-1.32-4.04-1.88-5.68-2.64-10.44-2.52-15.12 4.12z" fill="url(#confluenceGradient1)"/>
    <path d="M21.96 6.72c.24-.4.52-.88.76-1.28.28-.48.12-1.08-.36-1.4L18.56 1.68c-.48-.28-1.12-.12-1.4.36-.2.36-.48.8-.76 1.32-1.88 3.24-3.8 2.84-7.24 1.2L5.56 2.88c-.52-.24-1.12 0-1.36.52L2.28 7.6c-.24.52 0 1.12.52 1.36 1.04.48 2.84 1.32 4.04 1.88 5.68 2.64 10.44 2.52 15.12-4.12z" fill="url(#confluenceGradient2)"/>
  </svg>
);

// Salesforce Icon
export const SalesforceIcon: React.FC<AppIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <path d="M10.006 5.415a4.195 4.195 0 0 1 3.045-1.306c1.56 0 2.954.856 3.68 2.12a5.31 5.31 0 0 1 2.016-.398c2.924 0 5.253 2.382 5.253 5.282s-2.33 5.282-5.253 5.282a5.21 5.21 0 0 1-1.277-.158 3.932 3.932 0 0 1-3.455 2.056 3.9 3.9 0 0 1-1.905-.496 4.662 4.662 0 0 1-4.088 2.418c-2.166 0-4.01-1.472-4.537-3.469a4.055 4.055 0 0 1-.74.069C1.244 16.815 0 15.296 0 13.508c0-1.263.61-2.416 1.605-3.147A4.63 4.63 0 0 1 1.3 8.594c0-2.573 2.085-4.658 4.658-4.658 1.313 0 2.5.542 3.348 1.415l.7.064z" fill="#00A1E0"/>
  </svg>
);

// Figma Icon
export const FigmaIcon: React.FC<AppIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <path d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4z" fill="#0ACF83"/>
    <path d="M4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4z" fill="#A259FF"/>
    <path d="M4 4c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4z" fill="#F24E1E"/>
    <path d="M12 0h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0z" fill="#FF7262"/>
    <path d="M20 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z" fill="#1ABCFE"/>
  </svg>
);

// Notion Icon (adapts to dark/light)
export const NotionIcon: React.FC<AppIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466l1.823 1.447zm.793 3.08v13.906c0 .747.373 1.027 1.213.98l14.523-.84c.84-.046.933-.56.933-1.167V6.354c0-.606-.233-.933-.746-.886l-15.177.886c-.56.047-.746.327-.746.934zm14.336.84c.094.42 0 .84-.42.887l-.7.14v10.265c-.606.327-1.166.513-1.633.513-.746 0-.933-.233-1.493-.933l-4.573-7.185v6.952l1.446.327s0 .84-1.166.84l-3.22.186c-.093-.186 0-.653.327-.746l.84-.233V9.855L7.822 9.67c-.094-.42.14-1.026.793-1.073l3.453-.233 4.76 7.278v-6.44l-1.213-.14c-.094-.514.28-.887.746-.933l3.227-.187z"/>
  </svg>
);

// LinkedIn Icon
export const LinkedInIcon: React.FC<AppIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <rect width="24" height="24" rx="2" fill="#0A66C2"/>
    <path d="M7.5 10v7H5v-7h2.5zm-1.25-4c.83 0 1.5.67 1.5 1.5S7.08 9 6.25 9 4.75 8.33 4.75 7.5 5.42 6 6.25 6zM9 10h2.4v.96h.03c.33-.63 1.15-1.3 2.37-1.3 2.53 0 3 1.67 3 3.84V17h-2.5v-3.1c0-.74-.01-1.69-1.03-1.69-1.03 0-1.19.8-1.19 1.63V17H9v-7z" fill="white"/>
  </svg>
);

// Email/Gmail Icon
export const GmailIcon: React.FC<AppIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6z" fill="#EA4335"/>
    <path d="M22 6l-10 7L2 6" stroke="white" strokeWidth="1.5" fill="none"/>
    <path d="M2 6v12h4V10l6 4.5L18 10v8h4V6l-10 7L2 6z" fill="#FBBC05"/>
    <path d="M2 18h4v-8l6 4.5L12 6 2 6v12z" fill="#34A853"/>
    <path d="M18 18h4V6l-10 7 6 4.5V18z" fill="#4285F4"/>
    <path d="M2 6l10 7 10-7" stroke="#C5221F" strokeWidth="0.5" fill="none"/>
  </svg>
);

// Bookmarks Icon (custom dIQ style)
export const BookmarksIcon: React.FC<AppIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="#10b981"/>
    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" stroke="#059669" strokeWidth="1"/>
  </svg>
);

// dIQ Logo Icon
export const DIQIcon: React.FC<AppIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <rect width="24" height="24" rx="4" fill="#10b981"/>
    <text x="4" y="17" fontSize="12" fontWeight="bold" fill="white" fontFamily="system-ui">dIQ</text>
  </svg>
);

// Microsoft Teams Icon
export const TeamsIcon: React.FC<AppIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <path d="M20.5 6.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="#5059C9"/>
    <path d="M20.5 8h-3a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 .5.5h3a2.5 2.5 0 0 0 0-5V8z" fill="#5059C9"/>
    <path d="M14 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="#7B83EB"/>
    <path d="M17.5 7h-7a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h7a3.5 3.5 0 0 0 0-7V7z" fill="#7B83EB"/>
    <path d="M9 11H2.5a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5H9z" fill="#4B53BC"/>
    <path d="M7 14h-2v2h2v-2z" fill="white"/>
  </svg>
);

// Dropbox Icon
export const DropboxIcon: React.FC<AppIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <path d="M6 2l6 3.75L6 9.5 0 5.75 6 2zm12 0l6 3.75-6 3.75-6-3.75L18 2zM0 13.25L6 9.5l6 3.75-6 3.75-6-3.75zm18-3.75l6 3.75-6 3.75-6-3.75 6-3.75zM6 18.5l6-3.75 6 3.75-6 3.75-6-3.75z" fill="#0061FF"/>
  </svg>
);

// Asana Icon
export const AsanaIcon: React.FC<AppIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="asanaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF5263"/>
        <stop offset="100%" stopColor="#FC7B6D"/>
      </linearGradient>
    </defs>
    <circle cx="12" cy="18" r="4" fill="url(#asanaGradient)"/>
    <circle cx="6" cy="9" r="4" fill="url(#asanaGradient)"/>
    <circle cx="18" cy="9" r="4" fill="url(#asanaGradient)"/>
  </svg>
);

// Trello Icon
export const TrelloIcon: React.FC<AppIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <rect width="24" height="24" rx="3" fill="#0079BF"/>
    <rect x="4" y="4" width="6" height="14" rx="1" fill="white"/>
    <rect x="14" y="4" width="6" height="9" rx="1" fill="white"/>
  </svg>
);

// App icon map for easy lookup
export const APP_ICONS: Record<string, React.FC<AppIconProps>> = {
  slack: SlackIcon,
  jira: JiraIcon,
  github: GitHubIcon,
  drive: GoogleDriveIcon,
  zoom: ZoomIcon,
  confluence: ConfluenceIcon,
  salesforce: SalesforceIcon,
  figma: FigmaIcon,
  notion: NotionIcon,
  linkedin: LinkedInIcon,
  email: GmailIcon,
  bookmarks: BookmarksIcon,
  diq: DIQIcon,
  teams: TeamsIcon,
  dropbox: DropboxIcon,
  asana: AsanaIcon,
  trello: TrelloIcon,
};

// Helper component to render app icon by id
export const AppIcon: React.FC<{ appId: string; size?: number; className?: string }> = ({
  appId,
  size = 24,
  className = ''
}) => {
  const IconComponent = APP_ICONS[appId.toLowerCase()];
  if (IconComponent) {
    return <IconComponent size={size} className={className} />;
  }
  // Fallback to a generic icon
  return (
    <div
      className={`flex items-center justify-center rounded ${className}`}
      style={{ width: size, height: size, background: 'var(--accent-ember)', color: 'white', fontSize: size * 0.5 }}
    >
      {appId.charAt(0).toUpperCase()}
    </div>
  );
};

export default AppIcon;
