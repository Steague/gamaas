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
## Quickstart
To get started quickly, run the below command to run the application in a Webpack'd server.

```
npm run start
```
Now point your browser to `http://localhost:8090/`, open your browser's console, and access the `gamaas` object directly as it is attached to the `window`.
## Getting started
### .init(configOnject: Object): Gamaas
This method is used when setting up your achievements. It accepts an object with specific properties to setup GAMaaS.
#### Parameters
|Param|Required|Type|Description|
|---|---|---|---|
|configOnject|Yes|Object|An object with specific properties to setup GAMaaS|

#### Returns
|Return|Type|
|---|---|
|gamaas|Object|

#### Example
```javascript
import gamaas from 'gamaas';

gamaas.init({
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
});
```

### .on(event: string, callback: Function): Gamaas
The `.on()` method requires two parameters, `event` and `callback`. The event can be one of four different types which include `progress`, `regress`, `reset` or `award`. `.on()` is not required for GAMaaS to function. When any of the events occur, their associated callback function is called. The parameter passed to the callback function is a single object containing the `id` of the achievement affected along with the `event` that fired.

#### Parameters
|Param|Required|Type|Description|
|---|---|---|---|
|event|Yes|String|`progress` or `regress` or `reset` or `award`|
|callback|Yes|Function|The function to be called when event occurs.|

#### Returns
|Return|Type|
|---|---|
|gamaas|Object|

#### Example
```javascript
import gamaas from 'gamaas';

gamaas.init({
    // Config Object
}).on('progress', ({id, event}) => {
    console.log("A progress event!", id, event);
});
```
### .progress(id: string, awarded?: Boolean = true): Gamaas
The `.progress()` method is used when incrementing the progress (by 1) of the achievement. In this way if an achievement's progress is currently `1` and you `.progress()` the achievement, it will then be `2`. if `exceedRequired` is specified and is truthy, then `.progress()` will not allow the progress to exceed the value specified in the `required` property of the achievement.

#### Parameters
|Param|Required|Type|Description|
|---|---|---|---|
|id|Yes|string|The id of the achievement you wish to progress.|
|awarded|No|Boolean|Whether or not you want to award the achievement when the progress meets its requirements. Defaults to `true`.|

#### Returns
|Return|Type|
|---|---|
|gamaas|Object|

#### Example
```javascript
import gamaas from 'gamaas';

gamaas.init({
    // Config Object
}).progress('achievementId');
```
### .regress(id: string, awarded?: Boolean = true): Gamaas
The `.regress()` method is used when decrementing the progress (by 1) of the achievement. In this way if an achievement's progress is currently `3` and you `.regress()` the achievement, it will then be `2`. Achievements can not be reduced below 0.

#### Parameters
|Param|Required|Type|Description|
|---|---|---|---|
|id|Yes|string|The id of the achievement you wish to regress.|
|awarded|No|Boolean|Whether or not you want to un-award the achievement when the progress is below or equal to its requirements. Defaults to `true`.|

#### Returns
|Return|Type|
|---|---|
|gamaas|Object|

#### Example
```javascript
import gamaas from 'gamaas';

gamaas.init({
    // Config Object
}).regress('achievementId');
```
### .award(id: string, awarded?: Boolean = true, reason: string = "Unknown"): Gamaas
The `.award()` method allows you to set the awarded status of an achievement which causes the progress event to be fired.

#### Parameters
|Param|Required|Type|Description|
|---|---|---|---|
|id|Yes|string|The id of the achievement you wish to award.|
|awarded|No|Boolean|The awarded state of the achievement id specified. Defaults to `true`.|
|reason|No|string|A short description of why the award was given (or taken away). Defaults to `Unknown`.|

#### Returns
|Return|Type|
|---|---|
|gamaas|Object|

#### Example
```javascript
import gamaas from 'gamaas';

gamaas.init({
    // Config Object
}).award('achievementId');
```
### .reset(id: string, awarded?: Boolean = true): Gamaas

#### Parameters
|Param|Required|Type|Description|
|---|---|---|---|
|id|Yes|string|The id of the achievement you wish to reset.|
|awarded|No|Boolean|Whether or not you want to un-award the achievement when the achievement is rest. Defaults to `true`.|

#### Returns
|Return|Type|
|---|---|
|gamaas|Object|

### .store(): Gamaas
Stores the progress of the achievements to `localStorage`. This is called automatically when you `progress`, `regress`, `award` or `reset` achievements when the `store.when` config value is set to `always` when you `.init()` GAMaaS.

#### Returns
|Return|Type|
|---|---|
|gamaas|Object|
