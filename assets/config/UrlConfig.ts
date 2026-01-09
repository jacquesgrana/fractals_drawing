class UrlConfig {
    public static LOGIN_URL = '/api/login';
    public static LOGOUT_URL = '/api/logout';
    public static ME_URL = '/api/me';
    public static REGISTER_URL = '/api/user/register';
    public static VERIFY_EMAIL_URL = '/api/user/verify-email';

    public static UPDATE_USER_PARAMS_URL = '/api/user/patch-params';
    public static UPDATE_USER_PASSWORD_URL = '/api/user/patch-password';
    public static UPDATE_USER_EMAIL_URL = '/api/user/patch-email';
    public static GET_EMAIL_NOT_USED_URL = '/api/user/email-not-used';
    public static GET_EMAIL_USED_URL = '/api/user/email-used';
    public static SEND_EMAIL_WITH_CODE_URL = '/api/user/send-email-with-code';
    public static SEND_EMAIL_WITH_CODE_FOR_PASSWORD_URL = '/api/user/send-code-for-password';
    public static VERIFY_EMAIL_CODE_URL = '/api/user/verify-email-code';
    public static VERIFY_EMAIL_CODE_FOR_PASSWORD_URL = '/api/user/verify-code-for-password';
    public static UPDATE_USER_FORGOT_PASSWORD_URL = '/api/user/patch-forgot-password';
}   

export default UrlConfig;