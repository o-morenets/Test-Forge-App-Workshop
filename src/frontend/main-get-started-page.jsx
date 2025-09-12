import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text } from '@forge/react';
import { invoke } from '@forge/bridge';
const App = () => {
    const [data, setData] = useState(null);
    useEffect(() => {
        invoke('getAdminGetStartedText', { example: 'my-invoke-variable' }).then(setData);
    }, []);
    return (
        <>
            <Text>Admin Get started Page</Text>
            <Text>{data ? data : 'Loading...'}</Text>
        </>
    );
};
ForgeReconciler.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
