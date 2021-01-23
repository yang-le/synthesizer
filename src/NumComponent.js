'use strict';

import Rete from 'rete';

export const numSocket = new Rete.Socket('Number');

var VueNumControl = {
    props: ['readonly', 'emitter', 'ikey', 'getData', 'putData'],
    template: '<form><label>{{ikey}}</label>\
                <input type="number" :readonly="readonly" :value="value" @input="change($event)"/></form>',
    data() {
        return {
            value: 0,
        }
    },
    methods: {
        change(e) {
            this.value = +e.target.value;
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
};

export class NumControl extends Rete.Control {

    constructor(emitter, key, readonly) {
        super(key);
        this.component = VueNumControl;
        this.props = { emitter, ikey: key, readonly };
    }

    setValue(val) {
        this.vueContext.value = val;
    }
}

export class NumComponent extends Rete.Component {

    constructor() {
        super("Number");
    }

    builder(node) {
        var out = new Rete.Output('num', "Number", numSocket);
        return node.addControl(new NumControl(this.editor, 'num')).addOutput(out);
    }

    worker(node, inputs, outputs) {
        outputs['num'] = node.data.num;
    }
}
