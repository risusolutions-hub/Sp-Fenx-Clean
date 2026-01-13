import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

/**
 * SettingsContext - Provides feature flags to the entire app
 * Features can be enabled/disabled by super admin without server restart
 */
const SettingsContext = createContext({
  features: {},
  isFeatureEnabled: () => true,
  refreshSettings: () => {},
  loading: true
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }) {
  const [features, setFeatures] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch feature settings from backend
  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/settings/features');
      if (res.data.success) {
        setFeatures(res.data.features);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      // Default all features to enabled if fetch fails
      setFeatures({
        feature_skills: true,
        feature_certifications: true,
        feature_checklists: true,
        feature_customization: true,
        feature_chat: true,
        feature_leave_management: true,
        feature_analytics: true,
        feature_notifications: true
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Poll for settings changes every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchSettings, 30000);
    return () => clearInterval(interval);
  }, [fetchSettings]);

  // Check if a specific feature is enabled
  const isFeatureEnabled = useCallback((featureKey) => {
    // If loading or feature not found, default to enabled
    if (loading || features[featureKey] === undefined) {
      return true;
    }
    return features[featureKey] === true;
  }, [features, loading]);

  // Manual refresh function
  const refreshSettings = useCallback(() => {
    fetchSettings();
  }, [fetchSettings]);

  const value = {
    features,
    isFeatureEnabled,
    refreshSettings,
    loading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Feature keys mapping for easy reference
export const FEATURE_KEYS = {
  SKILLS: 'feature_skills',
  CERTIFICATIONS: 'feature_certifications',
  CHECKLISTS: 'feature_checklists',
  CUSTOMIZATION: 'feature_customization',
  CHAT: 'feature_chat',
  LEAVE_MANAGEMENT: 'feature_leave_management',
  ANALYTICS: 'feature_analytics',
  NOTIFICATIONS: 'feature_notifications'
};

// Map navigation IDs to feature keys
export const NAV_TO_FEATURE = {
  'skills': FEATURE_KEYS.SKILLS,
  'my-skills': FEATURE_KEYS.SKILLS,
  'checklists': FEATURE_KEYS.CHECKLISTS,
  'customize': FEATURE_KEYS.CUSTOMIZATION,
  'messages': FEATURE_KEYS.CHAT,
  'leaves': FEATURE_KEYS.LEAVE_MANAGEMENT,
  'analytics': FEATURE_KEYS.ANALYTICS
};

export default SettingsContext;
