import { Button, Form, Modal } from "react-bootstrap";
import { JuliaFractalParams, Nullable } from "../../types/indexType";
import React from "react";
import CanvasService from "../../services/CanvasService";
import { JuliaFractal } from "../../model/JuliaFractal";
import { ComplexNb } from "../../model/ComplexNb";
import JuliaFractalService from "../../services/JuliaFractalService";
import ToastFacade from "../../facade/ToastFacade";


type NewJuliaFractalModalProps = {
    isModalNewJuliaFractalOpen: boolean;
    handleCloseNewJuliaFractalModal: () => void;
    newJuliaFractalParams: JuliaFractalParams;
    reloadAllJuliaFractals: () => void;
}


const NewJuliaFractalModal = ({
    isModalNewJuliaFractalOpen, 
    handleCloseNewJuliaFractalModal, 
    newJuliaFractalParams,
    reloadAllJuliaFractals
}: NewJuliaFractalModalProps): React.ReactElement => {

    const [isDrawing, setIsDrawing] = React.useState<boolean>(false);
    const [fractalName, setFractalName] = React.useState<string>("");
    const [fractalComment, setFractalComment] = React.useState<string>("");
    const [isFractalPublic, setIsFractalPublic] = React.useState<boolean>(false);
    const [isFormValid, setIsFormValid] = React.useState<boolean>(false);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const canvasService = CanvasService.getInstance();
    const juliaFractalService = JuliaFractalService.getInstance();
    const newJuliaFractalRef = React.useRef<Nullable<JuliaFractal>>(null);

    React.useEffect(() => {
        if (fractalName !== "" && fractalComment !== "") {
            setIsFormValid(true);
        } else {
            setIsFormValid(false);
        }
    }, [fractalName, fractalComment]);

    React.useEffect(() => {
            if (canvasRef.current !== null && newJuliaFractalParams) {
                const fct = async () => {
                    if (canvasRef.current === null) return;
                    setIsDrawing(true);
                    newJuliaFractalRef.current = new JuliaFractal(-1,
                        "Nouvelle Fractale", "Commentaire à écrire", new ComplexNb(true, newJuliaFractalParams.seedReal, newJuliaFractalParams.seedImag), newJuliaFractalParams.limit, newJuliaFractalParams.maxIter, false,
                        "", ""
                    );
                    await draw();
                    setIsDrawing(false);
                }
                fct();
            }
        }, [newJuliaFractalParams]);

        const draw = async () =>  {
        if(canvasRef.current === null) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;
        if (!newJuliaFractalRef.current) return;
        let buffer: ImageData = await canvasService.computeBufferWithWorker(newJuliaFractalRef.current, canvasRef.current.width, canvasRef.current.height);
        ctx.putImageData(buffer, 0, 0);

    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if(!newJuliaFractalRef.current || fractalName === "" || fractalComment === "") return;
        newJuliaFractalRef.current!.setName(fractalName);
        newJuliaFractalRef.current!.setComment(fractalComment);
        newJuliaFractalRef.current!.setIsPublic(isFractalPublic);

        const response = await juliaFractalService.createJuliaFractal(newJuliaFractalRef.current!);

        if(!response) return;

        try {
            const data = await response.json();
            if (data.status === 200) {
                ToastFacade.success('Création réussie : ' + data.message + ' !');
                await reloadAllJuliaFractals();
            }
            else if (data.status === 400) {
                ToastFacade.error('Erreur 400 : ' + data.message + ' !');
            }
            else if (data.status === 403) {
                ToastFacade.error('Erreur 403 : ' + data.message + ' !');
            }
            else if (data.status === 404) {
                ToastFacade.error('Erreur 404 : ' + data.message + ' !');
            }
            else {
                ToastFacade.error('Erreur : ' + data.message + ' !');
            }
        }
        catch (error) {
            ToastFacade.error('Erreur lors de la création de la fractale !');
        }
        finally {
            handleCloseNewJuliaFractalModal();
            setFractalName("");
            setFractalComment("");
            setIsFractalPublic(false);
        }

    }
    
    return (
        <Modal
            size="lg"
            className="modal-dark "
            show={isModalNewJuliaFractalOpen}
            onHide={handleCloseNewJuliaFractalModal}
            centered
            >
            <Modal.Header  className="modal-dark-header">
                <Modal.Title>Nouvelle Fractale</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-dark-body w-100">
                 <div className="modal-dark-input-container d-flex flex-column align-items-start w-auto">
                    <canvas 
                    id="juliaFractalCanvas" 
                    ref={canvasRef}
                    width={400} 
                    height={400}
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
                        <p className="text-medium-black"><strong>Seed :</strong> {newJuliaFractalRef.current?.getSeed().getReal()} + {newJuliaFractalRef.current?.getSeed().getImag()}i</p>
                        <p className="text-medium-black"><strong>Limit :</strong> {newJuliaFractalRef.current?.getLimit()}</p>
                        <p className="text-medium-black"><strong>Max iter. :</strong> {newJuliaFractalRef.current?.getMaxIt()}</p>
                        <div className="d-flex justify-content-center w-100">
                            <Button 
                            variant="primary" 
                            type="submit"
                            disabled={isDrawing || !newJuliaFractalRef.current || !isFormValid}
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
                onClick={handleCloseNewJuliaFractalModal} 
                type="button"
                >Fermer</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default NewJuliaFractalModal;