import { renderToStaticMarkup } from 'react-dom/server';

export function renderEmailHtml(component) {
    return renderToStaticMarkup(component);
}
