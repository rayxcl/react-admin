import { queryParameters, fetchJson } from '../util/fetch';
import {
    CRUD_GET_LIST,
    CRUD_GET_ONE,
    CRUD_GET_MANY,
    CRUD_CREATE,
    CRUD_UPDATE,
    CRUD_DELETE,
} from '../actions/dataActions';

export default (apiUrl) => {
    /**
     * @returns {Promise} The request response
     */
    const fetch = (type, resource, payload) => {
        let url = '';
        const options = {};
        switch (type) {
        case CRUD_GET_LIST: {
            const { page, perPage } = payload.pagination;
            const { field, order } = payload.sort;
            const query = {
                sort: JSON.stringify([field, order]),
                range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            };
            url = `${apiUrl}/${resource}?${queryParameters(query)}`;
            break;
        }
        case CRUD_GET_ONE:
            url = `${apiUrl}/${resource}/${payload.id}`;
            break;
        case CRUD_GET_MANY: {
            const query = {
                filter: JSON.stringify({ id: payload.ids }),
            };
            url = `${apiUrl}/${resource}?${queryParameters(query)}`;
            break;
        }
        case CRUD_UPDATE:
            url = `${apiUrl}/${resource}/${payload.id}`;
            options.method = 'PUT';
            options.body = JSON.stringify(payload.data);
            break;
        case CRUD_CREATE:
            url = `${apiUrl}/${resource}`;
            options.method = 'POST';
            options.body = JSON.stringify(payload.data);
            break;
        default:
            throw new Error(`Unsupported fetch action type ${type}`);
        }
        return fetchJson(url, options);
    };

    /**
     * @returns {Object} success action payload
     */
    const convertResponse = (type, resource, payload, response) => {
        const { headers, json } = response;
        switch (type) {
        case CRUD_GET_LIST:
            return {
                data: json.map(x => x),
                total: parseInt(headers['content-range'].split('/').pop(), 10),
            };
        case CRUD_CREATE:
            return {
                data: { ...payload.data, id: json.id },
            };
        default:
            return {
                data: json,
            };
        }
    };

    return { fetch, convertResponse };
};