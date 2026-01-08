import { useState, useEffect } from "react";

/**
 * Hook personalizado para debounce de valores.
 * 
 * @description
 * Retorna un valor que se actualiza después de que el valor de entrada
 * haya permanecido sin cambios durante el tiempo de delay especificado.
 * Útil para optimizar búsquedas, validaciones o llamadas a API.
 * 
 * @template T - Tipo del valor a debounce
 * @param {T} value - Valor que se desea debounce
 * @param {number} delay - Tiempo de espera en milisegundos antes de actualizar el valor
 * @returns {T} Valor debounced
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // Esta función solo se ejecutará después de 500ms sin cambios
 *   performSearch(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

