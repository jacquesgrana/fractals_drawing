import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';

interface JuliaFractalManagementSlidersProps {
    fractalSeedReal: number;
    fractalSeedImag: number;
    fractalMaxIter: number;
    fractalLimit: number;
    handleChangeJuliaFractalSeedReal: (fractalSeedReal: number) => void;
    handleChangeJuliaFractalSeedImag: (fractalSeedImag: number) => void;
    handleChangeJuliaFractalMaxIter: (fractalMaxIter: number) => void;
    handleChangeJuliaFractalLimit: (fractalLimit: number) => void;
}
const JuliaFractalManagementSliders = (
    { 
        fractalSeedReal,
        fractalSeedImag,
        fractalMaxIter,
        fractalLimit,
        handleChangeJuliaFractalSeedReal,
        handleChangeJuliaFractalSeedImag,
        handleChangeJuliaFractalMaxIter,
        handleChangeJuliaFractalLimit
     }: JuliaFractalManagementSlidersProps
) : React.ReactElement => {
    return (
    <div className="react-julia-fractal-management-container">
        <p className="text-small-black">Paramètres de la fractale de Julia :</p>
        <Row className="mb-0">
            <Col>
                <Form.Label className="text-small-black">Seed Real</Form.Label>
                <Form.Control 
                className="fractal-values-input" 
                type="number" 
                step={0.001} 
                value={fractalSeedReal} 
                onChange={(e) => handleChangeJuliaFractalSeedReal(Number(e.target.value))} />
                <Form.Range 
                className="fractal-values-range" 
                min={-10} 
                max={10} 
                step={0.001} 
                value={fractalSeedReal} 
                onChange={(e) => handleChangeJuliaFractalSeedReal(Number(e.target.value))} />
            </Col>
            <Col>
                <Form.Label className="text-small-black">Seed Imaginaire</Form.Label>
                <Form.Control 
                className="fractal-values-input" 
                type="number" 
                step={0.001} 
                value={fractalSeedImag} 
                onChange={(e) => handleChangeJuliaFractalSeedImag(Number(e.target.value))} />
                <Form.Range 
                className="fractal-values-range" 
                min={-10} 
                max={10} 
                step={0.001} 
                value={fractalSeedImag} 
                onChange={(e) => handleChangeJuliaFractalSeedImag(Number(e.target.value))} />
            </Col>
        </Row>
        <Row className="mb-0">
            <Col>
                <Form.Label className="text-small-black">Max Iter</Form.Label>
                <Form.Control 
                className="fractal-values-input" 
                type="number" 
                step={1} 
                value={fractalMaxIter} 
                onChange={(e) => handleChangeJuliaFractalMaxIter(Number(e.target.value))} />
                <Form.Range 
                className="fractal-values-range" 
                min={0} 
                max={1000} 
                step={1} 
                value={fractalMaxIter} 
                onChange={(e) => handleChangeJuliaFractalMaxIter(Number(e.target.value))} />
            </Col>
            <Col>
                <Form.Label className="text-small-black">Limit</Form.Label>
                <Form.Control 
                className="fractal-values-input" 
                type="number" 
                step={0.001} 
                value={fractalLimit} 
                onChange={(e) => handleChangeJuliaFractalLimit(Number(e.target.value))} />
                <Form.Range 
                className="fractal-values-range" 
                min={0} 
                max={10} 
                step={0.001} 
                value={fractalLimit} 
                onChange={(e) => handleChangeJuliaFractalLimit(Number(e.target.value))} />
            </Col>
        </Row>
    </div>
    );
};
export default JuliaFractalManagementSliders;