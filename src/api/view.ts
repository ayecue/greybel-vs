import { WebAppView } from 'greyscript-meta';
import React from 'react';
import { createRoot } from 'react-dom/client';

const root = createRoot(document.querySelector('#root')!);
root.render(React.createElement(WebAppView));
