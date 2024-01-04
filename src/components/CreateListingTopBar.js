import { Button } from "./ui/button";

const CreateListingTopBar = ({ onSaveExit }) => (
    <div className="px-8 py-8 fixed inset-x-0 top-0 bg-white z-10">
        <Button
            variant="outline"
            size="sm"
            className="text-sm text-slate-600"
            onClick={onSaveExit}
        >
            Save and Exit
        </Button>
    </div>
);

export default CreateListingTopBar;
