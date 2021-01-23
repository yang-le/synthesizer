'use strict';

import Rete from 'rete';
import {audioSocket, AudioComponent} from './common';
import {numSocket, NumControl} from './NumComponent';

var VueOSCControl = {
    props: ['emitter', 'ikey', 'getData', 'putData'],
    template: '<form><label>{{ikey}}</label>\
                <select @input="change($event)">\
                <option value="sine">sine</option>\
                <option value="square">square</option>\
                <option value="sawtooth">sawtooth</option>\
                <option value="triangle">triangle</option>\
                <option value="custom">custom</option>\
                </select></form>',
    data() {
        return {
            // value: 'sine',
        }
    },
    methods: {
        change(e) {
            this.value = e.target.value;
            this.update();
        },
        update() {
            if (this.ikey)
                this.putData(this.ikey, this.value)
            this.emitter.trigger('process');
        }
    },
    mounted() {
        this.value = this.getData(this.ikey);
    }
}



class OSCControl extends Rete.Control {
    constructor(emitter, key) {
        super(key);
        this.component = VueOSCControl;
        this.props = { emitter, ikey: key };
    }

    setValue(val) {
        this.vueContext.value = val;
    }
}

export class OSCComponent extends AudioComponent {
    constructor(audioCtx) {
        super("OSC", audioCtx);
    }

    builder(node) {
        var out = new Rete.Output('out', "Out", audioSocket);
        var input1 = new Rete.Input('freq', "Freq", numSocket);
        var input2 = new Rete.Input('detune', "Detune", numSocket);

        input1.addControl(new NumControl(this.editor, 'freq'));
        input2.addControl(new NumControl(this.editor, 'detune'));

        var control = new OSCControl(this.editor, 'type');
        node.addControl(control);

        var osc = this.context.createOscillator();
        control.putData('osc', osc);

        osc.start();

        return node.addInput(input1).addInput(input2).addOutput(out);
    }

    worker(node, inputs, outputs) {
        if (node.data.type)
            node.data.osc.type = node.data.type

        if (inputs['freq'].length)
            node.data.osc.frequency.value = inputs['freq'][0];
        else if (node.data.freq)
            node.data.osc.frequency.value = node.data.freq;

        if (inputs['detune'].length)
            node.data.oscdetune.value = inputs['detune'][0];
        else if (node.data.detune)
            node.data.osc.detune.value = node.data.detune;

        outputs['out'] = node.data.osc;
    }
}