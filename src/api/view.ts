import WebAppView from 'greyscript-meta-web/dist/web/app';
import React from 'react';
import { createRoot } from 'react-dom/client';

const EXTERNAL_META_WEBSITE = process.env.GREYBEL_DOCUMENTATION_URL;

function shareLink(type: string, methodName: string) {
  const url = new URL(EXTERNAL_META_WEBSITE);
  url.searchParams.set('filter', `${type}.${methodName}`);

  navigator.clipboard.writeText(url.toString());
}

const root = createRoot(document.querySelector('#root')!);
root.render(
  React.createElement(WebAppView, {
    defaultTags: ['detached'],
    externalLinks: [],
    filterInit: (window as any).filterInit || '',
    scrollToInit: '',
    onCopyClick: shareLink
  })
);
