// utils/DateUtil.ts

class DateUtil {
    /**
     * Version avec locale détectée automatiquement
     */
    public static formatDate(dateString: string): string {
        if (!dateString) return 'Date inconnue';

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            console.error('Date invalide:', dateString);
            return dateString;
        }

        // ⭐ Détecte la locale ET la timezone du navigateur
        return date.toLocaleString(undefined, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

export default DateUtil;