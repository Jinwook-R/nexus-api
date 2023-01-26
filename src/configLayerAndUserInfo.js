import { go, log, takeAll } from "fxjs";
import * as L from "fxjs/Lazy";
import { fetchConfigLayer, fetchUserInfo } from './api.js';

const configLayerAndUserInfo = async (token, list) => {
    return await go(
        list,
        L.map((nextManifestInfoOneOne) => fetchConfigLayer(token, nextManifestInfoOneOne.path, nextManifestInfoOneOne.sha256Name, nextManifestInfoOneOne.createBy).then((manifestConfigLayer) => {
            log(nextManifestInfoOneOne)
            const configSize = manifestConfigLayer.config.size;
            const layerSize = manifestConfigLayer.layers.reduce((sum, currentValue) => {
                const currentValueSize = currentValue.size ;
                return sum + currentValueSize;
            }, 0);    
            return { size: configSize + layerSize, ...nextManifestInfoOneOne};
        })),
        L.map((nextManifestInfoOneOne) => fetchUserInfo(token, nextManifestInfoOneOne.createBy).then((userInfo) => {
            if(!userInfo.length) {
                return nextManifestInfoOneOne;
            } else {
                return { ...nextManifestInfoOneOne, ...userInfo[0] };
            }
            
        })),
        takeAll
    );
}

export default configLayerAndUserInfo;