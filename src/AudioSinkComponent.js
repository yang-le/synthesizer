'use strict';

import Rete from 'rete';
import {audioSocket, AudioComponent, ReteControl} from './common';

export class AudioSinkComponent extends AudioComponent {
    constructor(audioCtx) {
        super("Sink", audioCtx);
    }

    builder(node) {
        var input = new Rete.Input('in', "In", audioSocket);
        
        var control = new ReteControl('input');
        node.addControl(control);

        control.putData('input', null);
        return node.addInput(input);
    }

    worker(node, inputs/*, outputs*/) {
        if (!node.data.input && inputs['in'][0]) {
            node.data.input= inputs['in'][0];
            node.data.input.connect(this.context.destination);
        }

        if (node.data.input && !inputs['in'][0]) {
            node.data.input.disconnect();
            node.data.input = null;
        }
    }
}
