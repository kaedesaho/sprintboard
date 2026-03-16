import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

const Settings = () => {
    const { userID, username, photoUrl, updatePhoto } = useAuth();

    // Photo form
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoMsg, setPhotoMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [photoUploading, setPhotoUploading] = useState(false);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handlePhotoUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!photoFile || !userID) return;
        setPhotoUploading(true);
        setPhotoMsg(null);
        const formData = new FormData();
        formData.append('photo', photoFile);
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/users/${userID}/photo`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                updatePhoto(data.photo_url);
                setPhotoMsg({ text: 'Photo updated successfully.', type: 'success' });
                setPhotoFile(null);
            } else {
                setPhotoMsg({ text: data.error, type: 'error' });
            }
        } catch {
            setPhotoMsg({ text: 'Server error. Please try again.', type: 'error' });
        } finally {
            setPhotoUploading(false);
        }
    };

    // Profile form
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [usernameField, setUsernameField] = useState('');
    const [email, setEmail] = useState('');
    const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [profileSaving, setProfileSaving] = useState(false);

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [passwordSaving, setPasswordSaving] = useState(false);

    useEffect(() => {
        if (!userID) return;
        fetch(`http://127.0.0.1:5000/api/users/${userID}`)
            .then(res => res.json())
            .then(data => {
                setFirstName(data.first_name ?? '');
                setLastName(data.last_name ?? '');
                setUsernameField(data.username ?? '');
                setEmail(data.email ?? '');
            })
            .catch(console.error);
    }, [userID]);

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMsg(null);
        setProfileSaving(true);
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/users/${userID}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ first_name: firstName, last_name: lastName, username: usernameField, email }),
            });
            const data = await res.json();
            if (data.success) {
                setProfileMsg({ text: 'Profile updated successfully.', type: 'success' });
            } else {
                setProfileMsg({ text: data.error, type: 'error' });
            }
        } catch {
            setProfileMsg({ text: 'Server error. Please try again.', type: 'error' });
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMsg(null);
        if (newPassword !== confirmPassword) {
            setPasswordMsg({ text: 'New passwords do not match.', type: 'error' });
            return;
        }
        setPasswordSaving(true);
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/users/${userID}/password`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
            });
            const data = await res.json();
            if (data.success) {
                setPasswordMsg({ text: 'Password changed successfully.', type: 'success' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPasswordMsg({ text: data.error, type: 'error' });
            }
        } catch {
            setPasswordMsg({ text: 'Server error. Please try again.', type: 'error' });
        } finally {
            setPasswordSaving(false);
        }
    };

    return (
        <div className="settings">
            <h1>Settings</h1>
            <hr className="settings-separator" />

            <div className="settings-section">
                <h2>Profile Photo</h2>
                <form className="settings-photo-form" onSubmit={handlePhotoUpload}>
                    <div className="settings-photo-preview">
                        {(photoPreview || photoUrl) ? (
                            <img
                                src={photoPreview ?? photoUrl!}
                                className="settings-avatar"
                                alt="avatar"
                            />
                        ) : (
                            <div className="settings-avatar-initials">
                                {username ? username[0].toUpperCase() : '?'}
                            </div>
                        )}
                    </div>
                    <div className="settings-photo-controls">
                        <label className="settings-photo-label">
                            Choose photo
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="settings-photo-input"
                            />
                        </label>
                        <button
                            type="submit"
                            className="settings-save-btn"
                            disabled={!photoFile || photoUploading}
                        >
                            {photoUploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                    {photoMsg && (
                        <p className={`settings-feedback ${photoMsg.type}`}>{photoMsg.text}</p>
                    )}
                </form>
            </div>

            <div className="settings-section">
                <h2>Personal Information</h2>
                <form className="settings-form" onSubmit={handleProfileSave}>
                    <div className="settings-row">
                        <div className="settings-field">
                            <label>First Name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                placeholder="First name"
                            />
                        </div>
                        <div className="settings-field">
                            <label>Last Name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                placeholder="Last name"
                            />
                        </div>
                    </div>
                    <div className="settings-field">
                        <label>Username</label>
                        <input
                            type="text"
                            value={usernameField}
                            onChange={e => setUsernameField(e.target.value)}
                            required
                        />
                    </div>
                    <div className="settings-field">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {profileMsg && (
                        <p className={`settings-feedback ${profileMsg.type}`}>{profileMsg.text}</p>
                    )}
                    <button type="submit" className="settings-save-btn" disabled={profileSaving}>
                        {profileSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>

            <div className="settings-section">
                <h2>Change Password</h2>
                <form className="settings-form" onSubmit={handlePasswordSave}>
                    <div className="settings-field">
                        <label>Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="settings-field">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="settings-field">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    {passwordMsg && (
                        <p className={`settings-feedback ${passwordMsg.type}`}>{passwordMsg.text}</p>
                    )}
                    <button type="submit" className="settings-save-btn" disabled={passwordSaving}>
                        {passwordSaving ? 'Saving...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
