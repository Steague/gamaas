# GAMaaS
[![npm version](https://badge.fury.io/js/gamaas.svg)](https://badge.fury.io/js/gamaas)

Add locally stored achievements to your web application and encourage users to continue using and learning.

Installation
---
```
npm install gamaas --save
```

Usage
---
Most functions in this project are chain-able and allow you to append a `.` and the next function you wish to call.
###Quickstart
To get started quickly, run the below command to run the application in a Webpack'd server.

```
npm run start
```
Now point your browser to `http://localhost:8090/`, open your browser's console, and access the `gamaas` object directly as it is attached to the `window`.
###Getting started
####.init(configurationObject: Object)
This method is used when setting up your achievements. It accepts an object with specific properties to setup GAMaaS.

*Example*
```javascript
achievements: {
    // One to many achievements
    uniqueAchievementId : {
        title          : "Achievement Title", // The title of your achievement
        worth          : 5, // Number of points the achievement is worth
        required       : 5, // Amount of progress required to achieve the achievement
        exceedRequired : false // Whether or not the achievement progress can exceed what is required
    },
    ...
},
store : {
    when    : "always", // Whether to store the progress upon every action or when you call .store()
    dataKey : "achievements" // Namespace for where to save your achievement progress within localStorage
}
```

####.on(event: string, callback: Function)
####.progress(achievementId: string)
####.regress(achievementId: string)
####.award(achievementId: string)
####.reset(achievementId: string)
