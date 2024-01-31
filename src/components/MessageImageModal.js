import Image from "next/image";
import { Dialog, DialogContent } from "./ui/dialog";

const MessageImageModal = ({ isOpen, onClose, src }) => {
    if (!src) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <div className="w-80 h-80">
                    <Image
                        className="object-cover"
                        fill
                        alt="Image"
                        src={src}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MessageImageModal;
