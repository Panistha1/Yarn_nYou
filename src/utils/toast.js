import { toast } from "react-toastify";

// Thin wrapper so every page just calls showSuccess/showError instead of
// importing react-toastify directly and repeating the same options
// everywhere. Replaces the old alert()/window.confirm() notifications
// used throughout the app.

const baseOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
};

export function showSuccess(message) {
  toast.success(message, baseOptions);
}

export function showError(message) {
  toast.error(message, { ...baseOptions, autoClose: 4500 });
}

export function showInfo(message) {
  toast.info(message, baseOptions);
}