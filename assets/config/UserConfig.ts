class UserConfig {
        public static PASSWORD_MIN_LENGTH : number = 8;
        public static EMAIL_REGEX : RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        public static PSEUDO_REGEX : RegExp = /^[a-zA-Z0-9_-]{3,16}$/;
}

export default UserConfig;