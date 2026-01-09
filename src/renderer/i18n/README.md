# Internacionalización (i18n) con react-i18next

Este proyecto utiliza `react-i18next` para la internacionalización de la aplicación.

## Estructura

```
src/renderer/
├── i18n/
│   ├── config.ts          # Configuración de i18next
│   └── README.md          # Este archivo
├── locales/
│   ├── en.json            # Traducciones en inglés
│   └── es-AR.json         # Traducciones en español (Argentina)
└── hooks/
    └── useI18n.ts         # Hook personalizado para i18n
```

## Uso

### En componentes React

```tsx
import { useI18n } from '@/renderer/hooks/useI18n';

function MiComponente() {
  const { t } = useI18n();
  
  return (
    <div>
      <h1>{t('settings.general.title')}</h1>
      <p>{t('settings.general.description')}</p>
    </div>
  );
}
```

### Cambiar idioma

```tsx
import { useI18n } from '@/renderer/hooks/useI18n';

function SelectorIdioma() {
  const { changeLanguage, currentLanguage } = useI18n();
  
  const cambiarAEnglish = () => {
    changeLanguage('en');
  };
  
  const cambiarAEspanol = () => {
    changeLanguage('es-AR');
  };
  
  return (
    <div>
      <p>Idioma actual: {currentLanguage}</p>
      <button onClick={cambiarAEnglish}>English</button>
      <button onClick={cambiarAEspanol}>Español</button>
    </div>
  );
}
```

### Interpolación de variables

```tsx
// En el archivo de traducción (es-AR.json):
{
  "welcome": "Bienvenido, {{name}}!"
}

// En el componente:
const { t } = useI18n();
<p>{t('welcome', { name: 'Juan' })}</p>
// Resultado: "Bienvenido, Juan!"
```

## Agregar nuevas traducciones

1. Abre el archivo de traducción correspondiente (`en.json` o `es-AR.json`)
2. Agrega la nueva clave con su valor:

```json
{
  "nuevaSeccion": {
    "titulo": "Título",
    "descripcion": "Descripción"
  }
}
```

3. Usa la traducción en tu componente:

```tsx
const { t } = useI18n();
<h1>{t('nuevaSeccion.titulo')}</h1>
```

## Idiomas soportados

- `en`: English
- `es-AR`: Español (Argentina)

## Notas

- El idioma se guarda automáticamente en la configuración de la aplicación
- El idioma por defecto es `es-AR`
- El idioma se carga automáticamente desde la configuración al iniciar la aplicación
