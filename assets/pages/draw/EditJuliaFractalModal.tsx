import { Button, Form, Modal } from "react-bootstrap";
import { JuliaFractal } from "../../model/JuliaFractal";
import { Nullable } from "../../types/indexType";
import React from "react";
import CanvasService from "../../services/CanvasService";
import JuliaFractalService from "../../services/JuliaFractalService";
import DateUtil from "../../utils/DateUtil";
import ToastFacade from "../../facade/ToastFacade";
import JuliaFractalConfig from "../../config/JuliaFractalConfig";

type EditJuliaFractalModalProps = {
    isModalEditJuliaFractalOpen: boolean;
    handleCloseEditJuliaFractalModal: () => void;
    juliaFractal: Nullable<JuliaFractal>;
    reloadAllJuliaFractals: () => Promise<void>;
}

const INPUT_CHANGE_DELAY_MS: number = 40;

const CANVAS_WIDTH: number = 400;
const CANVAS_HEIGHT: number = 400;

/*
const JULIA_FRACTAL_SEED_PARAMS_MIN: number = -2;
const JULIA_FRACTAL_SEED_PARAMS_MAX: number = 2;
const JULIA_FRACTAL_SEED_PARAMS_STEP: number = 0.001;

const JULIA_FRACTAL_LIMIT_PARAMS_MIN: number = 0;
const JULIA_FRACTAL_LIMIT_PARAMS_MAX: number = 6;

const JULIA_FRACTAL_ITER_PARAMS_MIN: number = 10;
const JULIA_FRACTAL_ITER_PARAMS_MAX: number = 1000;
const JULIA_FRACTAL_ITER_PARAMS_STEP: number = 1;
*/

