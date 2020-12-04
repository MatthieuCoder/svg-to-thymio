/*
 *
 *  * This file is subject to the terms and conditions defined in
 *  * file 'LICENSE.txt', which is part of this source code package.
 *
 */

import {drawPointsToCanvas, getIframe, processPath, toInstructions} from './functions';
import {TinyTurtle} from "./tiny-turtle";

let settingsElements: {
    availablePaths: HTMLSelectElement;
    resolution: HTMLInputElement;
    svg: HTMLTextAreaElement;
    doStuff: HTMLButtonElement;
};

const settings: {
    availablePaths: SVGPathElement[];
} = {
    availablePaths: [],
};

export let turtle: TinyTurtle;

/*
 * Parse a file and searches for paths to update the settings page (available paths)
 */
export function parseFile (fileString: string) {
    const iframe = getIframe();
    // Put the string in the content of the iframe for parsing.
    if (!iframe.contentDocument) return;
    iframe.contentDocument.body.innerHTML = fileString;
    settings.availablePaths = [];
    /*
     * For all the paths
     */
    // @ts-ignore
    for (const element of iframe.contentDocument.getElementsByTagName('path')) {
        settings.availablePaths.push(element);
    }
    updateSettings();
}


const updateSettings = () => {
    // Updates the available paths.
    {
        let inner = '';
        for (const path of settings.availablePaths) {
            inner += `<option name="${path.id}">#${path.id}</option>`;
        }
        settingsElements.availablePaths.innerHTML = inner;
    }
};

export const doStuff = () => {

    const path = settingsElements.availablePaths.options[settingsElements.availablePaths.selectedIndex];
    const name = path.getAttribute("name");
    const element = settings.availablePaths.find((element) => {
        return element.getAttribute("id") === name;
    });
    if (!element) return;
    const resolution = parseInt((document.getElementById('resolution') as HTMLInputElement).value);
    const paths = processPath(element, resolution);
    const tinstructions = toInstructions(paths);
    drawPointsToCanvas(tinstructions);
    let inner = '<ul>';
    inner += tinstructions.reduce<string>((e, instruction) => {
        return `${e} \n <li>Tourner de ${(((instruction.rot || 0))).toFixed(2)} degrés et Avancer de ${((instruction.val || 0)).toFixed(2)} cm</li>`;
    }, '');

    inner += '</ul><h2>Bytecode thymio</h2>'
    inner += '[';
    inner += tinstructions.reduce<string[]>((e, instruction) => {
        return [ ...e, (instruction.val || 0).toFixed(0), (instruction.rot || 0).toFixed(0) ];
    }, []).join(', ');
    inner += ']';

    (document.getElementById('code') as HTMLParagraphElement).innerHTML = inner;
};

const fileContentChange = () => {
    const svgString = settingsElements.svg.value;
    parseFile(svgString);
};

const init = () => {
    settingsElements = {
        availablePaths: document.getElementById("availablePaths") as HTMLSelectElement,
        resolution: document.getElementById("resolution") as HTMLInputElement,
        svg: document.getElementById("svg") as HTMLTextAreaElement,
        doStuff: document.getElementById("do") as HTMLButtonElement
    };
    settingsElements.svg.addEventListener('change', fileContentChange);
    settingsElements.doStuff.addEventListener('click', doStuff);
    turtle = new TinyTurtle(document.getElementById('result') as HTMLCanvasElement);
};
document.addEventListener('DOMContentLoaded', init);
