/**
 * Feature Flags - Single Source of Truth
 * Central configuration for enabling/disabling app features
 */

export const FEATURE_FLAGS = {
  /** Enable/disable pet-specific donation (funding goals & direct support) */
  petDonationEnabled: false,
  /** Enable/disable platform-wide donation (floating button, support team) */
  platformDonationEnabled: true,
  /** Enable/disable adoption flow */
  adoptionEnabled: true,
  /** Enable/disable comments */
  commentsEnabled: true,
  /** Enable/disable reporting */
  reportingEnabled: true,
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  return FEATURE_FLAGS[flag];
}
