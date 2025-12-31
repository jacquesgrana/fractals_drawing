// src/services/ToastService.ts
import toast from 'react-hot-toast';

const ToastFacade = {
    success(message: string) {
        toast.success(message);
    },

    error(message: string) {
        toast.error(message);
    },

    // Hot Toast n'a pas de méthode 'info' ou 'warning' par défaut explicite 
    // comme Toastify, mais on peut utiliser le toast standard ou ajouter une icône
    info(message: string) {
        toast(message, {
            icon: 'ℹ️',
        });
    },

    warning(message: string) {
        toast(message, {
            icon: '⚠️',
            style: {
                border: '1px solid #FFC107',
                padding: '16px',
                color: '#713200',
            },
        });
    }
};

export default ToastFacade;
