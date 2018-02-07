let fs              = require('fs'),
    Path            = require('path'),
    { spawnSync }   = require('child_process')


let walkListings = function(source, target, copyToTarget) {      
    for(var key in source) {
        let val = source[key] 
        if (!copyToTarget(key, val)) continue;
        if (val===null){
            target[key] = val
        } else {
            let subTarget = {}
            walkListings(val, subTarget, copyToTarget)
            target[key] = subTarget
        }
    }
}

const child = spawnSync('make_xhrfs_index', ['listings.json']);
if (child.error) {
    console.error('make_xhrfs_indexs failed. Do you have browserfs installed (npm -g browserfs)?')
    console.error('Error was: ', child.error);
    
} else {
    console.error(child.stdout.toString())
    console.log(child.stderr.toString())
    console.log('Creating StudOn listing')

    
    try {
        const listings = require('./listings.json')
        let listingsClean = {}

        //removeing sourceode files, and other stuff we do not want to copy to the clients
        walkListings(listings, listingsClean, function(k, v){
            const ext = Path.extname(k)
            if (ext === '.map' || ext === '.java' || ext === '.zip' || ext === '.ts'){
                return false
            }
            if (k === 'listings.json' || k=== 'package-lock.json' || k==='node_modules' || k==='createListings.js') {
                return false
            }
            return true;
        })

        let final = {
            date : Date.now(),
            listings : listingsClean
        }
        console.log(final)
        fs.writeFileSync('cleanListings.json', JSON.stringify(final))
    } catch (e){
        console.error("Error while parsing listings.json:", e)
    }
    
}
