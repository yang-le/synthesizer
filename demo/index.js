'use strict';

import Synth from '../build/synthesizer.esm.js';
import Rete from 'rete';
import ConnectionPlugin from 'rete-connection-plugin';
import VueRenderPlugin from 'rete-vue-render-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

(async () => {
    var container = document.querySelector('body');
    var components = Object.keys(Synth).map(k => {
        return new Synth[k](audioCtx);
    });

    var editor = new Rete.NodeEditor('demo@0.1.0', container);
    editor.use(VueRenderPlugin);
    editor.use(ContextMenuPlugin);
    editor.use(ConnectionPlugin);

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