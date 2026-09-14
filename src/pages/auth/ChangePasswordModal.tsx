import { useState, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, X } from "lucide-react";
import {
  changePassword,
  clearAuthError,
  clearChangePasswordState,
} from "../../store/authSlice";
import type { AppDispatch } from "../../store/store";
import {
  selectAuthLoading,
  selectAuthError,
  selectAuthFieldErrors,
  selectChangePasswordSuccess,
} from "../../store/authSlice";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const fieldErrors = useSelector(selectAuthFieldErrors);
  const success = useSelector(selectChangePasswordSuccess);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const passwordsMatch = newPassword === confirmPassword || confirmPassword === "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());

    const result = await dispatch(
      changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      })
    );

    if (changePassword.fulfilled.match(result)) {
      setTimeout(() => {
        dispatch(clearChangePasswordState());
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onClose();
      }, 2000);
    }
  };

  const handleClose = () => {
    dispatch(clearChangePasswordState());
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-ink/30" onClick={handleClose} />
      <div className="relative bg-surface rounded-md shadow-soft w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg text-ink">Change password</h2>
          <button
            onClick={handleClose}
            className="text-muted hover:text-ink p-1"
          >
            <X size={18} />
          </button>
        </div>

        {success && (
          <div className="mb-4 rounded-sm bg-moss-100 border border-moss-500/20 px-4 py-3">
            <p className="text-sm text-moss-500">
              Password changed successfully!
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-sm bg-brick-100 border border-brick-500/20 px-4 py-3">
            <p className="text-sm text-brick-600">{error}</p>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="old-password">
                Current password
              </label>
              <div className="relative">
                <input
                  id="old-password"
                  className="input pr-10"
                  type={showOld ? "text" : "password"}
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  tabIndex={-1}
                >
                  {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors?.old_password && (
                <p className="text-xs text-brick-500 mt-1">
                  {fieldErrors.old_password[0]}
                </p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="new-password-input">
                New password
              </label>
              <div className="relative">
                <input
                  id="new-password-input"
                  className="input pr-10"
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors?.new_password && (
                <p className="text-xs text-brick-500 mt-1">
                  {fieldErrors.new_password[0]}
                </p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="confirm-new-password">
                Confirm new password
              </label>
              <input
                id="confirm-new-password"
                className="input"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              {!passwordsMatch && confirmPassword && (
                <p className="text-xs text-brick-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading || !passwordsMatch}
              >
                {isLoading ? "Changing..." : "Change password"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
