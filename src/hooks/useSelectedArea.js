import { useContext } from "react";
import { AreaContext } from "../context/AreaContext";

export default function useSelectedArea() {
  const context = useContext(AreaContext);

  if (!context) {
    throw new Error("useSelectedArea must be used inside AreaProvider.");
  }

  return context;
}
