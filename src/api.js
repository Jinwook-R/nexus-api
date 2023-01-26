import axios from "axios";
import https from 'https';

const fetchToken = async () =>
    await axios.post('https://nexus.dspace.kt.co.kr/service/rest/wonderland/authenticate', {
        u: process.env.ENCODED_NEXUS_USER_NAME,
        p: process.env.ENCODED_NEXUS_USER_PASSWORD,
    },{
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        auth: {
            username: process.env.NEXUS_USER_NAME,
            password: process.env.NEXUS_USER_PASSWORD,
        }
    }    
    ).then((res) => {
        return res.data.t;
    }).catch((err) => {
        console.log(err);
        throw Error(err);
    });

const fetchComponentList = async (token, continuationToken) => await axios.get(`https://nexus.dspace.kt.co.kr/service/rest/v1/search`, {
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-NX-AuthTicket': `${token}`,
    },
    auth: {
        username: process.env.NEXUS_USER_NAME,
        password: process.env.NEXUS_USER_PASSWORD,
    },
    params: {
        repository: 'docker-dspace-host',
        direction: 'asc',
        continuationToken: continuationToken === 1 ? undefined : continuationToken,
    }
}).then((res) => {
    return res.data
}
).catch((err) => {
    console.log(err);
    throw Error(err);
});

const fetchManifest = async (token, path) => await axios.post(`https://nexus.dspace.kt.co.kr/service/extdirect`,
    {
        action : "coreui_Browse",
        method : "read",
        data : [
                    {
                        "repositoryName": "docker-dspace-host",
                        "node" : `v2/${path}`,
                    }
                ],
        type : "rpc",
        tid : 122
    },
    {
        headers : {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-NX-AuthTicket': `${token}`,
        },
        auth : {
            username: process.env.NEXUS_USER_NAME,
            password: process.env.NEXUS_USER_PASSWORD,
        },
    }
).then((res) => {
    return res.data.result.data;
}).catch((err) => {
    console.log('error: ', path);
    throw Error(err);
});

const fetchManifestDetail = (token, assetId) => axios.post(`https://nexus.dspace.kt.co.kr/service/extdirect`,
    {
        action: "coreui_Component",
        method: "readAsset",
        data: [
            assetId,
            "docker-dspace-host"
        ],
        type: 'rpc',
        tid: 14
    },
    {
        headers : {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-NX-AuthTicket': `${token}`,
        },
        auth : {
            username: process.env.NEXUS_USER_NAME,
            password: process.env.NEXUS_USER_PASSWORD,
        }
    }
    ).then((res) => {
        return res.data.result.data;
    }).catch((err) => {
        console.log(err);
        // throw Error(err);
    });

const fetchConfigLayer = async (token, path, sha256, userId) => axios.get(`https://nexus.dspace.kt.co.kr/repository/docker-dspace-host/${path}`, {
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-NX-AuthTicket': `${token}`,
    },
    auth : {
        username: process.env.NEXUS_USER_NAME,
        password: process.env.NEXUS_USER_PASSWORD,
    },
}).then((e) => {
    return e.data;
}).catch((err) => {
    throw Error(err);
});

const fetchUserInfo = (token, userId) => { 
    return axios.get(`https://nexus.dspace.kt.co.kr/service/rest/v1/security/users?userId=${userId}`, {
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-NX-AuthTicket': `${token}`,
    },
    auth : {
        username: process.env.NEXUS_USER_NAME,
        password: process.env.NEXUS_USER_PASSWORD,
    },
}).then((e) => {
    // console.log(e.data,'!!!!!');
    return e.data;
}).catch((err) => {
    console.log(err);
    if (err.response) {
        // The client was given an error response (5xx, 4xx)
        // console.log(err.response.data);
        // console.log(userId, err.response.status);
        // console.log(err.response.headers);
    } else if (err.request) {
        // The client never received a response, and the request was never left
        // console.log('The client never received a response, and the request was never left');
    } else {
        // Anything else
    }

    throw Error(err);
})

}

export { fetchToken, fetchComponentList, fetchManifest, fetchManifestDetail, fetchConfigLayer, fetchUserInfo };