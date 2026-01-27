import React from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import JuliaFractalConfig from '../../config/JuliaFractalConfig';

interface JuliaFractalManagementSlidersProps {
    fractalSeedReal: number;
    fractalSeedImag: number;
    fractalMaxIter: number;
    fractalLimit: number;
    handleChangeJuliaFractalSeedReal: (fractalSeedReal: number) => void;
    handleChangeJuliaFractalSeedImag: (fractalSeedImag: number) => void;
    handleChangeJuliaFractalMaxIter: (fractalMaxIter: number) => void;
    handleChangeJuliaFractalLimit: (fractalLimit: number) => void;
    isJuliaFractalManagementPanelOpen: boolean;
    HandleToggleIsJuliaFractalManagementPanelOpen: () => void;
    handleCreateNewJuliaFractal: () => void;
    isAuthenticated: boolean
}

/*
const JULIA_FRACTAL_SEED_PARAMS_STEP: number = 0.001;
const JULIA_FRACTAL_ITER_PARAMS_STEP: number = 1;

const JULIA_FRACTAL_SEED_PARAMS_MIN: number = -2;
const JULIA_FRACTAL_SEED_PARAMS_MAX: number = 2;

const JULIA_FRACTAL_LIMIT_PARAMS_MIN: number = 0;
const JULIA_FRACTAL_LIMIT_PARAMS_MAX: number = 6;

const JULIA_FRACTAL_ITER_PARAMS_MIN: number = 10;
const JULIA_FRACTAL_ITER_PARAMS_MAX: number = 1000;
*/

const JuliaFractalManagementSliders = (
    { 
        fractalSeedReal,
        fractalSeedImag,
        fractalMaxIter,
        fractalLimit,
        handleChangeJuliaFractalSeedReal,
        handleChangeJuliaFractalSeedImag,
        handleChangeJuliaFractalMaxIter,
        handleChangeJuliaFractalLimit,
        isJuliaFractalManagementPanelOpen,
        HandleToggleIsJuliaFractalManagementPanelOpen,
        handleCreateNewJuliaFractal,
        isAuthenticated
     }: JuliaFractalManagementSlidersProps
) : React.ReactElement => {
    return (
    <div className="react-julia-fractal-management-container">
        <p 
        className="text-small-black react-text-link-dark"
        onClick={HandleToggleIsJuliaFractalManagementPanelOpen}
        >Paramètres de la fractale de Julia :</p>
        {isJuliaFractalManagementPanelOpen && (
        <>
            <Row className="mb-0">
                <Col>
                    <Form.Label className="text-small-black">Seed Real</Form.Label>
                    <Form.Control 
                    className="fractal-values-input" 
                    type="number" 
                    step={JuliaFractalConfig.JULIA_FRACTAL_SEED_PARAMS_STEP} 
                    value={fractalSeedReal} 
                    onChange={(e) => handleChangeJuliaFractalSeedReal(Number(e.target.value))} />
                    <Form.Range 
                    className="fractal-values-range" 
                    min={JuliaFractalConfig.JULIA_FRACTAL_SEED_PARAMS_MIN} 
                    max={JuliaFractalConfig.JULIA_FRACTAL_SEED_PARAMS_MAX} 
                    step={JuliaFractalConfig.JULIA_FRACTAL_SEED_PARAMS_STEP} 
                    value={fractalSeedReal} 
                    onChange={(e) => handleChangeJuliaFractalSeedReal(Number(e.target.value))} />
                </Col>
                <Col>
                    <Form.Label className="text-small-black">Seed Imaginaire</Form.Label>
                    <Form.Control 
                    className="fractal-values-input" 
                    type="number" 
                    step={JuliaFractalConfig.JULIA_FRACTAL_SEED_PARAMS_STEP} 
                    value={fractalSeedImag} 
                    onChange={(e) => handleChangeJuliaFractalSeedImag(Number(e.target.value))} />
                    <Form.Range 
                    className="fractal-values-range" 
                    min={JuliaFractalConfig.JULIA_FRACTAL_SEED_PARAMS_MIN} 
                    max={JuliaFractalConfig.JULIA_FRACTAL_SEED_PARAMS_MAX} 
                    step={JuliaFractalConfig.JULIA_FRACTAL_SEED_PARAMS_STEP} 
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
                    step={JuliaFractalConfig.JULIA_FRACTAL_ITER_PARAMS_STEP} 
                    value={fractalMaxIter} 
                    onChange={(e) => handleChangeJuliaFractalMaxIter(Number(e.target.value))} />
                    <Form.Range 
                    className="fractal-values-range" 
                    min={JuliaFractalConfig.JULIA_FRACTAL_ITER_PARAMS_MIN} 
                    max={JuliaFractalConfig.JULIA_FRACTAL_ITER_PARAMS_MAX} 
                    step={JuliaFractalConfig.JULIA_FRACTAL_ITER_PARAMS_STEP} 
                    value={fractalMaxIter} 
                    onChange={(e) => handleChangeJuliaFractalMaxIter(Number(e.target.value))} />
                </Col>
                <Col>
                    <Form.Label className="text-small-black">Limit</Form.Label>
                    <Form.Control 
                    className="fractal-values-input" 
                    type="number" 
                    step={JuliaFractalConfig.JULIA_FRACTAL_LIMIT_PARAMS_STEP} 
                    value={fractalLimit} 
                    onChange={(e) => handleChangeJuliaFractalLimit(Number(e.target.value))} />
                    <Form.Range 
                    className="fractal-values-range" 
                    min={JuliaFractalConfig.JULIA_FRACTAL_LIMIT_PARAMS_MIN} 
                    max={JuliaFractalConfig.JULIA_FRACTAL_LIMIT_PARAMS_MAX} 
                    step={JuliaFractalConfig.JULIA_FRACTAL_LIMIT_PARAMS_STEP} 
                    value={fractalLimit} 
                    onChange={(e) => handleChangeJuliaFractalLimit(Number(e.target.value))} />
                </Col>
            </Row>
            { isAuthenticated && (
                <Row className="mb-0">
                <Button 
                variant="primary" 
                className='btn btn-primary-small' 
                title='Créer une nouvelle fractale'
                onClick={() => handleCreateNewJuliaFractal()}
                >Créer</Button>
                </Row>
            )}
            
        </>)}
    </div>
    );
};
export default JuliaFractalManagementSliders;