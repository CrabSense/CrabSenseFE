  import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
  } from "react";

  import useFarmAreas from "../hooks/useFarmAreas";

  export const AreaContext = createContext(null);

  const STORAGE_KEY = "crabsense:selectedFarmingAreaId";

  function AreaProvider({ children }) {
    const {
      areas,
      loading: areasLoading,
      error: areasError,
      reload: reloadAreas,
    } = useFarmAreas();

    const [selectedAreaId, setSelectedAreaIdState] = useState(() => {
      return localStorage.getItem(STORAGE_KEY) || null;
    });

    /*
    * Validate farmingAreaId đã lưu.
    *
    * Ví dụ:
    * user từng chọn AREA-A01
    * nhưng sau đó area này bị disable/xóa.
    *
    * Khi danh sách areas load lại:
    * nếu id không còn tồn tại -> reset về All Areas.
    */
    useEffect(() => {
      if (areasLoading) {
        return;
      }

      if (!selectedAreaId) {
        return;
      }

      const exists = areas.some((area) => area.id === selectedAreaId);

      if (!exists) {
        setSelectedAreaIdState(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    }, [areas, areasLoading, selectedAreaId]);

    const setSelectedAreaId = useCallback((areaId) => {
      const normalizedId = areaId || null;

      setSelectedAreaIdState(normalizedId);

      if (normalizedId) {
        localStorage.setItem(STORAGE_KEY, normalizedId);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }, []);

    const clearSelectedArea = useCallback(() => {
      setSelectedAreaIdState(null);
      localStorage.removeItem(STORAGE_KEY);
    }, []);

    const selectedArea = useMemo(() => {
      if (!selectedAreaId) {
        return null;
      }

      return areas.find((area) => area.id === selectedAreaId) ?? null;
    }, [areas, selectedAreaId]);

    const value = useMemo(
      () => ({
        areas,

        selectedAreaId,
        selectedArea,

        setSelectedAreaId,
        clearSelectedArea,

        areasLoading,
        areasError,
        reloadAreas,
      }),
      [
        areas,
        selectedAreaId,
        selectedArea,
        setSelectedAreaId,
        clearSelectedArea,
        areasLoading,
        areasError,
        reloadAreas,
      ],
    );

    return <AreaContext.Provider value={value}>{children}</AreaContext.Provider>;
  }

  export default AreaProvider;
