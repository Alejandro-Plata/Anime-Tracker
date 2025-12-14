import { ToastType } from "./toastType";

export interface ToastState {
    show: boolean;
    type: ToastType;
    title: string;
    message: string;
}