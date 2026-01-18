import React, { useEffect, useRef } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { GraphicLibrary } from "../../libraries/GraphicLibrary";

interface ColorManagementSlidersProps {
    gradientStart: number;
    gradientEnd: number;
    handleChangeGradientStart: (gradientStart: number) => void;
    handleChangeGradientEnd: (gradientEnd: number) => void;
}

const ColorManagementSliders = (
    { gradientStart, gradientEnd, handleChangeGradientStart, handleChangeGradientEnd }: ColorManagementSlidersProps
): React.ReactElement => {

    const canvasStartRef = useRef<HTMLCanvasElement>(null);
    const canvasEndRef = useRef<HTMLCanvasElement>(null);
    const canvasPreviewRef = useRef<HTMLCanvasElement>(null);

    // Fonction pour dessiner le dégradé
    const drawGradient = (
        canvas: HTMLCanvasElement,
        start: number,
        end: number
    ) => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const range = end - start;

        // Dessiner pixel par pixel
        for (let x = 0; x < width; x++) {
            const value = x;
            const limit = width - 1;
            
            // Calculer la couleur avec calculateRVB
            const color = GraphicLibrary.calculateRVB(value, limit, start, range);
            
            // Appliquer la couleur
            ctx.fillStyle = `rgb(${color.getRed()}, ${color.getGreen()}, ${color.getBlue()})`;
            ctx.fillRect(x, 0, 1, height);
        }
    };

    // Effet pour dessiner le dégradé du slider Start
    useEffect(() => {
        const canvas = canvasStartRef.current;
        if (!canvas) return;

        const parent = canvas.parentElement;
        if (parent) {
            const width = parent.offsetWidth;
            canvas.width = width;
            canvas.height = 10;
        }

        drawGradient(canvas, 0, gradientEnd - 1);
    }, [gradientEnd]);

    // Effet pour dessiner le dégradé du slider End
    useEffect(() => {
        const canvas = canvasEndRef.current;
        if (!canvas) return;

        const parent = canvas.parentElement;
        if (parent) {
            const width = parent.offsetWidth;
            canvas.width = width;
            canvas.height = 10;
        }

        drawGradient(canvas, gradientStart + 1, 6);
    }, [gradientStart]);

    // ⭐ Effet pour dessiner la prévisualisation complète de la gamme utilisée
    useEffect(() => {
        const canvas = canvasPreviewRef.current;
        if (!canvas) return;

        // ⭐ Largeur fixe au lieu de responsive
        canvas.width = 300; // Largeur fixe en pixels
        canvas.height = 20;

        drawGradient(canvas, gradientStart, gradientEnd);
    }, [gradientStart, gradientEnd]);

    return (
        <div className="react-colors-management-container">
            <Row className="gradient-sliders-container">
                <Col xs={12} md={6} className="">
                    <Form.Group className="">
                        <Form.Label className="text-small-black">
                            Gradient Start: {gradientStart}
                        </Form.Label>
                        {/* Canvas pour le dégradé */}
                        <div className="gradient-canvas-container">
                            <canvas 
                                id="canvasStart"
                                ref={canvasStartRef}
                            />
                        </div>
                        <Form.Range
                            className="gradient-range"
                            min={0}
                            max={gradientEnd - 1}
                            step={1}
                            value={gradientStart}
                            onChange={(e) => handleChangeGradientStart(Number(e.target.value))}
                        />
                    </Form.Group>
                </Col>

                <Col xs={12} md={6} className="">
                    <Form.Group className="">
                        <Form.Label className="text-small-black">
                            Gradient End: {gradientEnd}
                        </Form.Label>
                        {/* Canvas pour le dégradé */}
                        <div className="gradient-canvas-container">
                            <canvas 
                                id="canvasEnd"
                                ref={canvasEndRef}
                            />
                        </div>
                        <Form.Range
                            className="gradient-range"
                            min={gradientStart + 1}
                            max={6}
                            step={1}
                            value={gradientEnd}
                            onChange={(e) => handleChangeGradientEnd(Number(e.target.value))}
                        />
                    </Form.Group>
                </Col>
            </Row>

            {/* ⭐ Canvas de prévisualisation de la gamme complète utilisée */}
            <Row className="w-50 mb-md-0 mt-0 mb-0 pb-0 pt-0">
                <Col xs={12}>
                    <Form.Label className="text-small-black mb-1">
                        Gamme de couleurs utilisée (de {gradientStart} à {gradientEnd})
                    </Form.Label>
                    <div className="preview-gradient-container">
                        <canvas 
                            className="preview-gradient-canvas"
                            ref={canvasPreviewRef}
                        />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default ColorManagementSliders;
