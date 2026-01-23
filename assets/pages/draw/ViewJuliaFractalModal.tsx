import { Button, Modal } from "react-bootstrap";
import { JuliaFractal } from '../../model/JuliaFractal';
import { Nullable } from "../../types/commonTypes";
import DateUtil from "../../utils/DateUtil";
import React from "react";
import CanvasService from "../../services/CanvasService";

type ViewJuliaFractalModalProps = {
    isModalViewJuliaFractalOpen: boolean,
    handleCloseViewJuliaFractalModal: () => void,
    juliaFractal: Nullable <JuliaFractal>
};

const ViewJuliaFractalModal = (
    { 
        isModalViewJuliaFractalOpen, 
        handleCloseViewJuliaFractalModal, 
        juliaFractal
    }: ViewJuliaFractalModalProps
) : React.ReactElement => {
    //console.log('user ' + juliaFractal?.getUser());
    const [isDrawing, setIsDrawing] = React.useState<boolean>(false);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const canvasService = CanvasService.getInstance();

    React.useEffect(() => {
        if (canvasRef.current !== null && juliaFractal) {
            const fct = async () => {
                if (canvasRef.current === null) return;
                setIsDrawing(true);
                await draw();
                setIsDrawing(false);
            }
            fct();
        }
    }, [juliaFractal]);

    const draw = async () =>  {
        if(canvasRef.current === null) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;
        if (!juliaFractal) return;
        const buffer: ImageData = await canvasService.computeBufferWithWorker(juliaFractal, canvasRef.current.width, canvasRef.current.height);
        ctx.putImageData(buffer, 0, 0);

    }

    return (
        <Modal
            size="lg"
            className="modal-dark"
            show={isModalViewJuliaFractalOpen} 
            onHide={handleCloseViewJuliaFractalModal} 
            centered
        >
            <Modal.Header className="modal-dark-header">
                <Modal.Title>Voir les paramètres de la fractale</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-dark-body">
                <div className="modal-dark-input-container">
                    <canvas 
                    id="juliaFractalCanvas" 
                    ref={canvasRef}
                    width={400} 
                    height={400}
                    ></canvas>
                    <p className="text-medium-black"><strong>Nom :</strong> {juliaFractal?.getName()}</p>
                    <p className="text-medium-black"><strong>Commentaire :</strong> {juliaFractal?.getComment()}</p>
                    {juliaFractal?.getUser() && (
                        <p className="text-medium-black"><strong>Pseudo :</strong> {juliaFractal?.getUser()?.pseudo}</p>
                    )}
                    <p className="text-medium-black"><strong>Seed :</strong> {juliaFractal?.getSeed().getReal()} + {juliaFractal?.getSeed().getImag()}i</p>
                    <p className="text-medium-black"><strong>Max Itérations :</strong> {juliaFractal?.getMaxIt()}</p>
                    <p className="text-medium-black"><strong>Limit :</strong> {juliaFractal?.getLimit()}</p>
                    <p className="text-small-black"><strong>Création :</strong> {juliaFractal ? DateUtil.formatDate(juliaFractal.getCreatedAt()) : ''}</p>
                    <p className="text-small-black"><strong>Modification :</strong> {juliaFractal ? DateUtil.formatDate(juliaFractal.getUpdatedAt()) : ''}</p>
                </div>
            </Modal.Body>
            <Modal.Footer className="modal-dark-footer">
                <Button variant="primary" onClick={handleCloseViewJuliaFractalModal} type="button">Fermer</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ViewJuliaFractalModal;