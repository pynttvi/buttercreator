import {PropsWithChildren, useState} from "react";
import {Button, Snackbar} from "@mui/material";

const CopyToClipboardButton = (props: PropsWithChildren<{ copyText: string }>) => {
    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen(true);
        navigator.clipboard.writeText(props.copyText);
    };

    return (
        props.copyText && props.copyText.trim() !== "" && (<>
            <Button onClick={handleClick} color="primary">
                Copy
            </Button>
            <Snackbar
                message="Copied to clibboard"
                anchorOrigin={{vertical: "top", horizontal: "center"}}
                autoHideDuration={2000}
                onClose={() => setOpen(false)}
                open={open}
            />
        </>)
    );
}


export default CopyToClipboardButton;
