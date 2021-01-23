'use strict';

import Rete from 'rete';

// create web audio api context
export const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
export const audioSocket = new Rete.Socket('Audio');

export class ReteControl extends Rete.Control {}

export class AudioComponent extends Rete.Component {
    constructor(name, audioCtx) {
        super(name);
        this.context = audioCtx;
    }
}
