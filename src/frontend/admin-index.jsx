import React, { useState } from "react";
import { invoke } from "@forge/bridge";
import ForgeReconciler, {
    Button,
    Label,
    RequiredAsterisk,
    Textfield,
} from "@forge/react";

const App = () => {
    const [regionVal, setRegionVal] = useState();
    const [accessKeyIdVal, setAccessKeyIdVal] = useState();
    const [secretAccessKeyVal, setSecretAccessKeyVal] = useState();

    const change_aws_region = (event) => {
        setRegionVal(event.target.value);
    };

    const change_aws_access_key_id = (event) => {
        setAccessKeyIdVal(event.target.value);
    };

    const change_aws_secret_access_key = (event) => {
        setSecretAccessKeyVal(event.target.value);
    };

    const save = () => {
        invoke("save", {
            aws_region: regionVal,
            aws_access_key_id: accessKeyIdVal,
            aws_secret_access_key: secretAccessKeyVal,
        });
    };

    return (
        <>
            <Label labelFor="aws_region_text_field">
                AWS Region:
                <RequiredAsterisk />
            </Label>
            <Textfield
                appearance="standard"
                value={regionVal}
                onChange={change_aws_region}
            />
            <Label labelFor="aws_access_key_id_text_field">
                AWS Access Key Id:
                <RequiredAsterisk />
            </Label>
            <Textfield
                appearance="standard"
                value={accessKeyIdVal}
                onChange={change_aws_access_key_id}
            />
            <Label labelFor="aws_secret_access_key_text_field">
                AWS Secret Access Key:
                <RequiredAsterisk />
            </Label>
            <Textfield
                appearance="standard"
                value={secretAccessKeyVal}
                onChange={change_aws_secret_access_key}
            />
            <Button appearance="primary" type="submit" onClick={save}>
                Save
            </Button>
        </>
    );
};

ForgeReconciler.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
