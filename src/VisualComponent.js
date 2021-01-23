'use strict';

import Rete from 'rete';
import {audioSocket, AudioComponent} from './common';

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

export class VisualComponent extends AudioComponent {
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
