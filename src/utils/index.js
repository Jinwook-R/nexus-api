import {access} from 'fs/promises';

const fexists = async (path) => {
    try {
        await access(path);
        return true;
    }catch (e) {
        return false;
    }
}

export { fexists };