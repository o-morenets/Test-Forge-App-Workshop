import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { History } from 'history';
import { view } from '@forge/bridge';

interface UseRouting {
  historyState: History | null;
  navigator: History | null;
}

/**
 * @see {@link https://developer.atlassian.com/platform/forge/add-routing-to-a-full-page-app/#implement-routing-in-your-app}
 */
function useRouting(): UseRouting {
  const [historyState, setHistoryState] = useState<History | null>(null);
  const [navigator, setNavigator] = useState<History | null>(null);
  const historyCleanupRef: MutableRefObject<(() => void) | null> = useRef(null);

  useEffect(() => {
    // We're using an immediately invoked function expression (IIFE) to handle async code in useEffect
    (async () => {
      // When the app mounts, we use the view API to create a history "log"
      const history: History = await view.createHistory();
      setNavigator(history);

      // The initial values of action and location will be the app URL
      setHistoryState(history);
      // Listen for changes in the history "log"
      const unsubscribe = history.listen((location, action) => {
        setHistoryState({
          action,
          location,
        } as History);
      });

      // Store a reference to the cleanup function for when the user navigates away
      historyCleanupRef.current = unsubscribe;
    })();
  }, []);

  const handleUnload = () => {
    if (historyCleanupRef.current) {
      historyCleanupRef.current();
    }
  };

  // When the user navigates away from the app and the iframe gets removed, we clean up the history listener
  useEffect(() => {
    window.addEventListener('unload', handleUnload);
    return () => {
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  return {
    historyState,
    navigator,
  };
}

export default useRouting;
