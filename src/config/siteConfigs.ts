import type { SiteRule } from '../types';

/**
 * Site-specific configuration registry.
 * Maps hostnames or domain patterns to custom selector rules.
 *
 * Examples:
 * - "example.com": { selector: 'input[name="phone"]' }
 * - "portal.mysite.org": { selector: '.form-item input', excludeSelector: '.search-box' }
 */
export const siteConfigs: Record<string, SiteRule> = {
  // Example override for demonstration:
  'example.com': {
    selector: 'input[name="phone"], input[type="tel"]',
    description: 'Target phone inputs specifically on example.com',
  },
};

/**
 * Resolves site rule for a given hostname.
 * Checks for exact hostname match or root domain match.
 */
export function getSiteRule(hostname: string): SiteRule | undefined {
  if (!hostname) return undefined;

  const cleanHost = hostname.toLowerCase();

  // 1. Check exact match
  if (siteConfigs[cleanHost]) {
    return siteConfigs[cleanHost];
  }

  // 2. Check suffix/parent domain match (e.g. sub.example.com -> example.com)
  for (const [domain, rule] of Object.entries(siteConfigs)) {
    if (cleanHost.endsWith(`.${domain}`)) {
      return rule;
    }
  }

  return undefined;
}
