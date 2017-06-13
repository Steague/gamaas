// @flow

'use strict';

import Gamaas from './gamaas';

Gamaas.init({
    achievements: {
        clickedThing1 : {
            title          : "Clicked a thing",
            worth          : 5,
            required       : 5,
            exceedRequired : false
        },
        clickedThing2 : {
            title          : "Clicked another thing",
            worth          : 5,
            required       : 5,
            exceedRequired : false
        }
    },
    store : {
        when    : "always",
        dataKey : "achievements"
    }
})
.on("progress", ({id}) => {
    console.log("A progress event!", id);
})
.on("regress", ({id}) => {
    console.log("A regress event!", id);
})
.on("award", ({id}) => {
    console.log("An award event!", id);
})
.on("reset", ({id}) => {
    console.log("A reset event!", id);
});

window.gamaas = Gamaas;
