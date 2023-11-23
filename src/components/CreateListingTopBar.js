import { Button } from "./ui/button";

const CreateListingTopBar = ({ onSaveExit }) => (
    <div className="top-bar">
        <Button
            variant="outline"
            size="lg"
            className="font-normal text-base text-slate-600"
            onClick={onSaveExit}
        >
            Save and Exit
        </Button>
    </div>
);

export default CreateListingTopBar;
