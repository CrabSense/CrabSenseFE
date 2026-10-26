
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

      if (!Array.isArray(data)) {
        throw new Error(
          "Farming areas response is not an array."
        );
      }

      setAreas(data);

      console.log(
        "[useFarmAreas] Loaded:",
        data.length,
        "areas"
      );
    } catch (err) {
      console.error("Failed to load farming areas:", err);

      setAreas([]);
      setError(
        err.message || "Unable to load farming areas."
      );
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
