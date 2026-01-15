// utils/DateUtil.ts

class DateUtil {
    /**
     * Formate une date string SQL (ex: "2026-01-13 18:01:56.000") 
     * en format explicite (ex: "13 janvier 2026 à 18:01")
     */
    public static formatDate(dateString: string): string {
        if (!dateString) return 'Date inconnue';

        // 1. Nettoyage basique : on trim et on remplace les séparateurs
        // Cette Regex découpe tout ce qui n'est pas un chiffre : tirets, espaces, deux-points, points
        const parts = dateString.split(/[- :.]/);

        // On vérifie qu'on a au moins Année, Mois, Jour, Heure, Minute (5 éléments)
        if (parts.length < 5) {
             return dateString; // Échec du parsing, on renvoie l'original
        }

        // 2. Extraction manuelle (Zéro prise de tête avec les navigateurs)
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Attention : Janvier = 0 en JS
        const day = parseInt(parts[2]);
        const hour = parseInt(parts[3]);
        const minute = parseInt(parts[4]);
        const second = parts[5] ? parseInt(parts[5]) : 0;
        
        // 3. Création de l'objet Date
        
        // CHOIX A : Si ta date en base est stockée en UTC (Greenwich)
        // const date = new Date(Date.UTC(year, month, day, hour, minute, second));
        
        // CHOIX B : Si ta date en base est "telle quelle" (déjà à l'heure locale ou sans fuseau précis)
        const date = new Date(year, month, day, hour, minute, second);

        if (isNaN(date.getTime())) return dateString;

        // 4. Formatage en français
        return new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            // second: '2-digit' // Décommente si besoin
        }).format(date);
    }
}

export default DateUtil;
