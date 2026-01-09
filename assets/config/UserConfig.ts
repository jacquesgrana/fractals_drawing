class UserConfig {
        // si modification : modifier aussi la regex du password
        public static PASSWORD_MIN_LENGTH : number = 8;
        public static PASSWORD_MAX_LENGTH : number = 30;
        public static PASSWORD_FORMAT : string = 'au minimum 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère special : @ $ ! % * ? &';

        // si modification : modifier aussi la regex du pseudo
        public static PSEUDO_MIN_LENGTH : number = 3;
        public static PSEUDO_MAX_LENGTH : number = 16;
        public static PSEUDO_FORMAT : string = 'lettres (majuscules et minuscules), chiffres, tirets et underscores';

        public static NAME_MIN_LENGTH : number = 3;
        public static NAME_MAX_LENGTH : number = 30;
        public static NAME_FORMAT : string = 'lettres (majuscules et minuscules) et tirets';
        public static NAME_REGEX : RegExp = /^[a-zA-Z-]{3,30}$/;

        public static EMAIL_MIN_LENGTH : number = 5;
        public static EMAIL_MAX_LENGTH : number = 40;
        public static EMAIL_FORMAT : string = 'xxx@xxx.xxx';

        public static VERIF_CODE_LENGTH : number = 8;
        public static VERIF_CODE_FORMAT : string = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

        public static PASSWORD_REGEX : RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/;
        public static EMAIL_REGEX : RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        public static PSEUDO_REGEX : RegExp = /^[a-zA-Z0-9_-]{3,16}$/;
        public static VERIF_CODE_REGEX : RegExp = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/;

}

export default UserConfig;