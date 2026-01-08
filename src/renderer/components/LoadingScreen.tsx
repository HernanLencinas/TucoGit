/**
 * @fileoverview Pantalla de carga inicial de la aplicación.
 * 
 * Este componente muestra un spinner de carga mientras se inicializa
 * la configuración y se cargan los datos de la aplicación.
 */

/**
 * Componente de pantalla de carga.
 * 
 * @description
 * Muestra un spinner animado centrado en la pantalla mientras
 * se carga la información inicial de la aplicación.
 * 
 * @returns {JSX.Element} Componente de pantalla de carga
 */
export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="relative">
        {/* Círculo exterior pulsante */}
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
        
        {/* Círculo base */}
        <div className="relative rounded-full h-20 w-20 border-4 border-muted"></div>
        
        {/* Arco animado principal */}
        <div className="absolute top-0 left-0 rounded-full h-20 w-20 border-4 border-transparent border-t-primary border-r-primary/80 animate-spin"></div>
        
        {/* Arco secundario (más lento) */}
        <div 
          className="absolute top-2 left-2 rounded-full h-16 w-16 border-2 border-transparent border-b-primary/60 border-l-primary/40 animate-spin" 
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        ></div>
        
        {/* Punto central pulsante */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-primary animate-pulse"></div>
      </div>
      
      {/* Texto de carga */}
      <p className="mt-6 text-sm text-muted-foreground font-medium animate-pulse">
        Cargando Tuco...
      </p>
    </div>
  );
};
