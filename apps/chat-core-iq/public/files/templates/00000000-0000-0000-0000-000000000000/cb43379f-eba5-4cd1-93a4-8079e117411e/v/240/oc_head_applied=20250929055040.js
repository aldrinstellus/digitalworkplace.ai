$oc = OpenCities = $.extend(true, typeof($oc) === 'object' ? $oc : (typeof(OpenCities) === 'object' ? OpenCities : { }), {
    Ext : (function(){
        var readyQueue = [];
        return function(namespace, objFactory)
        {
            var space = namespace.split('.');
            var currentObj = this;
            var prevObj = null;
            var currentObjWasCreated = false;
            for (var i = 0; i < space.length; i++) {
                var level = space[i];
                if(currentObj.hasOwnProperty(level))
                {
                    var oType = typeof(currentObj);
                    if(oType !== 'object')
                    {
                        throw '\'OpenCities.' + (space.slice(0,i+1).join('.')) + '\' is a \''+oType+'\'. Only \'object\' types may be extended.';
                    } 
                }
                else 
                {
                    currentObj[level] = {};
                    currentObjWasCreated = true;    
                }   
                prevObj = currentObj;
                currentObj = currentObj[level];
            }
            var extObj = (typeof(objFactory) === 'function') ? objFactory.call(currentObj, this) : objFactory;

            if(typeof(extObj) === 'function')
            {
                //The factory has returned a function, so we should try to set it on the last level of the namespace
                //Example call with function factory: $oc.Ext('Path.To.Namespace.functionName', function(){ return function(){console.log('Call me on $oc.Path.To.Namespace.functionName()');} });
                if(currentObjWasCreated)
                {
                    //The current object was created in this function call (it wasn't pre-existing) so we can safely replace with the function
                    prevObj[space[space.length - 1]] = extObj;
                }
                else
                {
                    //The current object already existed and was created outside this function call. We can't replace it.
                    throw '\'OpenCities.' + (space.join('.')) + '\' already exists as an \'object\' and cannot be replaced with a \'function\'.';

                }
            } 
            else 
            {
                //The factory has returned an object, so extend with the currentObj
                //Example call with object literal: $oc.Ext('Path.To.Namespace', {'functionName':function(){console.log('Call me on $oc.Path.To.Namespace.functionName()')});
                //Example call with object factory: $oc.Ext('Path.To.Namespace', function(){ return {'functionName':function(){console.log('Call me on $oc.Path.To.Namespace.functionName()')}}});
                $.extend(true, currentObj, extObj);           
            }

            if($oc.hasOwnProperty('__setReady'))
            {
                while(readyQueue.length > 0)
                {
                    //loop through all the ready events for when __setReady was unavailable
                    $oc.__setReady(readyQueue.shift());
                }
                $oc.__setReady(namespace);
            } else {
                readyQueue.push(namespace);
            }
        }
    })()
});


$oc.Ext('Ready', function(ocObj){
    var objs = {};
    var objOrder = [];
    var mainName = '__main_ready';

    ocObj.Ext('__setReady', function(ocObj){
        return function(name)
        {
            if(arguments.length === 0)
            {
                //Called as $oc.__setReady() which is the general "all ready" function
                //So we need to loop over all objects and run their ready functions
                //and then run the main ready function.
                for (var i = 0; i < objOrder.length; i++) {
                    var name = objOrder[i];
                    if(spaceExists(name))
                    {
                        doReady(name);
                    } else {
                        console.warn('$oc.' + name + ' object does not exist. $oc.Ready() functions relying on it may not run.')
                    }
                }
                doReady();

            } else {
                //Called as $oc.__setReady('Path.To.Namespace')
                //So just run the ready function for that
                doReady(name);
            }
        }
    });

    function spaceExists(namespace)
    {
        return getSpace(namespace) !== null;
    }

    function getSpace(namespace)
    {
        var space = namespace.split('.');
        var currentObj = ocObj;
        for (var i = 0; i < space.length; i++) {
            var level = space[i];
            if(!currentObj.hasOwnProperty(level))
            {
                return null;
            }
            currentObj = currentObj[level];
        }
        return currentObj;
    }

    function doReady(name)
    {
        var obj = getReadyObj(name);
        var thisScope = getNamespaceScope(obj);
        obj.isReady = true;         
        while(obj.callbacks.length > 0)
        {
            obj.callbacks.shift().call(thisScope, ocObj);
        }
    }

    function getNamespaceScope(obj)
    {
        return (obj.namespace !== mainName) ? getSpace(obj.namespace) : ocObj;
    }

    function getReadyObj(name)
    {
        name = getReadyName(name);
        if(!objs.hasOwnProperty(name))
        {
            objs[name] = createReadyObj(name);
            if(name !== mainName)
            {
                objOrder.push(name);
            }
        }
        return objs[name];
    }

    function createReadyObj(name)
    {
        return {'namespace' : name, 'isReady' : false, 'callbacks' : []};
    }

    function getReadyName(name)
    {
        return name || mainName;
    }


    //Usage:
    //$oc.Ready('Path.To.Namespace', function(ocObj){}); //Called immediately after $oc.Path.To.Namespace is created by $oc.Ext('Path.To.Namespace', ...)
    //$oc.Ready(function(ocObj){}); //Called on OC framework ready
    return function()
    {
        var obj, callback;

        if(arguments.length === 1)
        {
            obj = getReadyObj();
            callback = arguments[0];
        }
        else if (arguments.length > 1)
        {
            obj = getReadyObj(arguments[0]);
            callback = arguments[1]
        }


        if(obj.isReady)
        {
            var thisScope = getNamespaceScope(obj);         
            callback.call(thisScope, ocObj);
        }
        else
        {
            obj.callbacks.push(callback);
        }
    }
});
