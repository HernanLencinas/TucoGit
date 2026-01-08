/**
 * @fileoverview Sistema de notificaciones toast para la aplicación.
 * 
 * Este módulo proporciona un sistema completo de notificaciones toast
 * con soporte para múltiples variantes, acciones personalizadas y
 * gestión automática de tiempo de vida.
 */

import * as React from "react"

/**
 * Elemento de acción para un toast.
 * 
 * @typedef {React.ReactElement<{altText: string}>} ToastActionElement
 */
type ToastActionElement = React.ReactElement<{
  altText: string
}>

/**
 * Propiedades de un toast.
 * 
 * @typedef {Object} ToastProps
 * @property {string} id - Identificador único del toast
 * @property {React.ReactNode} [title] - Título del toast
 * @property {React.ReactNode} [description] - Descripción del toast
 * @property {ToastActionElement} [action] - Elemento de acción opcional
 * @property {("default"|"destructive"|"success"|"info"|"warning")} [variant] - Variante visual del toast
 */
export type ToastProps = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive" | "success" | "info" | "warning"
}

/** @const {number} TOAST_LIMIT - Número máximo de toasts visibles simultáneamente */
const TOAST_LIMIT = 1

/** @const {number} TOAST_REMOVE_DELAY - Tiempo en milisegundos antes de eliminar un toast automáticamente */
const TOAST_REMOVE_DELAY = 3000

/**
 * Tipo extendido de toast con propiedades internas.
 * 
 * @typedef {ToastProps & {open?: boolean, onOpenChange?: (open: boolean) => void}} ToasterToast
 */
type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive" | "success" | "info" | "warning"
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

/** @private {number} count - Contador interno para generar IDs únicos */
let count = 0

/**
 * Genera un ID único para un toast.
 * 
 * @description
 * Utiliza un contador interno que se incrementa y se reinicia
 * cuando alcanza el máximo valor seguro de JavaScript.
 * 
 * @returns {string} ID único como cadena
 * @private
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

/** @private {Map<string, ReturnType<typeof setTimeout>>} toastTimeouts - Mapa de timeouts activos por toast */
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * Agrega un toast a la cola de eliminación automática.
 * 
 * @description
 * Programa la eliminación automática de un toast después de
 * TOAST_REMOVE_DELAY milisegundos. Si el toast ya está en la cola,
 * no hace nada.
 * 
 * @param {string} toastId - ID del toast a eliminar
 * @private
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

/**
 * Reducer para gestionar el estado de los toasts.
 * 
 * @description
 * Maneja las acciones de agregar, actualizar, descartar y eliminar toasts.
 * Mantiene un límite máximo de toasts visibles según TOAST_LIMIT.
 * 
 * @param {State} state - Estado actual de los toasts
 * @param {Action} action - Acción a ejecutar
 * @returns {State} Nuevo estado después de la acción
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

/** @private {Array<(state: State) => void>} listeners - Array de listeners suscritos a cambios de estado */
const listeners: Array<(state: State) => void> = []

/** @private {State} memoryState - Estado en memoria de los toasts */
let memoryState: State = { toasts: [] }

/**
 * Despacha una acción y notifica a todos los listeners.
 * 
 * @description
 * Actualiza el estado en memoria y notifica a todos los componentes
 * suscritos sobre el cambio.
 * 
 * @param {Action} action - Acción a despachar
 * @private
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

/**
 * Tipo de toast sin el ID (se genera automáticamente).
 * 
 * @typedef {Omit<ToasterToast, "id">} Toast
 */
type Toast = Omit<ToasterToast, "id">

/**
 * Crea y muestra un nuevo toast.
 * 
 * @description
 * Genera un ID único, crea el toast y lo agrega al estado.
 * Retorna funciones para actualizar y descartar el toast.
 * 
 * @param {Toast} props - Propiedades del toast (sin ID)
 * @returns {Object} Objeto con funciones de control del toast
 * @returns {string} returns.id - ID único del toast
 * @returns {Function} returns.dismiss - Función para descartar el toast
 * @returns {Function} returns.update - Función para actualizar el toast
 * 
 * @example
 * ```tsx
 * const { id, dismiss } = toast({
 *   title: 'Éxito',
 *   description: 'Operación completada',
 *   variant: 'success'
 * });
 * ```
 */
function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

/**
 * Hook para gestionar toasts en un componente.
 * 
 * @description
 * Suscribe el componente a los cambios de estado de los toasts
 * y proporciona funciones para crear y descartar toasts.
 * Se desuscribe automáticamente al desmontar el componente.
 * 
 * @returns {Object} Objeto con el estado y funciones de toasts
 * @returns {ToasterToast[]} returns.toasts - Array de toasts actuales
 * @returns {Function} returns.toast - Función para crear un nuevo toast
 * @returns {Function} returns.dismiss - Función para descartar un toast por ID
 * 
 * @example
 * ```tsx
 * const { toast, dismiss } = useToast();
 * 
 * const showSuccess = () => {
 *   toast({ title: 'Éxito', variant: 'success' });
 * };
 * ```
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
