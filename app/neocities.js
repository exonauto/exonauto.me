import { POSTreq } from 'postreq';

if (window.location.hostname.split('.')[1] == 'neocities'){
    const pt = new POSTreq.POSTreq();
    window.fetch = pt.getPolyfill()
}