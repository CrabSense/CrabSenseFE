import { useCallback, useEffect, useState } from "react";
import farmingService from "../services/farmingService";

export default function useFarmAreas() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAreas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await farmingService.getAreas({
        isActive: true,
      });

      setAreas(data);
    } catch (err) {
      console.error("Failed to load farming areas:", err);

      setError(err.message || "Unable to load farming areas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  return {
    areas,
    loading,
    error,
    reload: loadAreas,
  };
}
