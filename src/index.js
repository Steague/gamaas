// @flow

'use strict';

import gamaas from './gamaas';

gamaas.init({
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
.progress("clickedThing1")
// .progress("clickedThing2")
// .reset("clickedThing1")
// .award("clickedThing1")
// .reset("clickedThing1", true)
.displayAchievements()
.displayPoints()
.displayConfig();
