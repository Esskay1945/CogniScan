import { useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';

export function useRecordCompletedGame(finished, gameId, category, score, duration = 0) {
  const { saveGameResult } = useData();
  const recorded = useRef(false);
  useEffect(() => {
    if (!finished) {
      recorded.current = false;
      return;
    }
    if (recorded.current) return;
    recorded.current = true;
    saveGameResult({ gameId, category, score, duration });
  }, [finished, gameId, category, score, duration, saveGameResult]);
}
