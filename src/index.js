import Rete from 'rete';
import ConnectionPlugin from 'rete-connection-plugin';
import VueRenderPlugin from 'rete-vue-render-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';

// create web audio api context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const numSocket = new Rete.Socket('Number');
const audioSocket = new Rete.Socket('Audio');

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

class NumControl extends Rete.Control {

    constructor(emitter, key, readonly) {
        super(key);
        this.component = VueNumControl;
        this.props = { emitter, ikey: key, readonly };
    }

    setValue(val) {
        this.vueContext.value = val;
    }
}

class NumComponent extends Rete.Component {

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

var VueVisualControl = {
    props: ['emitter', 'ikey', 'getData', 'putData'],
    template: '<div><canvas></canvas>\
                <select @input="change($event)">\
                <option value="wave">wave</option>\
                <option value="fft">fft</option>\
                </select></div>',
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
        this.putData('canvas', this.$root.$el.querySelector('canvas'));
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

class VisualControl extends Rete.Control {
    constructor(emitter, key) {
        super(key);
        this.component = VueVisualControl;
        this.props = { emitter, ikey: key };
    }

    setValue(val) {
        this.vueContext.value = val;
    }
}

class ReteControl extends Rete.Control {}

class AudioComponent extends Rete.Component {
    constructor(name, audioCtx) {
        super(name);
        this.context = audioCtx;
    }
}

class VisualComponent extends AudioComponent {
    constructor(audioCtx) {
        super("Visual", audioCtx);
    }

    builder(node) {
        var input = new Rete.Input('in', "In", audioSocket);
        var output = new Rete.Output('out', "Out", audioSocket);

        var control = new VisualControl(this.editor, 'type');
        node.addControl(control);

        var analyser = this.context.createAnalyser();
        control.putData('analyser', analyser);
        control.putData('input', null);

        return node.addInput(input).addOutput(output);
    }

    worker(node, inputs, outputs) {
        if (!node.data.input)
            node.data.input = inputs['in'][0];

        if (inputs['in'].length > 0) {
            node.data.input = inputs['in'][0];
            node.data.input.connect(node.data.analyser);
        } else if (node.data.input) {
            node.data.input.disconnect();
            node.data.input = null;
        }

        function drawFFT(analyser, canvas) {
            var WIDTH = canvas.width;
            var HEIGHT = canvas.height;
            var canvasCtx = canvas.getContext("2d");

            analyser.fftSize = 256;
            var bufferLengthAlt = analyser.frequencyBinCount;
            var dataArrayAlt = new Uint8Array(bufferLengthAlt);

            canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

            var drawAlt = function () {
                requestAnimationFrame(drawAlt);

                analyser.getByteFrequencyData(dataArrayAlt);

                canvasCtx.fillStyle = 'rgb(0, 0, 0)';
                canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

                var barWidth = (WIDTH / bufferLengthAlt) * 2.5;
                var barHeight;
                var x = 0;

                for (var i = 0; i < bufferLengthAlt; i++) {
                    barHeight = dataArrayAlt[i];

                    canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
                    canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

                    x += barWidth + 1;
                }
            };

            drawAlt();
        }

        function drawWave(analyser, canvas) {
            var WIDTH = canvas.width;
            var HEIGHT = canvas.height;
            var canvasCtx = canvas.getContext("2d");

            analyser.fftSize = 2048;
            var bufferLength = analyser.fftSize;
            var dataArray = new Uint8Array(bufferLength);

            canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

            var draw = function () {
                requestAnimationFrame(draw);

                analyser.getByteTimeDomainData(dataArray);

                canvasCtx.fillStyle = 'rgb(200, 200, 200)';
                canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

                canvasCtx.lineWidth = 2;
                canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

                canvasCtx.beginPath();

                var sliceWidth = WIDTH * 1.0 / bufferLength;
                var x = 0;

                for (var i = 0; i < bufferLength; i++) {

                    var v = dataArray[i] / 128.0;
                    var y = v * HEIGHT / 2;

                    if (i === 0) {
                        canvasCtx.moveTo(x, y);
                    } else {
                        canvasCtx.lineTo(x, y);
                    }

                    x += sliceWidth;
                }

                canvasCtx.lineTo(canvas.width, canvas.height / 2);
                canvasCtx.stroke();
            };

            draw();
        }

        if (node.data.type == 'fft')
            drawFFT(node.data.analyser, node.data.canvas);
        else
            drawWave(node.data.analyser, node.data.canvas);

        outputs['out'] = node.data.analyser;
    }
}

class OSCComponent extends AudioComponent {
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

class AudioSinkComponent extends AudioComponent {
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


(async () => {
    var container = document.querySelector('body');
    var components = [new OSCComponent(audioCtx), new AudioSinkComponent(audioCtx), new VisualComponent(audioCtx), new NumComponent()];

    var editor = new Rete.NodeEditor('demo@0.1.0', container);
    editor.use(ConnectionPlugin);
    editor.use(VueRenderPlugin);
    editor.use(ContextMenuPlugin);
    // editor.use(AreaPlugin);
    // editor.use(CommentPlugin);
    // editor.use(HistoryPlugin);
    // editor.use(ConnectionMasteryPlugin);

    var engine = new Rete.Engine('demo@0.1.0');

    components.map(c => {
        editor.register(c);
        engine.register(c);
    });

    editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
        await engine.abort();
        await engine.process(editor.toJSON());
    });

    editor.view.resize();
    editor.trigger('process');
})();
