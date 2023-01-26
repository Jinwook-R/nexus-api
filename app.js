import * as dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';

import { fexists } from './src/utils/index.js';
import { go, each, log, takeAll } from "fxjs";
import * as L from "fxjs/Lazy";

import { fetchToken, fetchComponentList, fetchManifest, fetchManifestDetail, fetchConfigLayer, fetchUserInfo } from './src/api.js';

import configLayerAndUserInfo from './src/configLayerAndUserInfo.js';

// 디렉터리 생성
// !fs.existsSync('./static') && fs.mkdir("static", (err) => console.log(err));
// fs.writeFile(`static/manifest.json`, '' , (err) => console.log(err));
// fs.writeFile(`static/manifestDetailInfo.json`, '' , (err) => console.log(err));

(async () => {
    try {
        // 토큰 발급
        const token = await fetchToken();

        // // 컴포넌트 경로 저장
        // await writeManifestPath(token);

        // // 컴포넌트 리스트 가져오기
        // const paths = JSON.parse(fs.readFileSync('./static/manifestPath.json', 'utf8'));
        // const manifestInfo = await (async () => {
        //     const ret = paths.map(async (path) => {
        //         const manifest = await fetchManifest(token, path);
        //         const assetIds = manifest.map((e) => e.assetId);
        //         const sha256Names = manifest.map((e) => e.text);
        //         return { path, assetIds, sha256Names };
        //     });
        //     return Promise.all(ret).then((values) => values);
        // })();

        // fs.appendFileSync(`static/manifest.json`, JSON.stringify(manifestInfo));

        // const assetIdAndSha256Names = JSON.parse(fs.readFileSync('./static/manifest.json', 'utf8'));

        // await go(assetIdAndSha256Names, each(async (assetIdAndSha256Name) => {
        //     const assetIds = assetIdAndSha256Name.assetIds;
        //     const sha256Names = assetIdAndSha256Name.sha256Names;
        //     const path = assetIdAndSha256Name.path;

        //     const manifestDetailInfoObject = {
        //         name: path,
        //         manifest: []
        //     };

        //     const b = await go(
        //         assetIds,
        //         L.map((assetId) => fetchManifestDetail(token, assetId).then(manifestDetail => {
        //             const name = manifestDetail.name;
        //             const createBy = manifestDetail.createdBy;
        //             const createByIp = manifestDetail.createdByIp;
        //             const manifest = { assetId, sha256Name: sha256Names[assetIds.indexOf(assetId)], path: name,  createBy, createByIp };
        //             return manifest;
        //         })),
        //         takeAll,
        //     );
            
        //     manifestDetailInfoObject.manifest = b;
        //     log(manifestDetailInfoObject);
        //     fs.appendFileSync(`static/manifestDetailInfo.json`, JSON.stringify(manifestDetailInfoObject)+'|' , (err) => console.log(err));
        // }));

        const b = fs.readFileSync('./static/manifestDetailInfo.json', 'utf8').split('|');
        
        const manifestDetailInfo = b.slice(0, b.length - 1);
        
        const c = manifestDetailInfo.map((e) => {
            return JSON.parse(e);
        });
        
        fs.writeFileSync(`static/nextManifestDetailInfo.json`, JSON.stringify(c) , (err) => console.log(err));        

        const manifestDetailInfoBySha256Name = c.map(async (manifestDetailInfoOne) => {
            
            const nextManifestInfoOne = manifestDetailInfoOne.manifest;
            configLayerAndUserInfo(token, nextManifestInfoOne).then((e) => {    
                log(e,'!!!!');

            }).catch((err) => log('error: ', err));
            
            // const ret = nextManifestInfoOne.map(async (nextManifestInfoOne) => {
            //     const manifestConfigLayer = await fetchConfigLayer(token, nextManifestInfoOne.path, nextManifestInfoOne.sha256Name, nextManifestInfoOne.createBy);
            //     const configSize = manifestConfigLayer.config.size;
            //     const layerSize = manifestConfigLayer.layers.reduce((sum, currentValue) => {
            //         const currentValueSize = currentValue.size ;
            //         return sum + currentValueSize;
            //     }, 0);

            //         const userId = nextManifestInfoOne.createBy;
            //         const userInfo = await fetchUserInfo(token, userId); 

            //         return { size: configSize + layerSize, ...manifestDetailInfoOneOne };
            //     });                
            return {};
        });

        // fs.appendFileSync(`static/manifestDetailInfoBySha256Name.json`, JSON.stringify(manifestDetailInfoBySha256NameResult));

    } catch(err) {
        console.log(err);
    }

})();

const writeManifestPath = async (token) => {
    let isComponentRest = true;
    let continuationToken = 1;
    let items = []; 

    let cnt = 0;

    const manifestPath = new Map();

    while (isComponentRest) {
        const componentList = await fetchComponentList(token, continuationToken);
        if (!componentList.continuationToken) {
            break;
        }

        continuationToken = componentList.continuationToken;
        items = componentList.items;

        items.map((e) => {
            if(!manifestPath.has(`${e.name}/manifests`)){
                manifestPath.set(`${e.name}/manifests`, {});
            }
        });
        
        cnt += componentList.items.length;
        
        if(cnt >= 10000) break;

        try {
            fs.writeFile('static/manifestPath.json', JSON.stringify(Array.from(manifestPath.keys())), (err) => console.log(err));
        } catch(e) {
            console.log(e);
        }
    }

    return manifestPath;
}
