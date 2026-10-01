import UserSettingsPanel from '../components/UserSettingsPanel';
import './Settings.css';

const Settings = () => {
    return (
        <div className="settings">
            <div className="settings-header">
                <h1>User Settings</h1>
            </div>
            <div className="settings-body">
                <UserSettingsPanel />
            </div>
        </div>
    );
};

export default Settings;
