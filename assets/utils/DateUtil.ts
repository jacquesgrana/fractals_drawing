// utils/DateUtil.ts

class DateUtil {
/**
     * Formate une date string (ex: "2026-01-01 13:00:33") 
     * en format explicite (ex: "1 janvier 2026 à 13:00")
     */
    public static formatDate(dateString: string | undefined): string {
        if (!dateString) return 'Date inconnue';

        // Astuce : Safari/vieux navigateurs n'aiment pas l'espace dans "YYYY-MM-DD HH:mm:ss"
        // On remplace l'espace par un 'T' pour respecter la norme ISO s'il n'y est pas
        // et on ajoute un 'Z' pour indiquer que la date est en UTC
         const safeDateString = dateString.replace(' ', 'T') + 'Z';
        const date = new Date(safeDateString);

        // Si la date est invalide, on retourne la string d'origine
        if (isNaN(date.getTime())) return dateString;

        return new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'long',   // 'long' pour "janvier", 'short' pour "janv."
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            // second: '2-digit' // Décommente si tu veux les secondes
        }).format(date);
    }
}

export default DateUtil;