class CanvasConfig {
    //public static readonly DEFAULT_WIDTH = 800;
    //public static readonly DEFAULT_HEIGHT = 600;

    public static CANVAS_BACKGROUND_COLOR: string = 'rgba(0,0,0,1.0)';
    public static CANVAS_FILL_SELECT_COLOR: string = 'rgba(235, 125, 52, 0.38)';
    public static CANVAS_STROKE_SELECT_COLOR: string = 'rgba(235, 125, 52, 0.8)';

    public static DEFAULT_GRADIENT_START: number = 0;
    public static DEFAULT_GRADIANT_END: number = 6;

    public static DEFAULT_THREADS_NUMBER = 4;

    public static ZOOM_DANGER_LIMIT = 1000000000000000;
    public static ZOOM_WARNING_LIMIT = 1000000000000;

    public static ZOOM_MAX = 100000000000000;

    public static MATRIX_DETERMINANT_LIMIT_MIN = 0.00000000000000000000000001;
};

export { CanvasConfig };