import { compareSemver } from '@/lib/semver';
import { obtenerVersionPolicy } from '@/services/api/versionPolicy';
import { getAppVersion } from '@/services/api/client';
import { track } from '@/services/analytics/track';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

const dismissKey = (recommended: string) =>
  `rachas.recommended.dismissed@${recommended}`;

export type RecommendedUpdateBannerState = {
  visible: boolean;
  recommended: string | null;
  dismiss: () => void;
};

export function useRecommendedUpdateBanner(): RecommendedUpdateBannerState {
  const [visible, setVisible] = useState(false);
  const [recommended, setRecommended] = useState<string | null>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const policy = await obtenerVersionPolicy();
        if (cancelled) {
          return;
        }

        const appVersion = getAppVersion();
        const belowRecommended = compareSemver(appVersion, policy.recommended) < 0;
        const atOrAboveMin = compareSemver(appVersion, policy.min) >= 0;

        if (!belowRecommended || !atOrAboveMin) {
          setVisible(false);
          setRecommended(null);
          return;
        }

        const dismissed = await AsyncStorage.getItem(
          dismissKey(policy.recommended),
        );
        if (cancelled) {
          return;
        }
        if (dismissed === 'true') {
          setVisible(false);
          setRecommended(policy.recommended);
          return;
        }

        setRecommended(policy.recommended);
        setVisible(true);
      } catch {
        if (!cancelled) {
          setVisible(false);
          setRecommended(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!visible || !recommended || trackedRef.current) {
      return;
    }
    trackedRef.current = true;
    void track('aviso_actualizacion_mostrado', { recommended });
  }, [visible, recommended]);

  const dismiss = useCallback(async () => {
    if (recommended) {
      await AsyncStorage.setItem(dismissKey(recommended), 'true');
    }
    setVisible(false);
  }, [recommended]);

  return { visible, recommended, dismiss };
}
