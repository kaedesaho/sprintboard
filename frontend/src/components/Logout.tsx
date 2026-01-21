import './Logout.css';

interface LogoutModalProps {
    onConfirm: () => void;
    onCancel: () => void;
}

const LogoutModal = ({ onConfirm, onCancel }: LogoutModalProps) => {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Logout Account</h2>
                <p>Are you sure you want to logout?</p>
                <div className="modal-buttons">
                    <button onClick={onCancel} className="logout-cancel">Cancel</button>
                    <button onClick={onConfirm} className="logout-confirm">Logout</button>
                </div>
            </div>
        </div>
    );
}
export default LogoutModal;