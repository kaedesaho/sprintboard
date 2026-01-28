import '../Logout.css';

function ConfirmModal({ 
    title, 
    message, 
    confirmText,
    onConfirm,
    onCancel 
}: { 
    title: string;
    message?: string;
    confirmText: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>{title}</h2>
                {message && <p>{message}</p>}
                <div className="modal-buttons">
                    <button onClick={onCancel} className="modal-cancel">Cancel</button>
                    <button onClick={onConfirm} className="modal-confirm">{confirmText}</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;