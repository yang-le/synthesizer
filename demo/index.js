'use strict';

import synth from '../build/synthesizer.esm.js';
import Rete from 'rete';
import ConnectionPlugin2 from 'rete-connection-plugin';
import VueRenderPlugin from 'rete-vue-render-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

(async () => {
    var container = document.querySelector('body');
    var components = [new synth.OSCComponent(audioCtx), new synth.AudioSinkComponent(audioCtx), new synth.VisualComponent(audioCtx), new synth.NumComponent()];

    var editor = new Rete.NodeEditor('demo@0.1.0', container);
    editor.use(VueRenderPlugin);
    editor.use(ContextMenuPlugin);
    editor.use(ConnectionPlugin2);

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
    console.log(synth);
})();