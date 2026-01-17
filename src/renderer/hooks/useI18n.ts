import { useTranslation } from 'react-i18next';

/**
 * Hook personalizado para gestionar la internacionalización.
 * 
 * @description
 * Este hook proporciona funciones para cambiar el idioma de la aplicación
 * y se integra con la configuración guardada.
 * 
 * @returns {Object} Objeto con funciones y estado de i18n
 * @returns {Function} returns.changeLanguage - Función para cambiar el idioma
 * @returns {string} returns.currentLanguage - Idioma actual
 * @returns {Function} returns.t - Función de traducción de react-i18next
 * @returns {Object} returns.i18n - Instancia de i18n
 */
export const useI18n = () => {
  const { t, i18n: i18nInstance } = useTranslation('translation');

  /**
   * Cambia el idioma de la aplicación y lo guarda en la configuración.
   * 
   * @param {string} language - Código del idioma ('en', 'es-AR', 'de', 'fr', 'pt', 'ja' o 'zh-CN')
   * @returns {Promise<void>}
   */
  const changeLanguage = async (language: 'en' | 'es-AR' | 'de' | 'fr' | 'pt' | 'ja' | 'zh-CN' | 'ru' | 'it') => {
    try {
      await i18nInstance.changeLanguage(language);

      // Guardar en la configuración
      if (window.electronAPI?.writeConfig) {
        await window.electronAPI.writeConfig({ uiLanguage: language });
      }
    } catch (error) {
      console.error('Error al cambiar el idioma:', error);
    }
  };

  /**
   * Inicializa el idioma desde la configuración guardada.
   * 
   * @param {string} savedLanguage - Idioma guardado en la configuración
   */
  const initializeLanguage = (savedLanguage: 'en' | 'es-AR' | 'de' | 'fr' | 'pt' | 'ja' | 'zh-CN' | 'ru' | 'it') => {
    if (savedLanguage && savedLanguage !== i18nInstance.language) {
      i18nInstance.changeLanguage(savedLanguage);
    }
  };

  return {
    t,
    changeLanguage,
    currentLanguage: i18nInstance.language as 'en' | 'es-AR' | 'de' | 'fr' | 'pt' | 'ja' | 'zh-CN' | 'ru' | 'it',
    i18n: i18nInstance,
    initializeLanguage,
  };
};
