'use strict';

import Rete from 'rete';
import ConnectionPlugin from 'rete-connection-plugin';
import VueRenderPlugin from 'rete-vue-render-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';

import {audioCtx} from './common';
import {NumComponent} from './NumComponent';
import {VisualComponent} from './VisualComponent';
import {OSCComponent} from './OSCComponent';
import {AudioSinkComponent} from './AudioSinkComponent'

(async () => {
    var container = document.querySelector('body');
    var components = [new OSCComponent(audioCtx), new AudioSinkComponent(audioCtx), new VisualComponent(audioCtx), new NumComponent()];

    var editor = new Rete.NodeEditor('demo@0.1.0', container);
    editor.use(ConnectionPlugin);
    editor.use(VueRenderPlugin);
    editor.use(ContextMenuPlugin);

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