const EditJuliaFractalModal = (
    {
        isModalEditJuliaFractalOpen,
        handleCloseEditJuliaFractalModal,
        juliaFractal,
        reloadAllJuliaFractals
    } : EditJuliaFractalModalProps
) : React.ReactElement => {

    const [isDrawing, setIsDrawing] = React.useState<boolean>(false);
    const [fractalName, setFractalName] = React.useState<string>(juliaFractal!.getName());
    const [fractalComment, setFractalComment] = React.useState<string>(juliaFractal!.getComment());
    const [isFractalPublic, setIsFractalPublic] = React.useState<boolean>(juliaFractal!.getIsPublic());
    const [fractalSeedReal, setFractalSeedReal] = React.useState<number>(juliaFractal!.getSeed().getReal());
    const [fractalSeedImag, setFractalSeedImag] = React.useState<number>(juliaFractal!.getSeed().getImag());
    const [fractalLimit, setFractalLimit] = React.useState<number>(juliaFractal!.getLimit());
    const [fractalMaxIt, setFractalMaxIt] = React.useState<number>(juliaFractal!.getMaxIt());

    const [isFormValid, setIsFormValid] = React.useState<boolean>(false);

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const canvasService = CanvasService.getInstance();
    const juliaFractalService = JuliaFractalService.getInstance();

    React.useEffect(() => {
        if (fractalName !== "" 
            && fractalComment !== ""
        ) {
            setIsFormValid(true);
        } else {
            setIsFormValid(false);
        }
    }, [fractalName, fractalComment]);

    React.useEffect(() => {
        if (!juliaFractal || !canvasRef.current) return;

        // A. On crée un timer pour ne pas dessiner à chaque micro-mouvement de souris
        const timerId = setTimeout(async () => {
            
            // B. On met à jour l'objet REFERENT avec les valeurs du STATE
            // C'est ici que la synchronisation se fait juste avant le dessin
            juliaFractal.getSeed().setReal(fractalSeedReal);
            juliaFractal.getSeed().setImag(fractalSeedImag);
            juliaFractal.setLimit(fractalLimit);
            juliaFractal.setMaxIt(fractalMaxIt);
            
            // C. On dessine
            await drawCanvas();

        }, INPUT_CHANGE_DELAY_MS); // 100ms de délai (ajuste selon la puissance de tes workers)

        // D. Cleanup : Si l'utilisateur rebouge la souris avant les 100ms, on annule le dessin précédent
        return () => clearTimeout(timerId);

    }, [
        // Liste exhaustive des dépendances qui doivent déclencher un redessin
        fractalSeedReal, 
        fractalSeedImag, 
        fractalLimit, 
        fractalMaxIt,
        juliaFractal // Au cas où l'objet parent change complètement
    ]);


    const drawCanvas = async () =>  {
        if(canvasRef.current === null) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;
        if (!juliaFractal) return;
        let buffer: ImageData = await canvasService.computeBufferWithWorker(juliaFractal, canvasRef.current.width, canvasRef.current.height);
        ctx.putImageData(buffer, 0, 0);
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log('update julia fractal submit');

        if (juliaFractal) {
            juliaFractal.setName(fractalName);
            juliaFractal.setComment(fractalComment);
            juliaFractal.setIsPublic(isFractalPublic);
            juliaFractal.getSeed().setReal(fractalSeedReal);
            juliaFractal.getSeed().setImag(fractalSeedImag);
            juliaFractal.setLimit(fractalLimit);
            juliaFractal.setMaxIt(fractalMaxIt);

            const response = await juliaFractalService.updateJuliaFractal(juliaFractal);

            if (!response) {
                return;
            }

            try {
                const data = await response.json();
                if (data.status === 200) {
                    ToastFacade.success('Modification prise en compte : ' + data.message + ' !');
                    await reloadAllJuliaFractals();
                } else if (data.status === 400) {
                    ToastFacade.error('Erreur 400 : ' + data.message + ' !');
                } else if (data.status === 403) {
                    ToastFacade.error('Erreur 403 : ' + data.message + ' !');
                } else if (data.status === 404) {
                    ToastFacade.error('Erreur 404 : ' + data.message + ' !');
                } else {
                    ToastFacade.error('Erreur : ' + data.message + ' !');
                }
            } catch (error) {
                console.error('Error while updating julia fractal', error);     
            } finally {
                handleCloseEditJuliaFractalModal();
            }
        }
    }

    return (
    <Modal
        size="lg"
        className="modal-dark "
        show={isModalEditJuliaFractalOpen}
        onHide={handleCloseEditJuliaFractalModal}
        centered
        >
            <Modal.Header  className="modal-dark-header">
                <Modal.Title>Modifier la Fractale</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-dark-body w-100">
                <div className="modal-dark-input-container d-flex flex-column align-items-start w-auto">
                    <canvas 
                    id="juliaFractalCanvas" 
                    ref={canvasRef}
                    width={CANVAS_WIDTH} 
                    height={CANVAS_HEIGHT}
                    ></canvas>
                    <Form className="react-form w-100 d-flex flex-column align-items-start" onSubmit={handleSubmit}>
                        <Form.Group className="w-100 mb-3" controlId="formFractalName">
                            <Form.Label>Nom</Form.Label>
                            <Form.Control 
                            type="text" 
                            placeholder="Nom de la fractale"
                            className="react-input mt-0 w-100"
                            required
                            value={fractalName}
                            onChange={(e) => setFractalName(e.target.value)}
                            title ="Nom de la fractale"
                            />
                        </Form.Group>
                        <Form.Group className="w-100 mb-3" controlId="formFractalComment">
                            <Form.Label>Commentaire</Form.Label>
                            <Form.Control 
                            type="text" 
                            as="textarea"
                            placeholder="Commentaire"
                            className="react-input mt-0 w-100"
                            required
                            value={fractalComment}
                            onChange={(e) => setFractalComment(e.target.value)}
                            title ="Commentaire de la fractale"
                            />
                        </Form.Group>
                        <Form.Check
                            type="checkbox"
                            label="Publique"
                            className="react-checkbox"
                            checked={isFractalPublic}
                            onChange={(e) => setIsFractalPublic(e.target.checked)}
                            title="Fractale visible par tous les utilisateurs"
                        />
                        <Form.Group className="w-100 mb-3" controlId="formFractalSeedReal">
                            <Form.Label className="text-small-black">Seed Real</Form.Label>
                            <Form.Control 
                            className="fractal-values-input-dark" 
                            type="number" 
                            step={JuliaFractalConfig.JULIA_FRACTAL_SEED_PARAMS_STEP} 
                            value={fractalSeedReal} 
                            onChange={(e) => setFractalSeedReal(Number(e.target.value))} />
                            <Form.Range 
                            className="fractal-values-range-dark" 
                            min={JuliaFractalConfig.JULIA_FRACTAL_SEED_PARAMS_MIN} 
                            max={JuliaFractalConfig.JULIA_FRACTAL_SEED_PARAMS_MAX} 
                            step={JuliaFractalConfig.JULIA_FRACTAL_SEED_PARAMS_STEP} 
                            value={fractalSeedReal} 
                            onChange={(e) => setFractalSeedReal(Number(e.target.value))} />
                        </Form.Group>
                        <Form.Group className="w-100 mb-3" controlId="formFractalSeedImag">
                            <Form.Label className="text-small-black">Seed Imag</Form.Label>
                            <Form.Control 
                            className="fractal-values-input-dark" 
                            type="number" 
                            step={JuliaFractalConfig.JULIA_FRACTAL_SEED_PARAMS_STEP} 
                            value={fractalSeedImag} 
                            onChange={(e) => setFractalSeedImag(Number(e.target.value))} />
                            <Form.Range 
                            className="fractal-values-range-dark" 
                            min={JuliaFractalConfig.JULIA_FRACTAL_SEED_PARAMS_MIN} 
                            max={JuliaFractalConfig.JULIA_FRACTAL_SEED_PARAMS_MAX} 
                            step={JuliaFractalConfig.JULIA_FRACTAL_SEED_PARAMS_STEP} 
                            value={fractalSeedImag} 
                            onChange={(e) => setFractalSeedImag(Number(e.target.value))} />
                        </Form.Group>
                        <Form.Group className="w-100 mb-3" controlId="formFractalMaxIter">
                            <Form.Label className="text-small-black">Max Iter</Form.Label>
                            <Form.Control 
                            className="fractal-values-input-dark" 
                            type="number" 
                            step={JuliaFractalConfig.JULIA_FRACTAL_ITER_PARAMS_STEP} 
                            value={fractalMaxIt} 
                            onChange={(e) => setFractalMaxIt(Number(e.target.value))} />
                            <Form.Range 
                            className="fractal-values-range-dark" 
                            min={JuliaFractalConfig.JULIA_FRACTAL_ITER_PARAMS_MIN} 
                            max={JuliaFractalConfig.JULIA_FRACTAL_ITER_PARAMS_MAX} 
                            step={JuliaFractalConfig.JULIA_FRACTAL_ITER_PARAMS_STEP} 
                            value={fractalMaxIt} 
                            onChange={(e) => setFractalMaxIt(Number(e.target.value))} />
                        </Form.Group>
                        <Form.Group className="w-100 mb-3" controlId="formFractalLimit">
                            <Form.Label className="text-small-black">Limit</Form.Label>
                            <Form.Control 
                            className="fractal-values-input-dark" 
                            type="number" 
                            step={JuliaFractalConfig.JULIA_FRACTAL_LIMIT_PARAMS_STEP} 
                            value={fractalLimit} 
                            onChange={(e) => setFractalLimit(Number(e.target.value))} />
                            <Form.Range 
                            className="fractal-values-range-dark" 
                            min={JuliaFractalConfig.JULIA_FRACTAL_LIMIT_PARAMS_MIN} 
                            max={JuliaFractalConfig.JULIA_FRACTAL_LIMIT_PARAMS_MAX} 
                            step={JuliaFractalConfig.JULIA_FRACTAL_LIMIT_PARAMS_STEP} 
                            value={fractalLimit} 
                            onChange={(e) => setFractalLimit(Number(e.target.value))} />
                        </Form.Group>
                        <p className="text-small-black"><strong>Création :</strong> {juliaFractal ? DateUtil.formatDate(juliaFractal.getCreatedAt()) : ''}</p>
                        <p className="text-small-black"><strong>Modification :</strong> {juliaFractal ? DateUtil.formatDate(juliaFractal.getUpdatedAt()) : ''}</p>
                        <div className="d-flex justify-content-center w-100">
                            <Button 
                            variant="primary" 
                            type="submit"
                            disabled={juliaFractal === null || !isFormValid}
                            className="btn btn-primary"
                            >Enregistrer</Button>
                        </div>
                    </Form>
                </div>
            </Modal.Body>
            <Modal.Footer className="modal-dark-footer">
                <Button 
                className="btn btn-primary"
                variant="primary" 
                onClick={handleCloseEditJuliaFractalModal} 
                type="button"
                >Fermer</Button>
            </Modal.Footer>
    </Modal>

    );
};  

export default EditJuliaFractalModal;